import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const pkg = await prisma.package.findFirst({
      where: { slug, isActive: true },
      include: {
        provider: { select: { businessName: true, status: true } },
        availableDates: {
          where: { isAvailable: true, startDate: { gte: new Date() } },
          orderBy: { startDate: "asc" },
          take: 6,
        },
      },
    })

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    return NextResponse.json(pkg)
  } catch (error) {
    console.error("Package API error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}