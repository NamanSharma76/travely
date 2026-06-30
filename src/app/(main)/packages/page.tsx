"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { MapPin, Clock, Star, Search, SlidersHorizontal, X, ArrowRight } from "lucide-react"

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Adventure", value: "ADVENTURE" },
  { label: "Beach", value: "BEACH" },
  { label: "Honeymoon", value: "HONEYMOON" },
  { label: "Cultural", value: "CULTURAL" },
  { label: "Wildlife", value: "WILDLIFE" },
  { label: "Pilgrimage", value: "PILGRIMAGE" },
  { label: "Family", value: "FAMILY" },
  { label: "Budget", value: "BUDGET" },
  { label: "Luxury", value: "LUXURY" },
  { label: "Group", value: "GROUP" },
]

const DURATIONS = [
  { label: "Any", value: "" },
  { label: "1-3 days", value: "1-3" },
  { label: "4-6 days", value: "4-6" },
  { label: "7-10 days", value: "7-10" },
  { label: "10+ days", value: "10+" },
]

const BUDGETS = [
  { label: "Any", value: "" },
  { label: "Under ₹15,000", value: "0-15000" },
  { label: "₹15k - ₹30k", value: "15000-30000" },
  { label: "₹30k - ₹60k", value: "30000-60000" },
  { label: "₹60k+", value: "60000+" },
]

type Package = {
  id: string
  title: string
  slug: string
  destination: string
  country: string
  category: string
  durationDays: number
  pricePerPerson: number
  images: string[]
  avgRating: number
  totalReviews: number
  provider: { businessName: string }
}

export default function PackagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [category, setCategory] = useState(searchParams.get("category") ?? "")
  const [duration, setDuration] = useState(searchParams.get("duration") ?? "")
  const [budget, setBudget] = useState(searchParams.get("budget") ?? "")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") ?? "rating")

  const fetchPackages = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (category) params.set("category", category)
    if (duration) params.set("duration", duration)
    if (budget) params.set("budget", budget)
    params.set("sort", sortBy)

    const res = await fetch(`/api/packages?${params.toString()}`)
    const data = await res.json()
    setPackages(data.packages ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [search, category, duration, budget, sortBy])

  useEffect(() => {
    const timer = setTimeout(fetchPackages, 300)
    return () => clearTimeout(timer)
  }, [fetchPackages])

  const clearFilters = () => {
    setSearch("")
    setCategory("")
    setDuration("")
    setBudget("")
    setSortBy("rating")
  }

  const hasFilters = search || category || duration || budget

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--text)] font-['Playfair_Display'] mb-2">
            Explore Packages
          </h1>
          <p className="text-[var(--text-secondary)]">
            {loading ? "Loading..." : `${total} packages found`}
          </p>
        </div>

        {/* Search + Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations, packages..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-border-strong)] focus:bg-[var(--surface)] transition-all shadow-sm focus:shadow-[var(--shadow)] text-sm"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-border-strong)] focus:bg-[var(--surface)] transition-all shadow-sm text-sm min-w-[160px] cursor-pointer"
          >
            <option value="rating" className="bg-[var(--surface)] text-[var(--text)]">Top Rated</option>
            <option value="price_asc" className="bg-[var(--surface)] text-[var(--text)]">Price: Low to High</option>
            <option value="price_desc" className="bg-[var(--surface)] text-[var(--text)]">Price: High to Low</option>
            <option value="duration_asc" className="bg-[var(--surface)] text-[var(--text)]">Shortest First</option>
            <option value="newest" className="bg-[var(--surface)] text-[var(--text)]">Newest</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-medium shadow-sm active:scale-95 ${
              showFilters || hasFilters
                ? "border-[var(--accent-border-strong)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[var(--shadow)]"
                : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--border-strong)]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && (
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-[var(--text)] font-bold text-sm">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-[var(--text-secondary)] hover:text-[var(--danger)] text-xs font-medium flex items-center gap-1 transition-colors">
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category */}
              <div>
                <p className="text-[var(--text-secondary)] text-xs font-bold mb-3 uppercase tracking-wider">Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        category === cat.value
                          ? "bg-[var(--accent)] text-[var(--on-accent)] shadow-sm"
                          : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <p className="text-[var(--text-secondary)] text-xs font-bold mb-3 uppercase tracking-wider">Duration</p>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        duration === d.value
                          ? "bg-[var(--accent)] text-[var(--on-accent)] shadow-sm"
                          : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)]"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <p className="text-[var(--text-secondary)] text-xs font-bold mb-3 uppercase tracking-wider">Budget</p>
                <div className="flex flex-wrap gap-2">
                  {BUDGETS.map((b) => (
                    <button
                      key={b.value}
                      onClick={() => setBudget(b.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        budget === b.value
                          ? "bg-[var(--accent)] text-[var(--on-accent)] shadow-sm"
                          : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)]"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat.value
                  ? "bg-[var(--accent)] text-[var(--on-accent)] shadow-sm"
                  : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-strong)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] animate-pulse shadow-sm">
                <div className="h-52 bg-[var(--surface-2)]" />
                <div className="p-5 space-y-4">
                  <div className="h-3 bg-[var(--surface-3)] rounded w-1/2" />
                  <div className="h-5 bg-[var(--surface-3)] rounded w-3/4" />
                  <div className="flex justify-between items-center pt-2">
                     <div className="h-3 bg-[var(--surface-3)] rounded w-1/4" />
                     <div className="h-4 bg-[var(--surface-3)] rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-24 premium-panel rounded-3xl mx-auto max-w-2xl">
            <p className="text-6xl mb-6 opacity-80">🔍</p>
            <h3 className="text-[var(--text)] text-2xl font-bold font-['Playfair_Display'] mb-3">No packages found</h3>
            <p className="text-[var(--text-secondary)] text-base mb-8">We couldn't find any trips matching your exact filters.</p>
            <button onClick={clearFilters} className="px-8 py-3.5 rounded-2xl bg-[var(--accent)] text-[var(--on-accent)] font-semibold hover:bg-[var(--accent-hover)] transition-all shadow-[var(--shadow)] hover:-translate-y-0.5 active:translate-y-0">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/packages/${pkg.slug}`}
                className="group rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-border)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="relative h-52 overflow-hidden bg-[var(--surface-2)] shrink-0">
                  {pkg.images[0] && (
                    <img
                      src={pkg.images[0]}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-[var(--overlay-strong)] backdrop-blur-md text-[var(--on-dark)] text-xs font-medium border border-[var(--border)] shadow-sm">
                      {pkg.category.charAt(0) + pkg.category.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--overlay-strong)] backdrop-blur-md border border-[var(--border)] shadow-sm">
                    <Star className="w-3 h-3 text-[var(--warning)] fill-[var(--warning)]" />
                    <span className="text-[var(--on-dark)] text-xs font-bold">{pkg.avgRating.toFixed(1)}</span>
                    <span className="text-[var(--text-muted)] text-[10px] font-medium">({pkg.totalReviews})</span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-xs mb-2.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{pkg.destination}, {pkg.country}</span>
                  </div>
                  <h3 className="text-[var(--text)] font-bold text-lg mb-4 line-clamp-2 group-hover:text-[var(--accent)] transition-colors font-['Playfair_Display'] leading-snug">
                    {pkg.title}
                  </h3>
                  
                  <div className="mt-auto">
                    <div className="flex items-end justify-between mb-4">
                      <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm font-medium">
                        <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                        <span>{pkg.durationDays} days</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider mb-0.5">from</p>
                        <p className="text-[var(--text)] font-bold text-xl leading-none">
                          ₹{Number(pkg.pricePerPerson).toLocaleString("en-IN")}
                          <span className="text-[var(--text-secondary)] text-xs font-medium ml-1">/person</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                      <span className="text-[var(--text-muted)] text-xs font-medium truncate pr-4">{pkg.provider.businessName}</span>
                      <span className="text-[var(--accent)] text-xs font-bold flex items-center gap-1.5 group-hover:gap-2.5 transition-all shrink-0">
                        View details <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}