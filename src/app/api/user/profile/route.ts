// src/app/api/user/profile/route.ts
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

    const { name } = await req.json()

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    })

    return NextResponse.json({ message: "Profile updated" })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}