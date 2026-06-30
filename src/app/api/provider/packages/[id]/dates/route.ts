// src/app/api/provider/packages/[id]/dates/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// GET all dates for a package
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const provider = await prisma.provider.findUnique({ where: { userId: session.user.id } })
    if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 })

    // Verify package belongs to provider
    const pkg = await prisma.package.findFirst({
      where: { id, providerId: provider.id },
    })
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 })

    const dates = await prisma.availableDate.findMany({
      where: { packageId: id },
      orderBy: { startDate: "asc" },
    })

    return NextResponse.json({ dates })
  } catch (error) {
    console.error("Get dates error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// POST add a new date
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const { startDate, endDate, spotsLeft } = await req.json()

    if (!startDate || !endDate || !spotsLeft) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const provider = await prisma.provider.findUnique({ where: { userId: session.user.id } })
    if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 })

    const pkg = await prisma.package.findFirst({
      where: { id, providerId: provider.id },
    })
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 })

    const date = await prisma.availableDate.create({
      data: {
        packageId: id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        spotsLeft: parseInt(spotsLeft),
        isAvailable: true,
      },
    })

    return NextResponse.json({ date }, { status: 201 })
  } catch (error) {
    console.error("Add date error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}