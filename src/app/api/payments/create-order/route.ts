// src/app/api/payments/create-order/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bookingId, amount } = await req.json()

    // Verify booking belongs to user
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: session.user.id },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Create Razorpay order (amount in paise)
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: bookingId,
    })

    // Save payment record
    await prisma.payment.create({
      data: {
        bookingId,
        amount,
        currency: "INR",
        gateway: "RAZORPAY",
        gatewayOrderId: order.id,
        status: "PENDING",
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
  }
}