import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json()

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Find token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { identifier_token: { identifier: email, token } },
    })

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: email, token } },
      })
      return NextResponse.json({ error: "Reset link has expired" }, { status: 400 })
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 12)
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    // Delete used token
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    })

    return NextResponse.json({ message: "Password reset successfully" }, { status: 200 })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}