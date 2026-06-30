// ─── Booking Confirmation Page ───
// src/app/bookings/[id]/confirmation/page.tsx

import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { Check, MapPin, Clock, Calendar, Users, ArrowRight } from "lucide-react"

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const booking = await prisma.booking.findFirst({
    where: { id, userId: session.user.id },
    include: {
      package: true,
      availableDate: true,
    },
  })

  if (!booking) notFound()

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    })

  const formatPrice = (price: any) =>
    `₹${Number(price).toLocaleString("en-IN")}`

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 flex items-center justify-center px-6">
      <div className="max-w-lg w-full space-y-6">

        {/* Success Icon */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[var(--accent-soft)] border-2 border-[color:var(--accent-border-strong)] flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display'] mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-[var(--text-secondary)]">
              Your adventure is booked. Get ready to explore!
            </p>
          </div>
        </div>

        {/* Booking Details */}
        <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
          <div className="flex gap-4">
            {booking.package.images[0] && (
              <img
                src={booking.package.images[0]}
                alt={booking.package.title}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
            )}
            <div>
              <h2 className="text-[var(--text)] font-semibold font-['Playfair_Display']">
                {booking.package.title}
              </h2>
              <div className="flex items-center gap-1 text-[var(--text-secondary)] text-xs mt-1">
                <MapPin className="w-3 h-3" />
                {booking.package.destination}, {booking.package.country}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
            <div className="p-3 rounded-xl bg-[var(--surface-2)]">
              <p className="text-[var(--text-muted)] text-xs mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Travel Date
              </p>
              <p className="text-[var(--text)] text-sm font-medium">
                {formatDate(booking.availableDate.startDate)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface-2)]">
              <p className="text-[var(--text-muted)] text-xs mb-1 flex items-center gap-1">
                <Users className="w-3 h-3" /> Travelers
              </p>
              <p className="text-[var(--text)] text-sm font-medium">{booking.travelers} person{booking.travelers > 1 ? "s" : ""}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface-2)]">
              <p className="text-[var(--text-muted)] text-xs mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Duration
              </p>
              <p className="text-[var(--text)] text-sm font-medium">{booking.package.durationDays} days</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface-2)]">
              <p className="text-[var(--text-muted)] text-xs mb-1">Amount Paid</p>
              <p className="text-[var(--text)] text-sm font-medium">{formatPrice(booking.totalAmount)}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-[var(--text-muted)] text-xs">Booking ID</span>
            <span className="text-[var(--text-secondary)] text-xs font-mono">{booking.id.slice(0, 16)}...</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link href="/bookings"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-semibold transition-colors">
            View My Bookings
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/packages"
            className="flex items-center justify-center w-full py-3.5 rounded-2xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-colors text-sm">
            Explore More Packages
          </Link>
        </div>
      </div>
    </div>
  )
}