import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, Eye, MapPin, Calendar, BookText } from "lucide-react"
import StoryToggleButton from "@/components/provider/StoryToggleButton"

export default async function ProviderStoriesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
  })
  if (!provider) redirect("/become-provider")

  const stories = await prisma.story.findMany({
    where: { providerId: provider.id },
    include: {
      package: { select: { title: true, slug: true, destination: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

  return (
    <div className="space-y-6">
      <div className="h-5"></div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display'] flex items-center gap-2">
            <BookText className="w-7 h-7 text-[var(--accent)]" />
            Stories
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">{stories.length} story{stories.length !== 1 ? "ies" : "y"} published</p>
        </div>
        <Link href="/provider/stories/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Write Story
        </Link>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📖</p>
          <h3 className="text-[var(--text-secondary)] text-xl font-medium mb-2">No stories yet</h3>
          <p className="text-[var(--text-muted)] text-sm mb-6">Share real trip experiences to build trust and drive bookings</p>
          <Link href="/provider/stories/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors">
            <Plus className="w-4 h-4" /> Write Your First Story
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <div key={story.id} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--surface-2)] flex-shrink-0">
                  <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[var(--text)] font-semibold font-['Playfair_Display'] mb-1">{story.title}</h3>
                      <p className="text-[var(--accent)] text-xs font-medium flex items-center gap-1">
                        📦 {story.package.title}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-full border text-xs font-medium ${
                      story.isActive
                        ? "bg-[var(--success-soft)] text-[var(--success)] border-[var(--success-border)]"
                        : "bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]"
                    }`}>
                      {story.isActive ? "Published" : "Hidden"}
                    </span>
                  </div>

                  <p className="text-[var(--text-secondary)] text-sm mt-2 line-clamp-1">{story.excerpt}</p>

                  <div className="flex items-center gap-4 mt-3 text-[var(--text-muted)] text-xs">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {story.views} views</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(story.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border)]">
                    <Link href={`/stories/${story.slug}`} target="_blank"
                      className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text)] text-xs transition-colors">
                      <Eye className="w-3 h-3" /> View live
                    </Link>
                    <StoryToggleButton storyId={story.id} isActive={story.isActive} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}