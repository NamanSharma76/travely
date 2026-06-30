// src/app/api/auth/otp/send/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import twilio from "twilio"

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function normalizePhone(phone: string): string {
  // Ensure +91 prefix for Indian numbers if not already international
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 10) return `+91${cleaned}`
  if (phone.startsWith("+")) return phone
  return `+${cleaned}`
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 })
    }

    const normalizedPhone = normalizePhone(phone)

    // Rate limit: check if an OTP was sent in the last 60 seconds
    const recentOtp = await prisma.otpVerification.findFirst({
      where: {
        phone: normalizedPhone,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
    })

    if (recentOtp) {
      return NextResponse.json({
        error: "Please wait before requesting another OTP"
      }, { status: 429 })
    }

    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min expiry

    // Save OTP to DB
    await prisma.otpVerification.create({
      data: { phone: normalizedPhone, otp, expiresAt },
    })

    // Send SMS via Twilio
    await client.messages.create({
      body: `Your Travely verification code is ${otp}. Valid for 10 minutes. Do not share this code.`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: normalizedPhone,
    })

    return NextResponse.json({ message: "OTP sent successfully" })
  } catch (error: any) {
    console.error("Send OTP error:", error)

    // Twilio trial accounts can only send to verified numbers
    if (error?.code === 21608) {
      return NextResponse.json({
        error: "This number isn't verified for our trial SMS account. Contact support."
      }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
  }
}