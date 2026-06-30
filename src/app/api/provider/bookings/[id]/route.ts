import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { status } = await req.json()

    const validStatuses = ["CONFIRMED", "REJECTED", "COMPLETED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Verify booking belongs to provider's package
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    })

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        package: { providerId: provider.id },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ booking: updated })
  } catch (error) {
    console.error("Update booking error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}