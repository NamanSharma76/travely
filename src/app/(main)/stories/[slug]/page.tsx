import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ArrowLeft, MapPin, Clock, Star, ArrowRight, Shield } from "lucide-react"

async function getStory(slug: string) {
  const story = await prisma.story.findFirst({
    where: { slug, isActive: true },
    include: {
      provider: { select: { businessName: true, status: true } },
      package: true,
    },
  })

  if (story) {
    // increment view count, fire and forget
    await prisma.story.update({
      where: { id: story.id },
      data: { views: { increment: 1 } },
    })
  }

  return story
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const story = await getStory(slug)
  if (!story) notFound()

  const formatPrice = (price: any) => `₹${Number(price).toLocaleString("en-IN")}`

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20">

      <div className="h-10"></div>
      {/* Cover Image */}
      <div className="relative h-[45vh] md:h-[55vh] overflow-hidden">
        <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-black/30 to-black/20" />

        <Link href="/stories"
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-white/10 text-white text-sm transition-colors hover:bg-black/60">
          <ArrowLeft className="w-4 h-4" /> All Stories
        </Link>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-3xl mx-auto">
            <p className="text-white/70 text-sm font-medium mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {story.package.destination}, {story.package.country}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-white font-['Playfair_Display'] leading-tight">
              {story.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* Author info */}
        <div className="flex items-center gap-3 pb-6 border-b border-[var(--border)]">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center">
            <span className="text-[var(--accent)] font-bold">{story.provider.businessName[0]}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[var(--text)] font-medium text-sm">{story.provider.businessName}</p>
              {story.provider.status === "VERIFIED" && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--success-soft)] border border-[var(--success-border)] text-[var(--success)] text-xs">
                  <Shield className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-[var(--text-muted)] text-xs">{story.views} views</p>
          </div>
        </div>

        {/* Story Content */}
        <div className="prose-story">
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed whitespace-pre-line">
            {story.content}
          </p>
        </div>

        {/* Additional Images */}
        {story.images.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {story.images.map((img, i) => (
              <div key={i} className="rounded-2xl overflow-hidden aspect-[4/3] bg-[var(--surface-2)]">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Linked Package Card — the conversion point */}
        <div className="premium-panel-strong rounded-3xl p-6 md:p-8">
          <p className="text-[var(--accent)] text-xs font-bold uppercase tracking-wider mb-4">The package behind this story</p>
          <Link href={`/packages/${story.package.slug}`}
            className="flex flex-col sm:flex-row gap-5 group">
            <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden bg-[var(--surface-2)] flex-shrink-0">
              {story.package.images[0] && (
                <img src={story.package.images[0]} alt={story.package.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-[var(--text)] font-bold text-xl font-['Playfair_Display'] mb-2 group-hover:text-[var(--accent)] transition-colors">
                {story.package.title}
              </h3>
              <div className="flex items-center gap-4 text-[var(--text-secondary)] text-sm mb-3">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {story.package.durationDays} days</span>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[var(--warning)] fill-[var(--warning)]" /> {story.package.avgRating.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[var(--text)] font-bold text-lg">
                  {formatPrice(story.package.pricePerPerson)}
                  <span className="text-[var(--text-secondary)] text-sm font-normal">/person</span>
                </p>
                <span className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-sm font-medium group-hover:bg-[var(--accent-hover)] transition-colors">
                  View & Book <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}