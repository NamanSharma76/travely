"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Menu, X, ChevronDown, LogOut, User, BookOpen, LayoutDashboard, Building2, ShieldCheck } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const { setTheme, resolvedTheme } = useTheme()
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMobileOpen(false)
      setIsUserMenuOpen(false)
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  const navLinks = [
    { href: "/packages", label: "Packages" },
    { href: "/destinations", label: "Destinations" },
    { href: "/stories", label: "Stories" },
    { href: "/about", label: "About" },
  ]

  const isActive = (href: string) => pathname === href
  const isDark = mounted ? resolvedTheme === "dark" : false

  return (
    <>
      {/* Wrapper added to create the separated floating effect. Increased top padding from top-4 to top-6/md:top-8 */}
      <div className="fixed top-6 md:top-8 inset-x-0 z-[999] flex justify-center px-4 md:px-8 pointer-events-none transition-all duration-300">
        <nav suppressHydrationWarning className={`pointer-events-auto w-full max-w-7xl flex items-center justify-between px-5 md:px-8 rounded-full transition-all duration-300 ${
          isScrolled
            ? "bg-[var(--elevated)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--shadow-lg)] py-3 md:py-3.5"
            : "bg-transparent py-3 md:py-4"
        }`}>

          {/* Logo - Increased wrapper size from h-10/w-10 to h-12/w-12 */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
              <img 
                src="/travely-logo.png" 
                alt="Travely Logo" 
                className="h-full w-full object-contain"
              />
            </span>
            <span className="text-2xl font-bold font-['Playfair_Display'] tracking-tight transition-colors text-[var(--text)] group-hover:text-[var(--accent)]">
              travely.
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-[var(--accent)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="p-2.5 rounded-xl border border-[var(--border)] transition-all hover:bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] hover:shadow-[var(--shadow)]"
                title="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-2xl transition-all hover:bg-[var(--surface-2)] border border-transparent hover:border-[var(--border)]"
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center overflow-hidden shadow-sm">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[var(--accent)] text-sm font-bold">
                        {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-[var(--text)] max-w-[100px] truncate leading-tight">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-medium tracking-wide uppercase">
                      {session.user?.role?.toLowerCase()}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-300 text-[var(--text-muted)] ${isUserMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] w-64 rounded-2xl bg-[var(--elevated)] backdrop-blur-3xl border border-[var(--border-strong)] shadow-[var(--shadow-lg)] z-[1000] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--surface-2)]/50">
                      <p className="text-sm font-bold truncate text-[var(--text)]">{session.user?.name}</p>
                      <p className="text-xs truncate text-[var(--text-secondary)] mt-0.5">{session.user?.email}</p>
                    </div>

                    <div className="py-2">
                      {[
                        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                        { href: "/bookings", icon: BookOpen, label: "My Bookings" },
                        { href: "/profile", icon: User, label: "Profile Settings" },
                      ].map((item) => (
                        <Link key={item.href} href={item.href}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]">
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}

                      {session.user?.role === "USER" && (
                        <Link href="/become-provider"
                          className="flex items-center gap-3 px-5 py-3 mt-1 text-sm transition-colors border-t border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] group">
                          <div className="p-1.5 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] group-hover:scale-110 transition-transform">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block font-medium text-[var(--text)]">List your packages</span>
                            <span className="block text-[11px] text-[var(--text-muted)] mt-0.5">Become a provider</span>
                          </div>
                        </Link>
                      )}

                      {(session.user?.role === "PROVIDER" || session.user?.role === "ADMIN") && (
                        <Link href="/provider"
                          className="flex items-center gap-3 px-5 py-3 mt-1 text-sm transition-colors border-t border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] group">
                          <div className="p-1.5 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] group-hover:scale-110 transition-transform">
                            <LayoutDashboard className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block font-medium text-[var(--text)]">Provider Dashboard</span>
                            <span className="block text-[11px] text-[var(--text-muted)] mt-0.5">Manage packages</span>
                          </div>
                        </Link>
                      )}

                      {session.user?.role === "ADMIN" && (
                        <Link href="/admin"
                          className="flex items-center gap-3 px-5 py-3 mt-1 text-sm transition-colors border-t border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] group">
                          <div className="p-1.5 rounded-lg bg-[var(--danger-soft)] text-[var(--danger)] group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block font-medium text-[var(--text)]">Admin Panel</span>
                            <span className="block text-[11px] text-[var(--text-muted)] mt-0.5">Manage platform</span>
                          </div>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-[var(--border)] p-2">
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[var(--danger)] font-medium hover:bg-[var(--danger-soft)] transition-colors text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login"
                  className="text-sm font-semibold transition-colors px-5 py-2.5 rounded-xl text-[var(--text)] hover:bg-[var(--surface-2)]">
                  Sign in
                </Link>
                <Link href="/signup"
                  className="text-sm font-semibold brand-gradient text-[var(--on-accent)] px-6 py-2.5 rounded-xl shadow-[var(--shadow)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-0.5">
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="p-2 rounded-xl border border-[var(--border)] transition-all bg-[var(--surface)] text-[var(--text-secondary)]"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-colors text-[var(--text)]"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[990] pt-24 px-6 md:hidden overflow-y-auto bg-[var(--elevated)] backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-2)] font-medium transition-colors text-[var(--text)] active:scale-[0.98]">
                {link.label}
                <ChevronDown className="w-4 h-4 -rotate-90 text-[var(--text-muted)]" />
              </Link>
            ))}
          </div>

          <div className="mt-8 space-y-3 pb-8">
            {session ? (
              <div className="premium-panel p-4 rounded-3xl">
                <div className="flex items-center gap-4 pb-4 border-b border-[var(--border)] mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center overflow-hidden">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[var(--accent)] font-bold text-lg">
                        {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text)]">{session.user?.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{session.user?.email}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {[
                    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                    { href: "/bookings", icon: BookOpen, label: "My Bookings" },
                    { href: "/profile", icon: User, label: "Profile Settings" },
                  ].map((item) => (
                    <Link key={item.href} href={item.href}
                      className="flex items-center gap-3 p-3 rounded-xl transition-colors text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]">
                      <item.icon className="w-4 h-4" /> 
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  ))}

                  {session.user?.role === "USER" && (
                    <Link href="/become-provider"
                      className="flex items-center gap-3 p-3 rounded-xl transition-colors text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]">
                      <Building2 className="w-4 h-4" /> 
                      <span className="font-medium text-sm">Become a Provider</span>
                    </Link>
                  )}
                  {(session.user?.role === "PROVIDER" || session.user?.role === "ADMIN") && (
                    <Link href="/provider"
                      className="flex items-center gap-3 p-3 rounded-xl transition-colors text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]">
                      <LayoutDashboard className="w-4 h-4" /> 
                      <span className="font-medium text-sm">Provider Dashboard</span>
                    </Link>
                  )}
                  {session.user?.role === "ADMIN" && (
                    <Link href="/admin"
                      className="flex items-center gap-3 p-3 rounded-xl transition-colors text-[var(--danger)] hover:bg-[var(--danger-soft)]">
                      <ShieldCheck className="w-4 h-4" /> 
                      <span className="font-medium text-sm">Admin Panel</span>
                    </Link>
                  )}
                </div>

                <button onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center justify-center gap-2 p-3 mt-4 rounded-xl bg-[var(--danger-soft)] text-[var(--danger)] font-medium active:scale-[0.98] transition-transform text-sm">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login"
                  className="flex items-center justify-center py-3.5 rounded-xl border border-[var(--border)] font-semibold transition-colors text-[var(--text)] bg-[var(--surface)] active:scale-[0.98]">
                  Sign in
                </Link>
                <Link href="/signup"
                  className="flex items-center justify-center py-3.5 rounded-xl brand-gradient text-[var(--on-accent)] font-semibold shadow-[var(--shadow)] active:scale-[0.98] transition-all">
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {isUserMenuOpen && (
        <div className="fixed inset-0 z-[990]" onClick={() => setIsUserMenuOpen(false)} />
      )}
    </>
  )
}