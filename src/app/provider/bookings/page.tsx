import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { MapPin, Calendar, Users, DollarSign } from "lucide-react"
import BookingActionButtons from "@/components/provider/BookingActionButtons"

export default async function ProviderBookingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
  })
  if (!provider) redirect("/become-provider")

  const bookings = await prisma.booking.findMany({
    where: { package: { providerId: provider.id } },
    include: {
      package: { select: { title: true, images: true, destination: true } },
      user: { select: { name: true, email: true, image: true } },
      availableDate: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const formatPrice = (price: any) => `₹${Number(price).toLocaleString("en-IN")}`
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

  const statusColors: Record<string, string> = {
    PENDING: "bg-[var(--warning-soft)] text-[var(--warning)] border-[color:var(--warning-border)]",
    CONFIRMED: "bg-[var(--success-soft)] text-[var(--success)] border-[color:var(--success-border)]",
    REJECTED: "bg-[var(--danger-soft)] text-[var(--danger)] border-[color:var(--danger-border)]",
    COMPLETED: "bg-[var(--info-soft)] text-[var(--info)] border-[color:var(--info-border)]",
    CANCELLED: "bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)]",
  }

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length

  return (
    <div className="space-y-6">

      <div className="h-5"></div>
      
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">Bookings</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          {bookings.length} total · {pendingCount > 0 && (
            <span className="text-[var(--warning)]">{pendingCount} pending action</span>
          )}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All", "Pending", "Confirmed", "Completed", "Rejected"].map((tab) => (
          <button key={tab}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text)] transition-colors">
            {tab}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[var(--text-muted)] text-5xl mb-4">📋</p>
          <h3 className="text-[var(--text-secondary)] text-xl font-medium mb-2">No bookings yet</h3>
          <p className="text-[var(--text-muted)] text-sm">Bookings will appear here once travelers book your packages</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border)] transition-all">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Package image */}
                <div className="w-full sm:w-16 h-16 rounded-xl overflow-hidden bg-[var(--surface-2)] flex-shrink-0">
                  {booking.package.images[0] && (
                    <img src={booking.package.images[0]} alt="" className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-[var(--text)] font-semibold text-sm font-['Playfair_Display']">
                        {booking.package.title}
                      </h3>
                      <p className="text-[var(--text-secondary)] text-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {booking.package.destination}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-full border text-xs font-medium ${statusColors[booking.status]}`}>
                      {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                    </span>
                  </div>

                  {/* Traveler info */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--accent-soft-hover)] flex items-center justify-center overflow-hidden">
                      {booking.user.image ? (
                        <img src={booking.user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[var(--accent)] text-xs font-bold">
                          {booking.user.name?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)] text-xs font-medium">{booking.user.name}</span>
                      <span className="text-[var(--text-muted)] text-xs"> · {booking.user.email}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[var(--text-secondary)] text-xs mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(booking.availableDate.startDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {booking.travelers} traveler{booking.travelers > 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatPrice(booking.totalAmount)}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <BookingActionButtons
                    bookingId={booking.id}
                    status={booking.status}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}