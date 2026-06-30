import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, Edit, Eye, Star, CalendarCheck } from "lucide-react"
import PackageToggleButton from "@/components/provider/PackageToggleButton"

export default async function ProviderPackagesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
  })
  if (!provider) redirect("/become-provider")

  const packages = await prisma.package.findMany({
    where: { providerId: provider.id },
    include: {
      bookings: { select: { id: true, status: true } },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const formatPrice = (price: any) => `₹${Number(price).toLocaleString("en-IN")}`

  return (
    <div className="space-y-6">
      <div className="h-5"></div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">Packages</h1>
          <p className="text-[var(--text-secondary)] mt-1">{packages.length} package{packages.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/provider/packages/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Package
        </Link>
      </div>

      {packages.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[var(--text-muted)] text-5xl mb-4">📦</p>
          <h3 className="text-[var(--text-secondary)] text-xl font-medium mb-2">No packages yet</h3>
          <p className="text-[var(--text-muted)] text-sm mb-6">Create your first travel package to start receiving bookings</p>
          <Link href="/provider/packages/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors">
            <Plus className="w-4 h-4" /> Create Package
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {packages.map((pkg) => {
            const confirmedBookings = pkg.bookings.filter(b =>
              b.status === "CONFIRMED" || b.status === "COMPLETED"
            ).length

            return (
              <div key={pkg.id} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border)] transition-all">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--surface-2)] flex-shrink-0">
                    {pkg.images[0] && (
                      <img src={pkg.images[0]} alt={pkg.title} className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[var(--text)] font-semibold font-['Playfair_Display'] mb-1">{pkg.title}</h3>
                        <p className="text-[var(--text-secondary)] text-xs">{pkg.destination}, {pkg.country} · {pkg.durationDays} days</p>
                      </div>
                      <span className={`flex-shrink-0 px-2.5 py-1 rounded-full border text-xs font-medium ${
                        pkg.isActive
                          ? "bg-[var(--success-soft)] text-[var(--success)] border-[color:var(--success-border)]"
                          : "bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)]"
                      }`}>
                        {pkg.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <span className="text-[var(--text)] font-semibold text-sm">{formatPrice(pkg.pricePerPerson)}/person</span>
                      <span className="flex items-center gap-1 text-[var(--text-secondary)] text-xs">
                        <CalendarCheck className="w-3 h-3" /> {confirmedBookings} bookings
                      </span>
                      <span className="flex items-center gap-1 text-[var(--text-secondary)] text-xs">
                        <Star className="w-3 h-3 text-[var(--warning)]" /> {pkg.avgRating.toFixed(1)} ({pkg._count.reviews} reviews)
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border)]">
                      <Link href={`/provider/packages/${pkg.id}/edit`}
                        className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text)] text-xs transition-colors">
                        <Edit className="w-3 h-3" /> Manage dates
                      </Link>
                      <Link href={`/packages/${pkg.slug}`} target="_blank"
                        className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text)] text-xs transition-colors">
                        <Eye className="w-3 h-3" /> View live
                      </Link>
                      <Link href={`/provider/packages/${pkg.id}/registrations`}
                        className="flex items-center gap-1.5 text-[var(--accent)] hover:text-[var(--accent-hover)] text-xs transition-colors font-medium">
                        👥 View registrations
                      </Link>
                      <PackageToggleButton packageId={pkg.id} isActive={pkg.isActive} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}