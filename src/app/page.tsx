import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { MapPin, Clock, Star, ArrowRight, Search, Shield, Headphones, CreditCard, Sparkles, TrendingUp } from "lucide-react"
import { auth } from "@/auth"

async function getFeaturedPackages() {
  return await prisma.package.findMany({
    where: { isActive: true },
    include: { provider: true },
    orderBy: { avgRating: "desc" },
    take: 6,
  })
}

// Fetch and group unique destinations from all active packages
async function getDestinations() {
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    select: {
      destination: true,
      country: true,
      images: true,
      category: true, // Added category to power the sub-filters
    },
  })

  const map = new Map<string, { name: string; country: string; image: string; category: string }>()

  for (const pkg of packages) {
    const key = `${pkg.destination}-${pkg.country}`.toLowerCase()
    if (!map.has(key)) {
      map.set(key, {
        name: pkg.destination,
        country: pkg.country,
        image: pkg.images[0] ?? "",
        category: pkg.category,
      })
    }
  }
  return Array.from(map.values())
}

function isDomesticCountry(country?: string | null) {
  const value = (country ?? "").trim().toLowerCase()
  return value === "india" || value === "in" || value.includes("india")
}

export default async function HomePage() {
  const session = await auth()
  const packages = await getFeaturedPackages()
  const allDestinations = await getDestinations()

  // Dynamically filter destinations into domestic and international arrays (up to 8 each)
  const domesticDestinations = allDestinations.filter(d => isDomesticCountry(d.country)).slice(0, 8)
  const internationalDestinations = allDestinations.filter(d => !isDomesticCountry(d.country)).slice(0, 8)

  // Pull hero images from packages, but guarantee we always have something to show in the background
  const FALLBACK_HERO_IMAGES = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80",
    "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=1600&q=80",
  ]
  
  const packageImages = packages.flatMap(pkg => pkg.images).filter(Boolean)
  const heroImages = packageImages.length >= 4 ? packageImages.slice(0, 4) : FALLBACK_HERO_IMAGES

  const categories = [
    { label: "Adventure", icon: "⛰️", slug: "ADVENTURE" },
    { label: "Beach", icon: "🏖️", slug: "BEACH" },
    { label: "Honeymoon", icon: "💑", slug: "HONEYMOON" },
    { label: "Cultural", icon: "🏛️", slug: "CULTURAL" },
    { label: "Wildlife", icon: "🦁", slug: "WILDLIFE" },
    { label: "Pilgrimage", icon: "🛕", slug: "PILGRIMAGE" },
    { label: "Family", icon: "👨‍👩‍👧", slug: "FAMILY" },
    { label: "Budget", icon: "💰", slug: "BUDGET" },
  ]

  return (
    <main className="min-h-screen bg-[var(--bg)]">

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">

        {/* Background Slider — crisp, no blur, controlled overlay only at edges */}
        <div className="absolute inset-0 bg-[#0a0f1a] z-0">
          <style>{`
            @keyframes heroSlide {
              0% { opacity: 0; }
              1% { opacity: 1; }
              25% { opacity: 1; }
              26% { opacity: 0; }
              100% { opacity: 0; }
            }
            .hero-slide {
              animation: heroSlide 20s infinite;
              opacity: 0;
            }
            @media (prefers-reduced-motion: reduce) {
              .hero-slide { animation: none; opacity: 1 !important; }
              .hero-slide:not(:first-child) { display: none; }
            }
          `}</style>

          <div className="absolute inset-0">
            {/* Permanent base image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImages[0]})` }}
            />

            {/* Animated overlays */}
            {heroImages.slice(1).map((img, i) => (
              <div
                key={`${img}-${i}`}
                className="absolute inset-0 bg-cover bg-center bg-no-repeat hero-slide"
                style={{
                  backgroundImage: `url(${img})`,
                  animationDelay: `${(i + 1) * 5}s`,
                }}
              />
            ))}
          </div>

          {/* Controlled overlay — darkens evenly for text contrast, doesn't blur the photo */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 pointer-events-none" />
          
          {/* Bottom fade to blend into page background */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-10">
          <div className="h-10" />

          {/* Heading — pure white on image, not theme-bound, for guaranteed contrast */}
          <h1 className="text-6xl md:text-8xl font-bold text-white font-['Playfair_Display'] leading-tight mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
            Your Next
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-bright)] to-white">
              Adventure
            </span>
            Awaits.
          </h1>

          <p className="text-white/85 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium drop-shadow-md">
            Discover handpicked travel experiences from verified providers.
            Book with confidence, travel with joy.
          </p>

          {/* Floating Search Card */}
          <div className="max-w-3xl mx-auto relative z-50">
            <div className="bg-[var(--surface)]/95 backdrop-blur-xl border border-[var(--border)] rounded-3xl p-3 shadow-[var(--shadow-lg)]">
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
                  <input
                    type="text"
                    placeholder="Where do you want to go?"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-transparent border-0 text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none text-base"
                  />
                </div>
                <Link
                  href="/packages"
                  className="px-8 py-4 rounded-2xl brand-gradient text-[var(--on-accent)] font-semibold transition-all duration-300 hover:shadow-[var(--shadow-lg)] whitespace-nowrap flex items-center gap-2 justify-center hover:-translate-y-0.5"
                >
                  Search
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — pulled up to overlap hero bottom, premium-site pattern */}
      <section className="relative -mt-12 z-30 px-6">
        <div className="h-30" />
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-[var(--shadow-lg)]">
            {[
              { value: "500+", label: "Packages" },
              { value: "12k+", label: "Travelers" },
              { value: "100+", label: "Providers" },
              { value: "4.8★", label: "Avg Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">{stat.value}</p>
                <p className="text-[var(--text-secondary)] text-sm font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Destinations ── */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)] mb-6 tracking-tight">
            Popular Destinations
          </h2>

          <style>{`
            /* Dest Tabs Highlighting */
            #domestic-tab:checked ~ .controls-wrapper .domestic-label,
            #international-tab:checked ~ .controls-wrapper .international-label {
              background: var(--accent);
              color: var(--on-accent);
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            }

            /* Category Tabs Highlighting */
            #cat-ALL:checked ~ .controls-wrapper .cat-label-ALL,
            #cat-ADVENTURE:checked ~ .controls-wrapper .cat-label-ADVENTURE,
            #cat-BEACH:checked ~ .controls-wrapper .cat-label-BEACH,
            #cat-HONEYMOON:checked ~ .controls-wrapper .cat-label-HONEYMOON,
            #cat-CULTURAL:checked ~ .controls-wrapper .cat-label-CULTURAL,
            #cat-WILDLIFE:checked ~ .controls-wrapper .cat-label-WILDLIFE,
            #cat-PILGRIMAGE:checked ~ .controls-wrapper .cat-label-PILGRIMAGE,
            #cat-FAMILY:checked ~ .controls-wrapper .cat-label-FAMILY,
            #cat-BUDGET:checked ~ .controls-wrapper .cat-label-BUDGET {
              border-color: var(--accent);
              background: var(--accent-soft);
              color: var(--accent);
            }

            /* Panel Visibility (Dom/Int) */
            #domestic-tab:checked ~ .destination-panels .domestic-panel { display: flex; }
            #domestic-tab:checked ~ .destination-panels .international-panel { display: none; }
            #international-tab:checked ~ .destination-panels .domestic-panel { display: none; }
            #international-tab:checked ~ .destination-panels .international-panel { display: flex; }

            /* Default state for destination cards */
            .dest-card { display: none !important; }

            /* Filtering Logic based on Category check */
            #cat-ALL:checked ~ .destination-panels .dest-card { display: block !important; }
            #cat-ADVENTURE:checked ~ .destination-panels .dest-card.cat-ADVENTURE { display: block !important; }
            #cat-BEACH:checked ~ .destination-panels .dest-card.cat-BEACH { display: block !important; }
            #cat-HONEYMOON:checked ~ .destination-panels .dest-card.cat-HONEYMOON { display: block !important; }
            #cat-CULTURAL:checked ~ .destination-panels .dest-card.cat-CULTURAL { display: block !important; }
            #cat-WILDLIFE:checked ~ .destination-panels .dest-card.cat-WILDLIFE { display: block !important; }
            #cat-PILGRIMAGE:checked ~ .destination-panels .dest-card.cat-PILGRIMAGE { display: block !important; }
            #cat-FAMILY:checked ~ .destination-panels .dest-card.cat-FAMILY { display: block !important; }
            #cat-BUDGET:checked ~ .destination-panels .dest-card.cat-BUDGET { display: block !important; }
          `}</style>

          <div className="relative">
            {/* The Invisible Inputs powering the CSS State */}
            <input id="domestic-tab" name="destination-tab" type="radio" defaultChecked className="sr-only" />
            <input id="international-tab" name="destination-tab" type="radio" className="sr-only" />
            
            <input id="cat-ALL" name="cat-tab" type="radio" defaultChecked className="sr-only" />
            {categories.map((cat) => (
              <input key={`input-${cat.slug}`} id={`cat-${cat.slug}`} name="cat-tab" type="radio" className="sr-only" />
            ))}

            {/* Controls UI - CHANGED to strictly stack vertically with flex-col */}
            <div className="controls-wrapper flex flex-col gap-5 mb-8 mt-4">
              <div className="destination-toggle inline-flex items-center p-1.5 bg-[var(--surface-2)] rounded-full w-fit">
                <label
                  htmlFor="domestic-tab"
                  className="domestic-label px-6 py-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text)] text-sm font-semibold transition-all cursor-pointer select-none"
                >
                  Domestic
                </label>
                <label
                  htmlFor="international-tab"
                  className="international-label px-6 py-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text)] text-sm font-semibold transition-all cursor-pointer select-none"
                >
                  International
                </label>
              </div>

              {/* Sub-Filters now appearing cleanly on the next line */}
              <div className="category-toggle flex gap-2 overflow-x-auto pb-2 snap-x [&::-webkit-scrollbar]:hidden w-full">
                <label htmlFor="cat-ALL" className="cat-label-ALL flex-none px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] cursor-pointer select-none transition-all">
                  <span>🌍</span> All
                </label>
                {categories.map((cat) => (
                  <label key={`label-${cat.slug}`} htmlFor={`cat-${cat.slug}`} className={`cat-label-${cat.slug} flex-none px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] cursor-pointer select-none transition-all`}>
                    <span>{cat.icon}</span> {cat.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Rendered Destination Lists */}
            <div className="destination-panels">
              {/* Domestic Panel */}
              <div className="domestic-panel flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {domesticDestinations.length > 0 ? (
                  domesticDestinations.map((dest, i) => (
                    <Link
                      href={`/packages?search=${encodeURIComponent(dest.name)}`}
                      key={`dom-${i}`}
                      className={`dest-card cat-${dest.category} flex-none w-40 md:w-48 group snap-start`}
                    >
                      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-3 bg-[var(--surface-2)]">
                        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <h3 className="text-[var(--text)] font-bold text-lg px-1">{dest.name}</h3>
                    </Link>
                  ))
                ) : (
                  // Fallbacks for Domestic with Categories assigned
                  [
                    { name: "Goa", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=400", href: "/packages?search=Goa", cat: "BEACH" },
                    { name: "Manali", image: "https://images.unsplash.com/photo-1605640840469-6060c2394c03?q=80&w=400", href: "/packages?search=Manali", cat: "ADVENTURE" },
                    { name: "Ladakh", image: "https://images.unsplash.com/photo-1581793746485-04698e79a4e8?q=80&w=400", href: "/packages?search=Ladakh", cat: "ADVENTURE" },
                    { name: "Kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=400", href: "/packages?search=Kerala", cat: "HONEYMOON" },
                    { name: "Andaman", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=400", href: "/packages?search=Andaman", cat: "BEACH" },
                    { name: "Jaipur", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=400", href: "/packages?search=Jaipur", cat: "CULTURAL" },
                  ].map((dest, i) => (
                    <Link href={dest.href} key={`fall-dom-${i}`} className={`dest-card cat-${dest.cat} flex-none w-40 md:w-48 group snap-start`}>
                      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-3 bg-[var(--surface-2)]">
                        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <h3 className="text-[var(--text)] font-bold text-lg px-1">{dest.name}</h3>
                    </Link>
                  ))
                )}
              </div>

              {/* International Panel */}
              <div className="international-panel hidden gap-4 md:gap-6 overflow-x-auto pb-6 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {internationalDestinations.length > 0 ? (
                  internationalDestinations.map((dest, i) => (
                    <Link
                      href={`/packages?search=${encodeURIComponent(dest.name)}`}
                      key={`int-${i}`}
                      className={`dest-card cat-${dest.category} flex-none w-40 md:w-48 group snap-start`}
                    >
                      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-3 bg-[var(--surface-2)]">
                        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <h3 className="text-[var(--text)] font-bold text-lg px-1">{dest.name}</h3>
                    </Link>
                  ))
                ) : (
                  // Fallbacks for International with Categories assigned
                  [
                    { name: "Dubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=400", href: "/packages?search=Dubai", cat: "FAMILY" },
                    { name: "Bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=400", href: "/packages?search=Bali", cat: "BEACH" },
                    { name: "Singapore", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=400", href: "/packages?search=Singapore", cat: "FAMILY" },
                    { name: "Thailand", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=400", href: "/packages?search=Thailand", cat: "BEACH" },
                    { name: "Maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=400", href: "/packages?search=Maldives", cat: "HONEYMOON" },
                    { name: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400", href: "/packages?search=Paris", cat: "HONEYMOON" },
                  ].map((dest, i) => (
                    <Link href={dest.href} key={`fall-int-${i}`} className={`dest-card cat-${dest.cat} flex-none w-40 md:w-48 group snap-start`}>
                      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-3 bg-[var(--surface-2)]">
                        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <h3 className="text-[var(--text)] font-bold text-lg px-1">{dest.name}</h3>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[var(--accent)] text-sm font-bold tracking-[0.2em] uppercase mb-3">Browse by type</p>
            <h2 className="text-4xl font-bold text-[var(--text)] font-['Playfair_Display']">What kind of trip?</h2>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/packages?category=${cat.slug}`}
                className="flex flex-col items-center gap-3 p-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:border-[var(--accent-border-strong)] hover:shadow-[var(--shadow)] transition-all duration-300 group"
              >
                <span className="text-3xl group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">{cat.icon}</span>
                <span className="text-[var(--text-secondary)] text-xs font-medium group-hover:text-[var(--text)] transition-colors text-center">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Packages ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[var(--accent)] text-sm font-bold tracking-[0.2em] uppercase mb-3">Top rated</p>
              <h2 className="text-4xl font-bold text-[var(--text)] font-['Playfair_Display']">Featured Packages</h2>
            </div>
            <Link
              href="/packages"
              className="hidden md:flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm font-bold"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/packages/${pkg.slug}`}
                className="group rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-border-strong)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-[var(--surface-2)] shrink-0">
                  {pkg.images[0] && (
                    <img
                      src={pkg.images[0]}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1.5 rounded-full bg-[var(--overlay-strong)] backdrop-blur-md text-[var(--on-dark)] text-xs font-medium border border-[var(--border)] shadow-sm">
                      {pkg.category.charAt(0) + pkg.category.slice(1).toLowerCase()}
                    </span>
                  </div>
                  {/* Rating */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--overlay-strong)] backdrop-blur-md border border-[var(--border)] shadow-sm">
                    <Star className="w-3.5 h-3.5 text-[var(--warning)] fill-[var(--warning)]" />
                    <span className="text-[var(--on-dark)] text-xs font-bold">{pkg.avgRating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-xs font-medium mb-3">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{pkg.destination}, {pkg.country}</span>
                  </div>

                  <h3 className="text-[var(--text)] font-bold text-lg mb-4 line-clamp-2 group-hover:text-[var(--accent)] font-['Playfair_Display'] leading-snug transition-colors">
                    {pkg.title}
                  </h3>

                  <div className="mt-auto">
                    <div className="flex items-end justify-between mb-5">
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
                        View details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link href="/packages"
              className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl border border-[var(--border)] text-[var(--text)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-all text-sm font-bold shadow-sm">
              View all packages
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Travely ── */}
      <section className="py-20 px-6 border-t border-[var(--border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-soft)] rounded-full blur-[100px] -z-10 opacity-50" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-[var(--accent)] text-sm font-bold tracking-[0.2em] uppercase mb-3">Why us</p>
            <h2 className="text-4xl font-bold text-[var(--text)] font-['Playfair_Display']">Travel with confidence</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-6 h-6 text-[var(--accent)]" />,
                title: "Verified Providers",
                desc: "Every travel provider is manually verified by our team. Your safety and satisfaction is our top priority.",
              },
              {
                icon: <CreditCard className="w-6 h-6 text-[var(--accent)]" />,
                title: "Secure Payments",
                desc: "Pay securely via Razorpay or Stripe. We support partial payments and offer full refund protection.",
              },
              {
                icon: <Headphones className="w-6 h-6 text-[var(--accent)]" />,
                title: "24/7 Support",
                desc: "Our travel experts are available around the clock to assist you before, during, and after your trip.",
              },
            ].map((item) => (
              <div key={item.title} className="p-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-border-strong)] hover:shadow-[var(--shadow)] transition-all duration-300 text-center md:text-left group">
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-[var(--text)] font-bold text-xl mb-3 font-['Playfair_Display']">{item.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="premium-panel-strong p-12 md:p-16 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-80" style={{ background: "var(--hero-gradient)" }} />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-[var(--text)] font-['Playfair_Display'] mb-6 leading-tight">
                Ready to explore?
              </h2>
              <p className="text-[var(--text-secondary)] text-lg mb-10 max-w-xl mx-auto font-medium">
                Join 12,000+ travelers who discovered their dream trip on Travely.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/packages"
                  className="px-8 py-4 rounded-2xl brand-gradient hover:opacity-90 text-[var(--on-accent)] font-semibold transition-all duration-300 flex items-center gap-2 justify-center shadow-[var(--shadow)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1">
                  Browse Packages
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/signup"
                  className="px-8 py-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] transition-all duration-300 font-semibold active:scale-[0.98]">
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] py-12 px-6 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
              <img src="/travely-logo.png" alt="Travely Logo" className="h-full w-full object-contain" />
            </span>
            <span className="text-2xl font-bold text-[var(--text)] font-['Playfair_Display'] transition-colors group-hover:text-[var(--accent)]">
              travely
            </span>
          </Link>
          <p className="text-[var(--text-muted)] text-sm font-medium">© 2026 Travely. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <Link key={item} href="#" className="text-[var(--text-muted)] hover:text-[var(--accent)] text-sm transition-colors font-medium">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>

    </main>
  )
}