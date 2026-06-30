import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success even if user doesn't exist (security)
    if (!user) {
      return NextResponse.json({ message: "Reset link sent" }, { status: 200 })
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    // Save token to DB
    await prisma.verificationToken.upsert({
      where: { identifier_token: { identifier: email, token } },
      update: { token, expires },
      create: { identifier: email, token, expires },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${email}`

    // Send email
    await resend.emails.send({
      from: "Travely <onboarding@resend.dev>",
      to: email,
      subject: "Reset your Travely password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #111;">Reset your password</h2>
          <p style="color: #555;">Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" 
             style="display: inline-block; background: #40916c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
            Reset password
          </a>
          <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    })

    return NextResponse.json({ message: "Reset link sent" }, { status: 200 })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}