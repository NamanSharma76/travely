import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { LayoutDashboard, Package, CalendarCheck, BarChart3, Settings, BookText } from "lucide-react"

const navItems = [
  { href: "/provider", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/provider/packages", label: "Packages", icon: Package },
  { href: "/provider/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/provider/earnings", label: "Earnings", icon: BarChart3 },
  { href: "/provider/settings", label: "Settings", icon: Settings },
  { href: "/provider/stories", label: "Stories", icon: BookText },
]

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
  })

  if (!provider) redirect("/become-provider")

  if (provider.status === "PENDING") {
    return (
      <div className="min-h-screen bg-[var(--bg)] pt-24 flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--warning-soft)] border border-[color:var(--warning-border)] flex items-center justify-center mx-auto">
            <span className="text-2xl">⏳</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] font-['Playfair_Display']">
            Application Under Review
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Your provider application is being reviewed. You'll get access once verified by our team (1-2 business days).
          </p>
        </div>
      </div>
    )
  }

  if (provider.status === "REJECTED" || provider.status === "SUSPENDED") {
    return (
      <div className="min-h-screen bg-[var(--bg)] pt-24 flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--danger-soft)] border border-[color:var(--danger-border)] flex items-center justify-center mx-auto">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] font-['Playfair_Display']">Access Restricted</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Your provider account has been {provider.status.toLowerCase()}. Contact support for help.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-16">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-60 fixed left-0 top-24 bottom-0 border-r border-[var(--border)] bg-[var(--bg)] p-4">
          <div className="mb-6 px-3 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <p className="text-[var(--text)] font-semibold text-sm truncate">{provider.businessName}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
              <span className="text-[var(--success)] text-xs">Verified</span>
            </div>
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

          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-xs transition-colors"
          >
            ← Back to Travely
          </Link>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-60 p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}