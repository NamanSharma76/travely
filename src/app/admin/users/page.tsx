// ── Admin Users Page ──
// src/app/admin/users/page.tsx

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/")

  const users = await prisma.user.findMany({
    include: {
      _count: { select: { bookings: true } },
      provider: { select: { businessName: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const roleColors: Record<string, string> = {
    USER: "bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border)]",
    PROVIDER: "bg-[var(--accent-soft)] text-[var(--accent)] border-[color:var(--accent-border)]",
    ADMIN: "bg-[var(--danger-soft)] text-[var(--danger)] border-[color:var(--danger-border)]",
  }

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    })

  return (
    <div className="space-y-6">
      <div className="h-5"></div>
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">Users</h1>
        <p className="text-[var(--text-secondary)] mt-1">{users.length} registered users</p>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border)] transition-all">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] border border-[color:var(--accent-border)] flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.image ? (
                <img src={user.image} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-[var(--accent)] font-bold text-sm">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[var(--text)] font-medium text-sm">{user.name ?? "No name"}</p>
                <span className={`px-2 py-0.5 rounded-full border text-xs ${roleColors[user.role]}`}>
                  {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                </span>
              </div>
              <p className="text-[var(--text-secondary)] text-xs">{user.email}</p>
              {user.provider && (
                <p className="text-[var(--accent)] text-xs">{user.provider.businessName}</p>
              )}
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-[var(--text-secondary)] text-xs">{user._count.bookings} bookings</p>
              <p className="text-[var(--text-muted)] text-xs">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}