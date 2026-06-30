import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { MapPin, Clock, Calendar, Users, ArrowRight, Package } from "lucide-react"
import ReviewForm from "@/components/ReviewForm"

const statusColors: Record<string, string> = {
  PENDING: "bg-[var(--warning-soft)] text-[var(--warning)] border-[color:var(--warning-border)]",
  CONFIRMED: "bg-[var(--success-soft)] text-[var(--success)] border-[color:var(--success-border)]",
  REJECTED: "bg-[var(--danger-soft)] text-[var(--danger)] border-[color:var(--danger-border)]",
  COMPLETED: "bg-[var(--info-soft)] text-[var(--info)] border-[color:var(--info-border)]",
  CANCELLED: "bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)]",
  REFUNDED: "bg-[var(--premium-soft)] text-[var(--premium)] border-[color:var(--premium-border)]",
}

export default async function BookingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: {
      package: {
        select: {
          id: true,
          title: true,
          slug: true,
          images: true,
          destination: true,
          country: true,
          durationDays: true,
        },
      },
      availableDate: true,
      review: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    })

  const formatPrice = (price: any) =>
    `₹${Number(price).toLocaleString("en-IN")}`

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--text)] font-['Playfair_Display'] mb-2">My Bookings</h1>
          <p className="text-[var(--text-secondary)]">{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-[var(--text-secondary)] text-xl font-medium mb-2">No bookings yet</h3>
            <p className="text-[var(--text-muted)] text-sm mb-6">Start exploring and book your first adventure</p>
            <Link href="/packages"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors">
              Browse Packages <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--surface-2)]">
                      {booking.package.images[0] && (
                        <img src={booking.package.images[0]} alt={booking.package.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-[var(--text)] font-semibold font-['Playfair_Display'] line-clamp-1">{booking.package.title}</h3>
                        <span className={`flex-shrink-0 px-2.5 py-1 rounded-full border text-xs font-medium ${statusColors[booking.status]}`}>
                          {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[var(--text-secondary)] text-xs mb-3">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{booking.package.destination}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{booking.package.durationDays} days</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(booking.availableDate.startDate)}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{booking.travelers} traveler{booking.travelers > 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text)] font-bold text-lg">{formatPrice(booking.totalAmount)}</span>
                        <Link href={`/packages/${booking.package.slug}`}
                          className="flex items-center gap-1 text-[var(--accent)] hover:text-[var(--accent-hover)] text-xs font-medium transition-colors">
                          View package <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {booking.status === "COMPLETED" && (
                  <div className="border-t border-[var(--border)] p-5">
                    {booking.review ? (
                      <div className="space-y-2">
                        <p className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider">Your Review</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map((star) => (
                            <span key={star} className={`text-sm ${star <= booking.review!.rating ? "text-[var(--warning)]" : "text-[var(--border-strong)]"}`}>★</span>
                          ))}
                          <span className="text-[var(--text-secondary)] text-xs ml-1">
                            {["","Poor","Fair","Good","Very Good","Excellent"][booking.review.rating]}
                          </span>
                        </div>
                        {booking.review.title && <p className="text-[var(--text)] text-sm font-medium">{booking.review.title}</p>}
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{booking.review.body}</p>
                      </div>
                    ) : (
                      <ReviewForm
                        packageId={booking.package.id}
                        bookingId={booking.id}
                        packageTitle={booking.package.title}
                      />
                    )}
                  </div>
                )}

                {booking.status === "CONFIRMED" && (
                  <div className="border-t border-[var(--border)] px-5 py-3">
                    <p className="text-[var(--text-muted)] text-xs">You can leave a review once your trip is marked as completed by the provider.</p>
                  </div>
                )}

                {booking.status === "PENDING" && (
                  <div className="border-t border-[var(--border)] px-5 py-3">
                    <p className="text-[var(--text-muted)] text-xs">Waiting for provider to confirm your booking.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}