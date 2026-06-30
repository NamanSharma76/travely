import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, Calendar, Users, MapPin } from "lucide-react"

export default async function PackageRegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
  })
  if (!provider) redirect("/become-provider")

  const pkg = await prisma.package.findFirst({
    where: { id, providerId: provider.id },
  })
  if (!pkg) notFound()

  const bookings = await prisma.booking.findMany({
    where: { packageId: id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      },
      availableDate: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    })

  const formatPrice = (price: any) =>
    `₹${Number(price).toLocaleString("en-IN")}`

  const statusColors: Record<string, string> = {
    PENDING: "bg-[var(--warning-soft)] text-[var(--warning)] border-[color:var(--warning-border)]",
    CONFIRMED: "bg-[var(--success-soft)] text-[var(--success)] border-[color:var(--success-border)]",
    REJECTED: "bg-[var(--danger-soft)] text-[var(--danger)] border-[color:var(--danger-border)]",
    COMPLETED: "bg-[var(--info-soft)] text-[var(--info)] border-[color:var(--info-border)]",
    CANCELLED: "bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)]",
  }

  // Stats
  const totalRevenue = bookings
    .filter(b => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, b) => sum + Number(b.totalAmount), 0)
  const confirmedCount = bookings.filter(b => b.status === "CONFIRMED" || b.status === "COMPLETED").length
  const pendingCount = bookings.filter(b => b.status === "PENDING").length

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="h-5"></div>
      {/* Header */}
      <div>
        <Link href="/provider/packages"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-secondary)] text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to packages
        </Link>
        <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">Registrations</h1>
        <p className="text-[var(--text-secondary)] mt-1 line-clamp-1">{pkg.title}</p>
      </div>

      {/* Package summary */}
      <div className="flex gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--surface-2)] flex-shrink-0">
          {pkg.images[0] && (
            <img src={pkg.images[0]} alt={pkg.title} className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <p className="text-[var(--text)] font-medium font-['Playfair_Display']">{pkg.title}</p>
          <div className="flex items-center gap-3 text-[var(--text-secondary)] text-xs mt-1">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{pkg.destination}</span>
            <span>{pkg.durationDays} days</span>
            <span>₹{Number(pkg.pricePerPerson).toLocaleString("en-IN")}/person</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Bookings", value: bookings.length },
          { label: "Confirmed", value: confirmedCount },
          { label: "Pending", value: pendingCount },
          { label: "Revenue", value: formatPrice(totalRevenue) },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center">
            <p className="text-xl font-bold text-[var(--text)] font-['Playfair_Display']">{stat.value}</p>
            <p className="text-[var(--text-secondary)] text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Registrations List */}
      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--text-muted)] text-4xl mb-3">👥</p>
          <h3 className="text-[var(--text-secondary)] text-lg font-medium">No registrations yet</h3>
          <p className="text-[var(--text-muted)] text-sm mt-1">Bookings will appear here once travelers register</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider">
            All Registrations ({bookings.length})
          </h2>
          {bookings.map((booking) => (
            <div key={booking.id}
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border)] transition-all">
              <div className="flex flex-col sm:flex-row gap-4">

                {/* User Avatar */}
                <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] border border-[color:var(--accent-border)] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {booking.user.image ? (
                    <img src={booking.user.image} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-[var(--accent)] font-bold text-lg">
                      {booking.user.name?.[0]?.toUpperCase() ?? "U"}
                    </span>
                  )}
                </div>

                {/* User Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-[var(--text)] font-semibold">{booking.user.name ?? "Unknown"}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
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

                  {/* Booking Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-[var(--border)]">
                    <div>
                      <p className="text-[var(--text-muted)] text-xs mb-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Travel Date
                      </p>
                      <p className="text-[var(--text)] text-xs font-medium">
                        {formatDate(booking.availableDate.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--text-muted)] text-xs mb-0.5">End Date</p>
                      <p className="text-[var(--text)] text-xs font-medium">
                        {formatDate(booking.availableDate.endDate)}
                      </p>
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
                      <p className="text-[var(--text-muted)] text-xs mb-0.5">Amount</p>
                      <p className="text-[var(--text)] text-xs font-medium">
                        {formatPrice(booking.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)]">
                      <p className="text-[var(--text-muted)] text-xs mb-1">Special Requests</p>
                      <p className="text-[var(--text-secondary)] text-xs leading-relaxed">{booking.notes}</p>
                    </div>
                  )}

                  <div className="mt-2">
                    <p className="text-[var(--text-muted)] text-xs">
                      Booked on {formatDate(booking.createdAt)} · ID: {booking.id.slice(0, 12)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}