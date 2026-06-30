import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim() + "-" + Date.now()
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    })

    if (!provider || provider.status !== "VERIFIED") {
      return NextResponse.json({ error: "Provider not verified" }, { status: 403 })
    }

    const { packageId, title, excerpt, content, coverImage, images } = await req.json()

    if (!packageId || !title || !excerpt || !content || !coverImage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the package belongs to this provider
    const pkg = await prisma.package.findFirst({
      where: { id: packageId, providerId: provider.id },
    })

    if (!pkg) {
      return NextResponse.json({ error: "Invalid package selected" }, { status: 400 })
    }

    const story = await prisma.story.create({
      data: {
        providerId: provider.id,
        packageId,
        title,
        slug: generateSlug(title),
        excerpt,
        content,
        coverImage,
        images: images ?? [],
        isActive: true,
      },
    })

    return NextResponse.json({ storyId: story.id }, { status: 201 })
  } catch (error) {
    console.error("Create story error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    })

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    const stories = await prisma.story.findMany({
      where: { providerId: provider.id },
      include: { package: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ stories })
  } catch (error) {
    console.error("Get stories error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}