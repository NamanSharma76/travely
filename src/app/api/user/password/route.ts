import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user?.password) {
      return NextResponse.json({
        error: "Password change not available for OAuth accounts"
      }, { status: 400 })
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    })

    return NextResponse.json({ message: "Password updated" })
  } catch (error) {
    console.error("Password update error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}