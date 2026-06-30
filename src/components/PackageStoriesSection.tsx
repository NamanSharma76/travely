// Add this component to src/app/(main)/packages/[slug]/page.tsx
// Place it in the "Left: Main Content" column, after Reviews section, before Provider Info.

import Link from "next/link"
import { ArrowRight } from "lucide-react"

type PackageStory = {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string
}

export default function PackageStoriesSection({ stories }: { stories: PackageStory[] }) {
  if (stories.length === 0) return null

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--text)] font-['Playfair_Display'] mb-4">
        Stories about this trip
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stories.map((story) => (
          <Link key={story.id} href={`/stories/${story.slug}`}
            className="group rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-border-strong)] transition-all">
            <div className="h-36 overflow-hidden bg-[var(--surface-2)]">
              <img src={story.coverImage} alt={story.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4">
              <h3 className="text-[var(--text)] font-semibold text-sm mb-1 line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
                {story.title}
              </h3>
              <p className="text-[var(--text-secondary)] text-xs line-clamp-2 mb-2">{story.excerpt}</p>
              <span className="text-[var(--accent)] text-xs font-medium flex items-center gap-1">
                Read story <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   HOW TO WIRE THIS UP in packages/[slug]/page.tsx:
   ─────────────────────────────────────────────

1. Import it:
   import PackageStoriesSection from "@/components/PackageStoriesSection"

2. In getPackage(), add stories to the include:
   include: {
     provider: true,
     itinerary: { orderBy: { day: "asc" } },
     availableDates: { ... },
     reviews: { ... },
     stories: {
       where: { isActive: true },
       select: { id: true, title: true, slug: true, excerpt: true, coverImage: true },
     },
   }

3. In the JSX, after the Reviews section and before Provider Info:
   <PackageStoriesSection stories={pkg.stories} />

*/