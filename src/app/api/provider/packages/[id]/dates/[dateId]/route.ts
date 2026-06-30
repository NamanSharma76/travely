// src/app/api/provider/packages/[id]/dates/[dateId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; dateId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id, dateId } = await params

    const provider = await prisma.provider.findUnique({ where: { userId: session.user.id } })
    if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 })

    // Verify package belongs to provider
    const pkg = await prisma.package.findFirst({
      where: { id, providerId: provider.id },
    })
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 })

    // Check no confirmed bookings use this date
    const bookings = await prisma.booking.findFirst({
      where: {
        availableDateId: dateId,
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    })

    if (bookings) {
      return NextResponse.json(
        { error: "Cannot delete a date with active bookings" },
        { status: 400 }
      )
    }

    await prisma.availableDate.delete({ where: { id: dateId } })

    return NextResponse.json({ message: "Date deleted" })
  } catch (error) {
    console.error("Delete date error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}