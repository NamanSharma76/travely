import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json()

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Update payment status
    await prisma.payment.updateMany({
      where: { bookingId, gatewayOrderId: razorpay_order_id },
      data: {
        gatewayPaymentId: razorpay_payment_id,
        status: "SUCCESS",
      },
    })

    // Update booking status
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        paidAmount: { set: (await prisma.booking.findUnique({ where: { id: bookingId } }))?.totalAmount ?? 0 },
      },
    })

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error("Verify payment error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}