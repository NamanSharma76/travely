import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { isActive } = await req.json()

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    })

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    const story = await prisma.story.findFirst({
      where: { id, providerId: provider.id },
    })

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    await prisma.story.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Toggle story error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}