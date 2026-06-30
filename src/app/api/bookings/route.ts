import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { packageId, availableDateId, travelers, notes, totalAmount } = await req.json()

    if (!packageId || !availableDateId || !travelers || !totalAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check available date still has spots
    const availableDate = await prisma.availableDate.findUnique({
      where: { id: availableDateId },
    })

    if (!availableDate || !availableDate.isAvailable) {
      return NextResponse.json({ error: "Selected date is no longer available" }, { status: 400 })
    }

    if (availableDate.spotsLeft < travelers) {
      return NextResponse.json({
        error: `Only ${availableDate.spotsLeft} spots left for this date`
      }, { status: 400 })
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        packageId,
        availableDateId,
        travelers,
        totalAmount,
        notes,
        status: "PENDING",
      },
    })

    // Reserve spots
    await prisma.availableDate.update({
      where: { id: availableDateId },
      data: { spotsLeft: { decrement: travelers } },
    })

    return NextResponse.json({ bookingId: booking.id }, { status: 201 })
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: {
        package: {
          select: {
            title: true,
            slug: true,
            images: true,
            destination: true,
            country: true,
            durationDays: true,
          },
        },
        availableDate: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Bookings GET error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}