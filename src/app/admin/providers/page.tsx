import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import ProviderActions from "@/components/admin/ProviderActions"

export default async function AdminProvidersPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/")

  const providers = await prisma.provider.findMany({
    include: {
      user: { select: { name: true, email: true, image: true } },
      _count: { select: { packages: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const pending = providers.filter((p) => p.status === "PENDING")
  const verified = providers.filter((p) => p.status === "VERIFIED")
  const others = providers.filter((p) => !["PENDING", "VERIFIED"].includes(p.status))

  const statusColors: Record<string, string> = {
    PENDING: "bg-[var(--warning-soft)] text-[var(--warning)] border-[color:var(--warning-border)]",
    VERIFIED: "bg-[var(--success-soft)] text-[var(--success)] border-[color:var(--success-border)]",
    REJECTED: "bg-[var(--danger-soft)] text-[var(--danger)] border-[color:var(--danger-border)]",
    SUSPENDED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  }

  const ProviderCard = ({ provider }: { provider: typeof providers[0] }) => (
    <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border)] transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] border border-[color:var(--accent-border)] flex items-center justify-center flex-shrink-0">
            <span className="text-[var(--accent)] font-bold">{provider.businessName[0]}</span>
          </div>
          <div>
            <h3 className="text-[var(--text)] font-semibold">{provider.businessName}</h3>
            <p className="text-[var(--text-secondary)] text-xs">{provider.user.email}</p>
            {provider.phone && <p className="text-[var(--text-muted)] text-xs">{provider.phone}</p>}
            {provider.website && (
              <a href={provider.website} target="_blank" rel="noopener noreferrer"
                className="text-[var(--accent)] text-xs hover:underline">{provider.website}</a>
            )}
          </div>
        </div>
        <span className={`flex-shrink-0 px-2.5 py-1 rounded-full border text-xs font-medium ${statusColors[provider.status]}`}>
          {provider.status.charAt(0) + provider.status.slice(1).toLowerCase()}
        </span>
      </div>

      {provider.description && (
        <p className="text-[var(--text-secondary)] text-sm mt-3 leading-relaxed line-clamp-2">{provider.description}</p>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-4">
          <span className="text-[var(--text-muted)] text-xs">{provider._count.packages} packages</span>
          <Link
            href={`/admin/providers/${provider.id}`}
            className="flex items-center gap-1 text-[var(--accent)] hover:text-[var(--accent-hover)] text-xs font-medium transition-colors"
          >
            View details <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <ProviderActions
          providerId={provider.id}
          currentStatus={provider.status}
          userId={provider.userId}
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="h-5"></div>
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">Providers</h1>
        <p className="text-[var(--text-secondary)] mt-1">{providers.length} total · {pending.length} pending</p>
      </div>

      {pending.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--warning)]" />
            Pending Review ({pending.length})
          </h2>
          {pending.map((p) => <ProviderCard key={p.id} provider={p} />)}
        </div>
      )}

      {verified.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
            Verified ({verified.length})
          </h2>
          {verified.map((p) => <ProviderCard key={p.id} provider={p} />)}
        </div>
      )}

      {others.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider">Others</h2>
          {others.map((p) => <ProviderCard key={p.id} provider={p} />)}
        </div>
      )}
    </div>
  )
}