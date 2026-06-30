import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Eye, ArrowRight, MapPin, BookText } from "lucide-react"

async function getStories() {
  return await prisma.story.findMany({
    where: { isActive: true },
    include: {
      package: { select: { title: true, slug: true, destination: true, country: true } },
      provider: { select: { businessName: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function StoriesPage() {
  const stories = await getStories()

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20">

      <div className="h-10"></div>
      {/* Hero */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--hero-gradient)" }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)] text-sm font-medium mb-6">
            <BookText className="w-3.5 h-3.5" />
            Real trips, real stories
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-[var(--text)] font-['Playfair_Display'] leading-tight mb-6">
            Stories from<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)]">
              the road.
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
            Hear directly from our travel providers about the trips they've crafted and the experiences travelers loved.
          </p>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {stories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📖</p>
              <p className="text-[var(--text-secondary)] text-lg">No stories published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <Link key={story.id} href={`/stories/${story.slug}`}
                  className="group rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-border-strong)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-1">

                  <div className="relative h-52 overflow-hidden bg-[var(--surface-2)]">
                    <img src={story.coverImage} alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Package badge — shows which package this story belongs to */}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium border border-white/10">
                        📦 {story.package.title}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs mb-2">
                      <MapPin className="w-3 h-3" />
                      {story.package.destination}, {story.package.country}
                    </div>
                    <h3 className="text-[var(--text)] font-bold text-lg mb-2 line-clamp-2 group-hover:text-[var(--accent)] font-['Playfair_Display'] transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mb-4">{story.excerpt}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                      <span className="text-[var(--text-muted)] text-xs">{story.provider.businessName}</span>
                      <span className="text-[var(--accent)] text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read story <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}