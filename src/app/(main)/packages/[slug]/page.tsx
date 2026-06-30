import PackageStoriesSection from "@/components/PackageStoriesSection"
import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import {
  MapPin, Clock, Star, Users, Check, X,
  Calendar, ArrowLeft, Shield, ChevronRight
} from "lucide-react"

async function getPackage(slug: string) {
  return await prisma.package.findFirst({
    where: { slug },
    include: {
      provider: true,
      itinerary: { orderBy: { day: "asc" } },
      availableDates: {
        where: { isAvailable: true, startDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
        take: 6,
      },
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      stories: {
       where: { isActive: true },
       select: { id: true, title: true, slug: true, excerpt: true, coverImage: true },
     },
    },
  })
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const pkg = await getPackage(slug)
  if (!pkg) notFound()

  const formatPrice = (price: any) =>
    `₹${Number(price).toLocaleString("en-IN")}`

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    })

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20">

      <div className="h-10"></div>
      {/* Image Gallery */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="grid grid-cols-3 h-full gap-1">
          {pkg.images.slice(0, 3).map((img, i) => (
            <div
              key={i}
              className={`relative overflow-hidden bg-[var(--surface-2)] ${i === 0 ? "col-span-2" : ""}`}
            >
              <img src={img} alt={pkg.title} className="w-full h-full object-cover" />
              {i === 0 && (
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent opacity-80" />
              )}
            </div>
          ))}
        </div>

        {/* Back button - FIXED CONTRAST */}
        <Link
          href="/packages"
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white font-medium shadow-sm hover:bg-black/60 hover:scale-105 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Category badge - FIXED CONTRAST */}
        <div className="absolute top-6 right-6 z-10">
          <span className="inline-block px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white text-sm font-bold tracking-wide uppercase shadow-sm">
            {pkg.category}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Left: Main Content ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Title & Meta */}
            <div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-3">
                <MapPin className="w-4 h-4" />
                <span>{pkg.destination}, {pkg.country}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[var(--text-muted)]">{pkg.provider.businessName}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] font-['Playfair_Display'] mb-4">
                {pkg.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[var(--warning)] fill-[var(--warning)]" />
                  <span className="text-[var(--text)] font-semibold">{pkg.avgRating.toFixed(1)}</span>
                  <span className="text-[var(--text-secondary)] text-sm">({pkg.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{pkg.durationDays} days</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm">
                  <Users className="w-4 h-4" />
                  <span>Max {pkg.maxTravelers} travelers</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-[var(--text)] font-['Playfair_Display'] mb-4">Overview</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">{pkg.description}</p>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <h3 className="text-[var(--text)] font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--success-soft)] flex items-center justify-center">
                    <Check className="w-3 h-3 text-[var(--success)]" />
                  </span>
                  Included
                </h3>
                <ul className="space-y-2">
                  {pkg.inclusions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[var(--text-secondary)] text-sm">
                      <Check className="w-3.5 h-3.5 text-[var(--success)] mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <h3 className="text-[var(--text)] font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--danger-soft)] flex items-center justify-center">
                    <X className="w-3 h-3 text-[var(--danger)]" />
                  </span>
                  Not Included
                </h3>
                <ul className="space-y-2">
                  {pkg.exclusions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[var(--text-secondary)] text-sm">
                      <X className="w-3.5 h-3.5 text-[var(--danger)] mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Itinerary */}
            {pkg.itinerary.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-[var(--text)] font-['Playfair_Display'] mb-6">Itinerary</h2>
                <div className="space-y-4">
                  {pkg.itinerary.map((day) => (
                    <div key={day.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-border-strong)] flex items-center justify-center flex-shrink-0">
                          <span className="text-[var(--accent)] text-xs font-bold">{day.day}</span>
                        </div>
                        {day.day < pkg.itinerary.length && (
                          <div className="w-px flex-1 bg-[var(--surface-2)] my-2" />
                        )}
                      </div>
                      <div className="pb-6 flex-1">
                        <h3 className="text-[var(--text)] font-semibold mb-2">{day.title}</h3>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3">{day.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {day.meals.map((meal) => (
                            <span key={meal} className="px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs border border-[var(--accent-border)]">
                              🍽 {meal}
                            </span>
                          ))}
                          {day.activities.map((activity) => (
                            <span key={activity} className="px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)] text-xs border border-[var(--border)]">
                              {activity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {pkg.reviews.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-[var(--text)] font-['Playfair_Display'] mb-6">
                  Reviews
                  <span className="text-[var(--text-muted)] text-base font-normal ml-2">({pkg.totalReviews})</span>
                </h2>
                <div className="space-y-4">
                  {pkg.reviews.map((review) => (
                    <div key={review.id} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-soft-hover)] flex items-center justify-center">
                          {review.user.image ? (
                            <img src={review.user.image} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-[var(--accent)] text-sm font-semibold">
                              {review.user.name?.[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-[var(--text)] text-sm font-medium">{review.user.name}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < review.rating ? "text-[var(--warning)] fill-[var(--warning)]" : "text-[var(--border-strong)]"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.title && (
                        <p className="text-[var(--text)] text-sm font-medium mb-1">{review.title}</p>
                      )}
                      <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{review.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stories */}
            <PackageStoriesSection stories={pkg.stories} />

            {/* Provider Info */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <h2 className="text-xl font-bold text-[var(--text)] font-['Playfair_Display'] mb-4">About the Provider</h2>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center flex-shrink-0">
                  <span className="text-[var(--accent)] font-bold text-lg">
                    {pkg.provider.businessName[0]}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[var(--text)] font-semibold">{pkg.provider.businessName}</h3>
                    {pkg.provider.status === "VERIFIED" && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--success-soft)] border border-[var(--success-border)] text-[var(--success)] text-xs">
                        <Shield className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  {pkg.provider.description && (
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{pkg.provider.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Booking Card ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] space-y-5 shadow-[var(--shadow)]">
                {/* Price */}
                <div>
                  <p className="text-[var(--text-secondary)] text-sm">Starting from</p>
                  <p className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">
                    {formatPrice(pkg.pricePerPerson)}
                    <span className="text-[var(--text-muted)] text-base font-normal"> /person</span>
                  </p>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                    <p className="text-[var(--text-muted)] text-xs mb-1">Duration</p>
                    <p className="text-[var(--text)] text-sm font-medium">{pkg.durationDays} Days</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                    <p className="text-[var(--text-muted)] text-xs mb-1">Max Group</p>
                    <p className="text-[var(--text)] text-sm font-medium">{pkg.maxTravelers} People</p>
                  </div>
                </div>

                {/* Available Dates */}
                {pkg.availableDates.length > 0 && (
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm font-medium mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Available Dates
                    </p>
                    <div className="space-y-2">
                      {pkg.availableDates.slice(0, 4).map((date) => (
                        <div key={date.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                          <div>
                            <p className="text-[var(--text)] text-xs font-medium">{formatDate(date.startDate)}</p>
                            <p className="text-[var(--text-muted)] text-xs">to {formatDate(date.endDate)}</p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${
                            date.spotsLeft <= 3
                              ? "bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger-border)]"
                              : "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]"
                          }`}>
                            {date.spotsLeft} spots
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <Link
                  href={`/packages/${pkg.slug}/book`}
                  className="block w-full py-4 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-semibold text-center transition-all duration-200 shadow-[var(--shadow)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  Book This Package
                </Link>

                <p className="text-[var(--text-muted)] text-xs text-center">
                  No payment charged yet. Review your booking first.
                </p>

                {/* Trust signals */}
                <div className="pt-2 border-t border-[var(--border)] space-y-2">
                  {[
                    "Free cancellation up to 7 days before",
                    "Secure payment via Razorpay / Stripe",
                    "24/7 customer support",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
                      <Check className="w-3 h-3 text-[var(--accent)] flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}