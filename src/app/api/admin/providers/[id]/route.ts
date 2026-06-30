import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { status, userId } = await req.json()

    const validStatuses = ["VERIFIED", "REJECTED", "SUSPENDED", "PENDING"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update provider status
    await prisma.provider.update({
      where: { id },
      data: { status },
    })

    // Update user role when verifying or revoking
    if (status === "VERIFIED") {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "PROVIDER" },
      })
    } else if (status === "REJECTED" || status === "SUSPENDED") {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "USER" },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin provider update error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}