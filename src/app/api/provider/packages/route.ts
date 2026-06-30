// src/app/api/provider/packages/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { PackageCategory } from "@prisma/client"

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

    const body = await req.json()
    const {
      title, description, country, destination,
      category, durationDays, pricePerPerson,
      maxTravelers, inclusions, exclusions, images,
    } = body

    const pkg = await prisma.package.create({
      data: {
        providerId: provider.id,
        title,
        slug: generateSlug(title),
        description,
        country,
        destination,
        category: category as PackageCategory,
        durationDays: parseInt(durationDays),
        pricePerPerson: parseFloat(pricePerPerson),
        maxTravelers: parseInt(maxTravelers),
        inclusions,
        exclusions,
        images,
        isActive: true,
      },
    })

    return NextResponse.json({ packageId: pkg.id }, { status: 201 })
  } catch (error) {
    console.error("Create package error:", error)
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

    const packages = await prisma.package.findMany({
      where: { providerId: provider.id },
      include: { _count: { select: { bookings: true, reviews: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ packages })
  } catch (error) {
    console.error("Get packages error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}