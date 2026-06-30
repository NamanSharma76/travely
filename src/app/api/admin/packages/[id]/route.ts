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
    const { isActive } = await req.json()

    await prisma.package.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin package toggle error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}