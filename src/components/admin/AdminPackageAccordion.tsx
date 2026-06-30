"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, MapPin, Clock, Star, Users, Calendar, Mail, Eye } from "lucide-react"

type Booking = {
  id: string
  status: string
  travelers: number
  totalAmount: number
  createdAt: Date
  notes: string | null
  startDate: Date
  endDate: Date
  user: {
    name: string | null
    email: string | null
    image: string | null
  }
}

type Package = {
  id: string
  title: string
  slug: string
  destination: string
  country: string
  durationDays: number
  pricePerPerson: number
  images: string[]
  isActive: boolean
  avgRating: number
  totalReviews: number
  category: string
  bookingsCount: number
  reviewsCount: number
  bookings: Booking[]
}

const statusColors: Record<string, string> = {
  PENDING: "bg-[var(--warning-soft)] text-[var(--warning)] border-[color:var(--warning-border)]",
  CONFIRMED: "bg-[var(--success-soft)] text-[var(--success)] border-[color:var(--success-border)]",
  REJECTED: "bg-[var(--danger-soft)] text-[var(--danger)] border-[color:var(--danger-border)]",
  COMPLETED: "bg-[var(--info-soft)] text-[var(--info)] border-[color:var(--info-border)]",
  CANCELLED: "bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)]",
}

export default function AdminPackageAccordion({ pkg }: { pkg: Package }) {
  const [open, setOpen] = useState(false)

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  const formatPrice = (price: number) =>
    `₹${price.toLocaleString("en-IN")}`

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* Package Header */}
      <div
        className="flex gap-4 p-5 cursor-pointer hover:bg-[var(--surface)] transition-all"
        onClick={() => setOpen(!open)}
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--surface-2)] flex-shrink-0">
          {pkg.images[0] && (
            <img src={pkg.images[0]} alt={pkg.title} className="w-full h-full object-cover" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[var(--text)] font-semibold font-['Playfair_Display'] line-clamp-1">{pkg.title}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-[var(--text-secondary)] text-xs">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{pkg.destination}, {pkg.country}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{pkg.durationDays} days</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-[var(--warning)]" />{pkg.avgRating.toFixed(1)} ({pkg.totalReviews})</span>
                <span>{pkg.bookingsCount} bookings</span>
                <span className="text-[var(--text-secondary)] font-medium">{formatPrice(pkg.pricePerPerson)}/person</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`px-2.5 py-1 rounded-full border text-xs font-medium ${
                pkg.isActive
                  ? "bg-[var(--success-soft)] text-[var(--success)] border-[color:var(--success-border)]"
                  : "bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)]"
              }`}>
                {pkg.isActive ? "Active" : "Inactive"}
              </span>
              {open
                ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
              }
            </div>
          </div>
        </div>
      </div>

      {/* Registrations Dropdown */}
      {open && (
        <div className="border-t border-[var(--border)]">
          <div className="p-4 flex items-center justify-between">
            <h4 className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider">
              Registrations ({pkg.bookings.length})
            </h4>
            <Link href={`/packages/${pkg.slug}`} target="_blank"
              className="flex items-center gap-1 text-[var(--accent)] hover:text-[var(--accent-hover)] text-xs transition-colors">
              <Eye className="w-3 h-3" /> View live page
            </Link>
          </div>

          {pkg.bookings.length === 0 ? (
            <div className="px-5 pb-5 text-center">
              <p className="text-[var(--text-muted)] text-sm">No registrations yet</p>
            </div>
          ) : (
            <div className="px-4 pb-4 space-y-3">
              {pkg.bookings.map((booking) => (
                <div key={booking.id}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                  <div className="flex items-start justify-between gap-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--accent-soft)] border border-[color:var(--accent-border)] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {booking.user.image ? (
                          <img src={booking.user.image} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="text-[var(--accent)] font-bold text-sm">
                            {booking.user.name?.[0]?.toUpperCase() ?? "U"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-[var(--text)] text-sm font-medium">{booking.user.name ?? "Unknown"}</p>
                        <a href={`mailto:${booking.user.email}`}
                          className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--accent)] text-xs transition-colors">
                          <Mail className="w-3 h-3" />
                          {booking.user.email}
                        </a>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-full border text-xs font-medium ${statusColors[booking.status]}`}>
                      {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                    </span>
                  </div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-[var(--border)]">
                    <div>
                      <p className="text-[var(--text-muted)] text-xs mb-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Travel Date
                      </p>
                      <p className="text-[var(--text)] text-xs font-medium">{formatDate(booking.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-muted)] text-xs mb-0.5">Return Date</p>
                      <p className="text-[var(--text)] text-xs font-medium">{formatDate(booking.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-muted)] text-xs mb-0.5 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Travelers
                      </p>
                      <p className="text-[var(--text)] text-xs font-medium">
                        {booking.travelers} person{booking.travelers > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--text-muted)] text-xs mb-0.5">Amount Paid</p>
                      <p className="text-[var(--text)] text-xs font-medium">{formatPrice(booking.totalAmount)}</p>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-2 pt-2 border-t border-[var(--border)]">
                      <p className="text-[var(--text-muted)] text-xs">Special request: {booking.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}