import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const FAQ_CONTEXT = `
TRAVELY PLATFORM FACTS (use only these, never invent policy details):
- Payments are processed via Razorpay (test mode currently).
- A 2% platform fee is added to every booking on top of the package price.
- Bookings start as PENDING, then a provider can mark them CONFIRMED or REJECTED.
- Reviews can only be left after a booking is marked COMPLETED by the provider.
- To become a travel provider, a user goes to /become-provider and submits a form for admin review.
- Users can browse packages without an account, but must sign in to book.
- Support for refund/cancellation specifics should be directed to: "please check the specific package's cancellation policy or contact support" — do not invent refund timelines or percentages.
`

const tools = [
  {
    type: "function" as const,
    function: {
      name: "search_packages",
      description: "Search travel packages by destination, category, budget, or duration. Use this whenever the user asks to find, recommend, or browse trips/packages.",
      parameters: {
        type: "object",
        properties: {
          destination: { type: "string", description: "Destination or city name to search for" },
          category: {
            type: "string",
            enum: ["ADVENTURE", "BEACH", "HONEYMOON", "CULTURAL", "WILDLIFE", "PILGRIMAGE", "FAMILY", "LUXURY", "BUDGET", "GROUP"],
            description: "Type of trip",
          },
          maxBudget: { type: "number", description: "Maximum price per person in INR" },
          maxDuration: { type: "number", description: "Maximum trip duration in days" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_my_bookings",
      description: "Fetch the current logged-in user's bookings. Use this when the user asks about their booking status, upcoming trips, or past trips.",
      parameters: { type: "object", properties: {} },
    },
  },
]

async function searchPackages(args: {
  destination?: string
  category?: string
  maxBudget?: number
  maxDuration?: number
}) {
  const where: any = { isActive: true }

  if (args.destination) {
    where.OR = [
      { destination: { contains: args.destination, mode: "insensitive" } },
      { country: { contains: args.destination, mode: "insensitive" } },
      { title: { contains: args.destination, mode: "insensitive" } },
    ]
  }
  if (args.category) where.category = args.category
  if (args.maxBudget) where.pricePerPerson = { lte: args.maxBudget }
  if (args.maxDuration) where.durationDays = { lte: args.maxDuration }

  const packages = await prisma.package.findMany({
    where,
    select: {
      title: true,
      slug: true,
      destination: true,
      country: true,
      category: true,
      durationDays: true,
      pricePerPerson: true,
      avgRating: true,
    },
    orderBy: { avgRating: "desc" },
    take: 5,
  })

  return packages.map((p) => ({
    ...p,
    pricePerPerson: Number(p.pricePerPerson),
    url: `/packages/${p.slug}`,
  }))
}

async function getMyBookings(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      package: { select: { title: true, slug: true, destination: true } },
      availableDate: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  return bookings.map((b) => ({
    package: b.package.title,
    destination: b.package.destination,
    status: b.status,
    travelDate: b.availableDate.startDate.toISOString().split("T")[0],
    travelers: b.travelers,
    totalAmount: Number(b.totalAmount),
    url: `/bookings`,
  }))
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messages, packageContext } = await req.json()

    const systemPrompt = `You are Travely's helpful travel assistant. You help users find packages, check their bookings, and answer questions about how the platform works.

${FAQ_CONTEXT}

${packageContext ? `The user is currently viewing this package: ${JSON.stringify(packageContext)}. Use this context if relevant to their question.` : ""}

Rules:
- ALWAYS use the search_packages or get_my_bookings tools to fetch real data before answering questions about packages or bookings. Never invent package names, prices, or booking statuses.
- For questions about policy (refunds, payments, becoming a provider), answer ONLY using the facts given above. If something isn't covered, say you're not certain and suggest contacting support.
- Keep responses concise and conversational, 2-4 sentences typically.
- When recommending packages, mention 2-3 max with their price and a link.
- Never make up information about specific packages you haven't retrieved via the tool.`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      tools,
      tool_choice: "auto",
      temperature: 0.4,
      max_tokens: 600,
    })

    const responseMessage = completion.choices[0].message

    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolResults = await Promise.all(
        responseMessage.tool_calls.map(async (toolCall) => {
          const args = JSON.parse(toolCall.function.arguments)
          let result

          if (toolCall.function.name === "search_packages") {
            result = await searchPackages(args)
          } else if (toolCall.function.name === "get_my_bookings") {
            result = await getMyBookings(session.user.id)
          } else {
            result = { error: "Unknown tool" }
          }

          return {
            tool_call_id: toolCall.id,
            role: "tool" as const,
            content: JSON.stringify(result),
          }
        })
      )

      const followUp = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
          responseMessage,
          ...toolResults,
        ],
        temperature: 0.4,
        max_tokens: 600,
      })

      return NextResponse.json({
        message: followUp.choices[0].message.content,
      })
    }

    return NextResponse.json({ message: responseMessage.content })
  } catch (error) {
    console.error("Chatbot error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}