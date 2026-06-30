import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Users, Building2, Package, ShieldCheck } from "lucide-react"

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/providers", label: "Providers", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/packages", label: "Packages", icon: Package },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/")

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-16">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-60 fixed left-0 top-24 bottom-0 border-r border-[var(--border)] bg-[var(--bg)] p-4">
          <div className="mb-6 px-3 py-3 rounded-xl bg-[var(--danger-soft)] border border-[color:var(--danger-border)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--danger)]" />
              <p className="text-[var(--danger)] font-semibold text-sm">Admin Panel</p>
            </div>
            <p className="text-[var(--text-muted)] text-xs mt-1">{session.user.email}</p>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all text-sm font-medium"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/" className="flex items-center gap-2 px-3 py-2.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-xs transition-colors">
            ← Back to Travely
          </Link>
        </aside>

        <main className="flex-1 md:ml-60 p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}