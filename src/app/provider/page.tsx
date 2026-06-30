import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Package, CalendarCheck, DollarSign, Star, ArrowRight, Plus } from "lucide-react"

export default async function ProviderDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
    include: {
      packages: {
        include: {
          bookings: true,
          reviews: true,
        },
      },
    },
  })

  if (!provider) redirect("/become-provider")

  const totalPackages = provider.packages.length
  const totalBookings = provider.packages.reduce((sum, pkg) => sum + pkg.bookings.length, 0)
  const confirmedBookings = provider.packages.reduce(
    (sum, pkg) => sum + pkg.bookings.filter((b) => b.status === "CONFIRMED").length, 0
  )
  const totalRevenue = provider.packages.reduce(
    (sum, pkg) =>
      sum + pkg.bookings
        .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
        .reduce((s, b) => s + Number(b.paidAmount), 0),
    0
  )
  const totalReviews = provider.packages.reduce((sum, pkg) => sum + pkg.totalReviews, 0)
  const avgRating = totalReviews > 0
    ? provider.packages.reduce((sum, pkg) => sum + pkg.avgRating * pkg.totalReviews, 0) / totalReviews
    : 0

  const recentBookings = await prisma.booking.findMany({
    where: { package: { providerId: provider.id } },
    include: {
      package: { select: { title: true, images: true } },
      user: { select: { name: true, email: true } },
      availableDate: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

  const statusColors: Record<string, string> = {
    PENDING: "bg-[var(--warning-soft)] text-[var(--warning)] border-[color:var(--warning-border)]",
    CONFIRMED: "bg-[var(--success-soft)] text-[var(--success)] border-[color:var(--success-border)]",
    REJECTED: "bg-[var(--danger-soft)] text-[var(--danger)] border-[color:var(--danger-border)]",
    COMPLETED: "bg-[var(--info-soft)] text-[var(--info)] border-[color:var(--info-border)]",
    CANCELLED: "bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)]",
  }

  return (
    <div className="space-y-8">
      
      <div className="h-5"></div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">
            Welcome back, {provider.businessName.split(" ")[0]}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Here's what's happening with your packages</p>
        </div>
        <Link
          href="/provider/packages/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Packages", value: totalPackages, icon: Package, color: "text-[var(--info)]", bg: "bg-[var(--info-soft)]" },
          { label: "Total Bookings", value: totalBookings, icon: CalendarCheck, color: "text-[var(--success)]", bg: "bg-[var(--success-soft)]" },
          { label: "Total Revenue", value: formatPrice(totalRevenue), icon: DollarSign, color: "text-[var(--accent)]", bg: "bg-[var(--accent-soft)]" },
          { label: "Avg Rating", value: avgRating.toFixed(1) + " ★", icon: Star, color: "text-[var(--warning)]", bg: "bg-[var(--warning-soft)]" },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[var(--text)] font-semibold">Recent Bookings</h2>
            <Link href="/provider/bookings" className="text-[var(--accent)] text-xs hover:text-[var(--accent-hover)] flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm text-center py-6">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--surface-2)] flex-shrink-0">
                    {booking.package.images[0] && (
                      <img src={booking.package.images[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text)] text-xs font-medium truncate">{booking.package.title}</p>
                    <p className="text-[var(--text-secondary)] text-xs">{booking.user.name} · {formatDate(booking.createdAt)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[booking.status]}`}>
                    {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Your Packages */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[var(--text)] font-semibold">Your Packages</h2>
            <Link href="/provider/packages" className="text-[var(--accent)] text-xs hover:text-[var(--accent-hover)] flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {provider.packages.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-[var(--text-muted)] text-sm">No packages yet</p>
              <Link href="/provider/packages/new"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-medium hover:bg-[var(--accent-soft-hover)] transition-colors border border-[color:var(--accent-border)]">
                <Plus className="w-3 h-3" /> Add your first package
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {provider.packages.slice(0, 5).map((pkg) => (
                <div key={pkg.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--surface-2)] flex-shrink-0">
                    {pkg.images[0] && (
                      <img src={pkg.images[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text)] text-xs font-medium truncate">{pkg.title}</p>
                    <p className="text-[var(--text-secondary)] text-xs">{pkg.bookings.length} bookings · ★ {pkg.avgRating.toFixed(1)}</p>
                  </div>
                  <Link href={`/provider/packages/${pkg.id}/edit`}
                    className="text-[var(--text-muted)] hover:text-[var(--text)] text-xs transition-colors">
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}