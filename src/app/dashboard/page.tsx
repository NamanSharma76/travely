import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { MapPin, Clock, Calendar, ArrowRight, Package, Star, Heart } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [bookings, recentPackages] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: session.user.id },
      include: {
        package: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            destination: true,
            durationDays: true,
          },
        },
        availableDate: true,
        review: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.package.findMany({
      where: { isActive: true },
      include: { provider: { select: { businessName: true } } },
      orderBy: { avgRating: "desc" },
      take: 4,
    }),
  ])

  const totalSpent = bookings
    .filter(b => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, b) => sum + Number(b.totalAmount), 0)

  const completedTrips = bookings.filter(b => b.status === "COMPLETED").length
  const upcomingTrips = bookings.filter(b => b.status === "CONFIRMED").length
  const pendingReviews = bookings.filter(b => b.status === "COMPLETED" && !b.review).length

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  const formatPrice = (price: any) =>
    `₹${Number(price).toLocaleString("en-IN")}`

  const statusColors: Record<string, string> = {
    PENDING: "bg-[var(--warning-soft)] text-[var(--warning)] border-[color:var(--warning-border)]",
    CONFIRMED: "bg-[var(--success-soft)] text-[var(--success)] border-[color:var(--success-border)]",
    REJECTED: "bg-[var(--danger-soft)] text-[var(--danger)] border-[color:var(--danger-border)]",
    COMPLETED: "bg-[var(--info-soft)] text-[var(--info)] border-[color:var(--info-border)]",
    CANCELLED: "bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)]",
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[var(--text)] font-['Playfair_Display']">
              Hey, {session.user.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">Here's your travel summary</p>
          </div>
          <Link href="/packages"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] text-sm font-medium transition-colors">
            Explore Packages <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Trips", value: bookings.length, icon: Package, color: "text-[var(--info)]", bg: "bg-[var(--info-soft)]" },
            { label: "Completed", value: completedTrips, icon: Star, color: "text-[var(--accent)]", bg: "bg-[var(--accent-soft)]" },
            { label: "Upcoming", value: upcomingTrips, icon: Calendar, color: "text-[var(--premium)]", bg: "bg-[var(--premium-soft)]" },
            { label: "Total Spent", value: formatPrice(totalSpent), icon: Heart, color: "text-[var(--warning)]", bg: "bg-[var(--warning-soft)]" },
          ].map((stat) => (
            <div key={stat.label} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-[var(--text)] font-['Playfair_Display']">{stat.value}</p>
              <p className="text-[var(--text-secondary)] text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Pending reviews alert */}
        {pendingReviews > 0 && (
          <div className="flex items-center justify-between p-4 rounded-xl border border-[color:var(--warning-border)] bg-[var(--warning-soft)]">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-[var(--warning)]" />
              <p className="text-[var(--warning)] text-sm font-medium">
                You have {pendingReviews} completed trip{pendingReviews > 1 ? "s" : ""} waiting for a review
              </p>
            </div>
            <Link href="/bookings"
              className="px-3 py-1.5 rounded-lg bg-[var(--warning-soft)] text-[var(--warning)] border border-[color:var(--warning-border)] text-xs font-medium hover:bg-[var(--warning-soft-hover)] transition-colors">
              Write Review
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Bookings */}
          <div className="lg:col-span-2 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[var(--text)] font-semibold font-['Playfair_Display']">Recent Bookings</h2>
              <Link href="/bookings" className="text-[var(--accent)] text-xs flex items-center gap-1 hover:text-[var(--accent-hover)]">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-10">
                <Package className="w-10 h-10 text-[var(--border-strong)] mx-auto mb-3" />
                <p className="text-[var(--text-muted)] text-sm mb-4">No bookings yet</p>
                <Link href="/packages"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-medium hover:bg-[var(--accent-hover)] transition-colors">
                  Browse Packages
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border)] transition-all">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--surface-2)] flex-shrink-0">
                      {booking.package.images[0] && (
                        <img src={booking.package.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[var(--text)] text-sm font-medium truncate">{booking.package.title}</p>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full border text-xs ${statusColors[booking.status]}`}>
                          {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[var(--text-secondary)] text-xs">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{booking.package.destination}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(booking.availableDate.startDate)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{booking.package.durationDays}d</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[var(--text)] font-semibold font-['Playfair_Display']">Top Picks</h2>
              <Link href="/packages" className="text-[var(--accent)] text-xs flex items-center gap-1 hover:text-[var(--accent-hover)]">
                More <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentPackages.map((pkg) => (
                <Link key={pkg.id} href={`/packages/${pkg.slug}`}
                  className="flex gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[color:var(--accent-border)] transition-all group">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--surface-2)] flex-shrink-0">
                    {pkg.images[0] && (
                      <img src={pkg.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text)] text-xs font-medium line-clamp-1">{pkg.title}</p>
                    <p className="text-[var(--text-secondary)] text-xs flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{pkg.destination}
                    </p>
                    <p className="text-[var(--accent)] text-xs font-semibold mt-1">
                      ₹{Number(pkg.pricePerPerson).toLocaleString("en-IN")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}