import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import PackageToggle from "@/components/admin/PackageToggle"
import { Eye, MapPin, Clock, Star } from "lucide-react"

export default async function AdminPackagesPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/")

  const packages = await prisma.package.findMany({
    include: {
      provider: { select: { businessName: true } },
      _count: { select: { bookings: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const formatPrice = (price: any) => `₹${Number(price).toLocaleString("en-IN")}`

  return (
    <div className="space-y-6">
      <div className="h-5"></div>
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">Packages</h1>
        <p className="text-[var(--text-secondary)] mt-1">{packages.length} total · {packages.filter(p => p.isActive).length} active</p>
      </div>

      <div className="space-y-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="flex gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border)] transition-all">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--surface-2)] flex-shrink-0">
              {pkg.images[0] && (
                <img src={pkg.images[0]} alt={pkg.title} className="w-full h-full object-cover" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[var(--text)] font-semibold text-sm font-['Playfair_Display'] line-clamp-1">
                    {pkg.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-xs">{pkg.provider.businessName}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-full border text-xs font-medium ${
                    pkg.isActive
                      ? "bg-[var(--success-soft)] text-[var(--success)] border-[color:var(--success-border)]"
                      : "bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)]"
                  }`}>
                    {pkg.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-[var(--text-secondary)] text-xs">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{pkg.destination}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{pkg.durationDays} days</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-[var(--warning)]" />{pkg.avgRating.toFixed(1)}</span>
                <span>{pkg._count.bookings} bookings</span>
                <span className="text-[var(--text-secondary)] font-medium">{formatPrice(pkg.pricePerPerson)}/person</span>
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border)]">
                <Link href={`/packages/${pkg.slug}`} target="_blank"
                  className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text)] text-xs transition-colors">
                  <Eye className="w-3 h-3" /> View
                </Link>
                <PackageToggle packageId={pkg.id} isActive={pkg.isActive} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}