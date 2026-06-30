import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { signIn } from "@/auth"

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 10) return `+91${cleaned}`
  if (phone.startsWith("+")) return phone
  return `+${cleaned}`
}

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, name } = await req.json()

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 })
    }

    const normalizedPhone = normalizePhone(phone)

    // Find the latest unverified OTP for this phone
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        phone: normalizedPhone,
        verified: false,
      },
      orderBy: { createdAt: "desc" },
    })

    if (!otpRecord) {
      return NextResponse.json({ error: "OTP not found. Please request a new one." }, { status: 400 })
    }

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 })
    }

    if (otpRecord.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 })
    }

    // Mark OTP as verified
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    })

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    })

    let isNewUser = false

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          name: name || `User ${normalizedPhone.slice(-4)}`,
          role: "USER",
        },
      })
      isNewUser = true
    }

    return NextResponse.json({
      message: "OTP verified successfully",
      userId: user.id,
      phone: user.phone,
      isNewUser,
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}