import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { MapPin, Package, ArrowRight } from "lucide-react"

async function getDestinations() {
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    select: {
      destination: true,
      country: true,
      images: true,
      category: true,
      _count: { select: { bookings: true } },
    },
  })

  // Group by destination
  const map = new Map<string, {
    destination: string
    country: string
    image: string
    packageCount: number
    categories: Set<string>
  }>()

  for (const pkg of packages) {
    const key = `${pkg.destination}-${pkg.country}`
    if (map.has(key)) {
      const d = map.get(key)!
      d.packageCount++
      d.categories.add(pkg.category)
    } else {
      map.set(key, {
        destination: pkg.destination,
        country: pkg.country,
        image: pkg.images[0] ?? "",
        packageCount: 1,
        categories: new Set([pkg.category]),
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => b.packageCount - a.packageCount)
}

const continents = [
  { label: "All", value: "" },
  { label: "India", value: "India" },
  { label: "Asia", value: "Asia" },
  { label: "Europe", value: "Europe" },
  { label: "Maldives", value: "Maldives" },
  { label: "Indonesia", value: "Indonesia" },
  { label: "Singapore", value: "Singapore" },
]

export default async function DestinationsPage() {
  const destinations = await getDestinations()

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20">

      {/* Hero */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent-soft)] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--accent-soft)] rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-[var(--accent)] text-sm font-bold tracking-[0.2em] uppercase mb-4 drop-shadow-sm">Explore the world</p>
          <h1 className="text-5xl md:text-7xl font-bold text-[var(--text)] font-['Playfair_Display'] leading-tight mb-6">
            Where do you<br />
            want to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)]">go?</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto font-medium">
            Discover {destinations.length} destinations handpicked by our travel experts.
          </p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="px-6 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {destinations.map((dest) => (
              <Link
                key={`${dest.destination}-${dest.country}`}
                href={`/packages?search=${encodeURIComponent(dest.destination)}`}
                className="group relative rounded-3xl overflow-hidden aspect-[3/4] border border-[var(--border)] hover:border-[var(--accent-border-strong)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-1.5 bg-[var(--surface-2)]"
              >
                {dest.image && (
                  <img
                    src={dest.image}
                    alt={dest.destination}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                )}

                {/* Gradient overlay - Adjusted for better text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--overlay-strong)] via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent opacity-60" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center gap-1.5 text-[var(--on-dark)] opacity-80 text-xs mb-2 font-medium tracking-wide uppercase">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent-bright)]" />
                    {dest.country}
                  </div>
                  <h3 className="text-[var(--on-dark)] font-bold text-2xl font-['Playfair_Display'] mb-3 drop-shadow-md">
                    {dest.destination}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[var(--on-dark)] opacity-90 text-sm font-medium">
                      <Package className="w-4 h-4" />
                      {dest.packageCount} package{dest.packageCount !== 1 ? "s" : ""}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[var(--surface)]/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:scale-110 transition-all duration-300 border border-[var(--surface)]/10">
                      <ArrowRight className="w-4 h-4 text-[var(--on-dark)]" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {destinations.length === 0 && (
            <div className="text-center py-24 premium-panel rounded-3xl mt-8">
              <p className="text-5xl mb-4 opacity-80">🌍</p>
              <h3 className="text-[var(--text)] text-xl font-bold font-['Playfair_Display'] mb-2">No destinations yet</h3>
              <p className="text-[var(--text-secondary)]">Check back soon for exciting new places to visit.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl border border-[var(--accent-border)] bg-[var(--surface)] shadow-[var(--shadow)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-[var(--accent-soft)] opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display'] mb-4">
              Can't find your dream destination?
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 text-lg">Browse all packages and filter by your exact preferences.</p>
            <Link href="/packages"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl brand-gradient text-[var(--on-accent)] font-semibold shadow-[var(--shadow)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-1">
              Browse All Packages <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}