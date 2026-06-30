import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, Globe, Package, Star, CalendarCheck, Users, MapPin, Calendar, Shield } from "lucide-react"
import AdminPackageAccordion from "@/components/admin/AdminPackageAccordion"

export default async function AdminProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/")

  const { id } = await params

  const provider = await prisma.provider.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, image: true, createdAt: true } },
      packages: {
        include: {
          bookings: {
            include: {
              user: { select: { name: true, email: true, image: true } },
              availableDate: true,
            },
            orderBy: { createdAt: "desc" },
          },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!provider) notFound()

  const totalBookings = provider.packages.reduce((sum, pkg) => sum + pkg.bookings.length, 0)
  const totalRevenue = provider.packages.reduce(
    (sum, pkg) => sum + pkg.bookings
      .filter(b => b.status === "CONFIRMED" || b.status === "COMPLETED")
      .reduce((s, b) => s + Number(b.totalAmount), 0), 0
  )
  const totalReviews = provider.packages.reduce((sum, pkg) => sum + pkg.totalReviews, 0)
  const avgRating = totalReviews > 0
    ? provider.packages.reduce((sum, pkg) => sum + pkg.avgRating * pkg.totalReviews, 0) / totalReviews
    : 0

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  const formatPrice = (price: any) =>
    `₹${Number(price).toLocaleString("en-IN")}`

  const statusColors: Record<string, string> = {
    PENDING: "bg-[var(--warning-soft)] text-[var(--warning)] border-[color:var(--warning-border)]",
    VERIFIED: "bg-[var(--success-soft)] text-[var(--success)] border-[color:var(--success-border)]",
    REJECTED: "bg-[var(--danger-soft)] text-[var(--danger)] border-[color:var(--danger-border)]",
    SUSPENDED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="h-5"></div>
      
      {/* Back */}
      <div>
        <Link href="/admin/providers"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-secondary)] text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to providers
        </Link>
        <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">Provider Details</h1>
      </div>

      {/* Provider Info Card */}
      <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] border border-[color:var(--accent-border)] flex items-center justify-center flex-shrink-0">
              <span className="text-[var(--accent)] font-bold text-2xl">{provider.businessName[0]}</span>
            </div>
            <div>
              <h2 className="text-[var(--text)] text-xl font-bold font-['Playfair_Display']">{provider.businessName}</h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium mt-1 ${statusColors[provider.status]}`}>
                <Shield className="w-3 h-3" />
                {provider.status.charAt(0) + provider.status.slice(1).toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {provider.description && (
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{provider.description}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
            <Mail className="w-4 h-4 text-[var(--text-muted)]" />
            <a href={`mailto:${provider.user.email}`} className="hover:text-[var(--accent)] transition-colors">
              {provider.user.email}
            </a>
          </div>
          {provider.phone && (
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
              <Phone className="w-4 h-4 text-[var(--text-muted)]" />
              {provider.phone}
            </div>
          )}
          {provider.website && (
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
              <Globe className="w-4 h-4 text-[var(--text-muted)]" />
              <a href={provider.website} target="_blank" rel="noopener noreferrer"
                className="hover:text-[var(--accent)] transition-colors truncate">
                {provider.website}
              </a>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-[var(--border)] text-[var(--text-muted)] text-xs">
          Account owner: {provider.user.name} · Joined {formatDate(provider.user.createdAt)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Packages", value: provider.packages.length, icon: Package },
          { label: "Total Bookings", value: totalBookings, icon: CalendarCheck },
          { label: "Total Revenue", value: formatPrice(totalRevenue), icon: Users },
          { label: "Avg Rating", value: totalReviews > 0 ? avgRating.toFixed(1) + " ★" : "N/A", icon: Star },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center">
            <p className="text-xl font-bold text-[var(--text)] font-['Playfair_Display']">{stat.value}</p>
            <p className="text-[var(--text-secondary)] text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Packages with Registrations */}
      <div className="space-y-4">
        <h2 className="text-[var(--text)] font-semibold text-lg font-['Playfair_Display']">
          Packages ({provider.packages.length})
        </h2>

        {provider.packages.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <p className="text-[var(--text-muted)] text-sm">No packages listed yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {provider.packages.map((pkg) => (
              <AdminPackageAccordion
                key={pkg.id}
                pkg={{
                  id: pkg.id,
                  title: pkg.title,
                  slug: pkg.slug,
                  destination: pkg.destination,
                  country: pkg.country,
                  durationDays: pkg.durationDays,
                  pricePerPerson: Number(pkg.pricePerPerson),
                  images: pkg.images,
                  isActive: pkg.isActive,
                  avgRating: pkg.avgRating,
                  totalReviews: pkg.totalReviews,
                  category: pkg.category,
                  bookingsCount: pkg.bookings.length,
                  reviewsCount: pkg._count.reviews,
                  bookings: pkg.bookings.map((b) => ({
                    id: b.id,
                    status: b.status,
                    travelers: b.travelers,
                    totalAmount: Number(b.totalAmount),
                    createdAt: b.createdAt,
                    notes: b.notes,
                    startDate: b.availableDate.startDate,
                    endDate: b.availableDate.endDate,
                    user: b.user,
                  })),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}