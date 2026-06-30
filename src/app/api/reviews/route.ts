import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { packageId, bookingId, rating, title, body } = await req.json()

    if (!packageId || !bookingId || !rating || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    if (body.length < 20) {
      return NextResponse.json({ error: "Review must be at least 20 characters" }, { status: 400 })
    }

    // Verify booking exists, belongs to user, and is COMPLETED
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: session.user.id,
        packageId,
        status: "COMPLETED",
      },
    })

    if (!booking) {
      return NextResponse.json({
        error: "You can only review packages you have completed"
      }, { status: 403 })
    }

    // Check if already reviewed this booking
    const existing = await prisma.review.findUnique({
      where: { bookingId },
    })

    if (existing) {
      return NextResponse.json({
        error: "You have already reviewed this booking"
      }, { status: 409 })
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        packageId,
        bookingId,
        rating,
        title: title || null,
        body,
      },
    })

    // Update package avgRating and totalReviews
    const allReviews = await prisma.review.findMany({
      where: { packageId },
      select: { rating: true },
    })

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.package.update({
      where: { id: packageId },
      data: {
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: allReviews.length,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error("Review error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const packageId = searchParams.get("packageId")

    if (!packageId) {
      return NextResponse.json({ error: "packageId required" }, { status: 400 })
    }

    const reviews = await prisma.review.findMany({
      where: { packageId },
      include: {
        user: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("Get reviews error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}