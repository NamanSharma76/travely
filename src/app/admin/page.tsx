import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Users, Building2, Package, CreditCard, ArrowRight, Clock } from "lucide-react"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/")

  const [
    totalUsers,
    totalProviders,
    pendingProviders,
    totalPackages,
    totalBookings,
    totalRevenue,
    recentProviders,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.provider.count(),
    prisma.provider.count({ where: { status: "PENDING" } }),
    prisma.package.count(),
    prisma.booking.count(),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
    prisma.provider.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.booking.findMany({
      include: {
        package: { select: { title: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  const formatPrice = (price: any) =>
    `₹${Number(price ?? 0).toLocaleString("en-IN")}`

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    })

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
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">Admin Overview</h1>
        <p className="text-[var(--text-secondary)] mt-1">Platform statistics and pending actions</p>
      </div>

      {/* Pending alert */}
      {pendingProviders > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-[color:var(--warning-border)] bg-[var(--warning-soft)]">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[var(--warning)]" />
            <div>
              <p className="text-[var(--warning)] font-medium text-sm">
                {pendingProviders} provider application{pendingProviders > 1 ? "s" : ""} waiting for review
              </p>
              <p className="text-[var(--warning)] text-xs">Review and verify providers to activate their accounts</p>
            </div>
          </div>
          <Link href="/admin/providers"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--warning-soft)] text-[var(--warning)] border border-[color:var(--warning-border)] text-xs font-medium hover:bg-[var(--warning-soft-hover)] transition-colors">
            Review <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: totalUsers, icon: Users, color: "text-[var(--info)]", bg: "bg-[var(--info-soft)]", href: "/admin/users" },
          { label: "Providers", value: totalProviders, icon: Building2, color: "text-[var(--accent)]", bg: "bg-[var(--accent-soft)]", href: "/admin/providers" },
          { label: "Packages", value: totalPackages, icon: Package, color: "text-[var(--premium)]", bg: "bg-[var(--premium-soft)]", href: "/admin/packages" },
          { label: "Total Revenue", value: formatPrice(totalRevenue._sum.amount), icon: CreditCard, color: "text-[var(--warning)]", bg: "bg-[var(--warning-soft)]", href: "#" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border)] transition-all">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-[var(--text)] font-['Playfair_Display']">{stat.value}</p>
            <p className="text-[var(--text-secondary)] text-xs mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Providers */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[var(--text)] font-semibold">Pending Providers</h2>
            <Link href="/admin/providers" className="text-[var(--accent)] text-xs flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentProviders.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm text-center py-6">No pending applications</p>
          ) : (
            <div className="space-y-3">
              {recentProviders.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <div>
                    <p className="text-[var(--text)] text-sm font-medium">{provider.businessName}</p>
                    <p className="text-[var(--text-secondary)] text-xs">{provider.user.email}</p>
                  </div>
                  <Link href="/admin/providers"
                    className="px-3 py-1 rounded-lg bg-[var(--warning-soft)] text-[var(--warning)] border border-[color:var(--warning-border)] text-xs font-medium hover:bg-[var(--warning-soft-hover)] transition-colors">
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[var(--text)] font-semibold">Recent Bookings</h2>
            <span className="text-[var(--text-muted)] text-xs">{totalBookings} total</span>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm text-center py-6">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <div>
                    <p className="text-[var(--text)] text-sm font-medium truncate max-w-[200px]">{booking.package.title}</p>
                    <p className="text-[var(--text-secondary)] text-xs">{booking.user.name} · {formatDate(booking.createdAt)}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full border text-xs font-medium ${statusColors[booking.status]}`}>
                    {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}