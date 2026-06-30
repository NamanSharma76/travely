import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PackageCategory, Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") ?? ""
    const category = searchParams.get("category") ?? ""
    const duration = searchParams.get("duration") ?? ""
    const budget = searchParams.get("budget") ?? ""
    const sort = searchParams.get("sort") ?? "rating"
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "12")

    // Build where clause
    const where: Prisma.PackageWhereInput = {
      isActive: true,
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { destination: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category && Object.values(PackageCategory).includes(category as PackageCategory)) {
      where.category = category as PackageCategory
    }

    if (duration) {
      if (duration === "1-3") where.durationDays = { gte: 1, lte: 3 }
      else if (duration === "4-6") where.durationDays = { gte: 4, lte: 6 }
      else if (duration === "7-10") where.durationDays = { gte: 7, lte: 10 }
      else if (duration === "10+") where.durationDays = { gte: 10 }
    }

    if (budget) {
      if (budget === "0-15000") where.pricePerPerson = { lte: 15000 }
      else if (budget === "15000-30000") where.pricePerPerson = { gte: 15000, lte: 30000 }
      else if (budget === "30000-60000") where.pricePerPerson = { gte: 30000, lte: 60000 }
      else if (budget === "60000+") where.pricePerPerson = { gte: 60000 }
    }

    // Build orderBy
    let orderBy: Prisma.PackageOrderByWithRelationInput = { avgRating: "desc" }
    if (sort === "price_asc") orderBy = { pricePerPerson: "asc" }
    else if (sort === "price_desc") orderBy = { pricePerPerson: "desc" }
    else if (sort === "duration_asc") orderBy = { durationDays: "asc" }
    else if (sort === "newest") orderBy = { createdAt: "desc" }

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          provider: {
            select: { businessName: true, status: true },
          },
        },
      }),
      prisma.package.count({ where }),
    ])

    return NextResponse.json({ packages, total, page, limit })
  } catch (error) {
    console.error("Packages API error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}