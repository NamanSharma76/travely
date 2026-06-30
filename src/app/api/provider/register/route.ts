import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { businessName, description, phone, website } = await req.json()

    if (!businessName || !description || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if already a provider
    const existing = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    })

    if (existing) {
      return NextResponse.json({ error: "You already have a provider account" }, { status: 409 })
    }

    // Create provider
    await prisma.provider.create({
      data: {
        userId: session.user.id,
        businessName,
        description,
        phone,
        website: website || null,
        status: "PENDING",
      },
    })

    return NextResponse.json({ message: "Application submitted successfully" }, { status: 201 })
  } catch (error) {
    console.error("Provider register error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}