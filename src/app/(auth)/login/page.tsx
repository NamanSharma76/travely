"use client"

import { Phone } from "lucide-react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setError("")
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password")
    } else {
      // Fetch session to get role
      const res = await fetch("/api/auth/session")
      const session = await res.json()
      const role = session?.user?.role

      if (role === "ADMIN") {
        router.push("/admin")
      } else if (role === "PROVIDER") {
        router.push("/provider")
      } else {
        router.push("/")
      }
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    const res = await fetch("/api/auth/session")
    const session = await res.json()
    const role = session?.user?.role

    if (role === "ADMIN") {
      await signIn("google", { callbackUrl: "/admin" })
    } else if (role === "PROVIDER") {
      await signIn("google", { callbackUrl: "/provider" })
    } else {
      await signIn("google", { callbackUrl: "/" })
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex">

      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[var(--bg-secondary)]">
        <div className="absolute inset-0">
          {/* Geometric pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, var(--accent-deep) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, var(--accent) 0%, transparent 50%)`,
            }}
          />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(45deg, var(--accent) 1px, transparent 1px),
                linear-gradient(-45deg, var(--accent) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Content - Added pt-32 to protect from the floating navbar */}
        <div className="relative z-10 flex flex-col justify-between p-12 pt-32 w-full h-full">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-[var(--accent)] text-sm font-bold tracking-[0.2em] uppercase drop-shadow-sm">
                Your next adventure
              </p>
              <h2 className="text-5xl lg:text-6xl font-bold text-[var(--text)] leading-tight font-['Playfair_Display']">
                The world is<br />
                waiting for<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)]">you.</span>
              </h2>
            </div>
            <p className="text-[var(--text-secondary)] text-lg max-w-sm leading-relaxed font-medium">
              Discover curated travel packages from trusted providers across India and beyond.
            </p>
          </div>

          <div className="flex gap-10 pb-8">
            <div>
              <p className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">500+</p>
              <p className="text-[var(--text-secondary)] text-sm font-medium mt-1">Destinations</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">12k+</p>
              <p className="text-[var(--text-secondary)] text-sm font-medium mt-1">Happy travelers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">98%</p>
              <p className="text-[var(--text-secondary)] text-sm font-medium mt-1">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form: Added pt-32 pb-12 and overflow-y-auto to fix overlap and allow scrolling on small screens */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 pt-32 pb-12 lg:px-16 bg-[var(--surface)] shadow-[-20px_0_40px_rgba(0,0,0,0.02)] z-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 my-auto">
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[var(--text)] font-['Playfair_Display']">
              Welcome back
            </h1>
            <p className="text-[var(--text-secondary)] text-lg">Sign in to continue your journey</p>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)] hover:shadow-sm transition-all duration-200 disabled:opacity-50 active:scale-[0.98] font-medium"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>Continue with Google</span>
          </button>
          
          <Link href="/phone-login"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)] transition-all duration-300 font-medium">
            <Phone className="w-4 h-4" />
            Continue with Phone
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--border-strong)]" />
            <span className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">or sign in with email</span>
            <div className="flex-1 h-px bg-[var(--border-strong)]" />
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3.5 rounded-2xl bg-[var(--danger-soft)] border border-[var(--danger-border)] text-[var(--danger)] text-sm font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[var(--text-secondary)] text-sm font-medium ml-1">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all duration-300 shadow-sm focus:shadow-[var(--shadow)]"
              />
              {errors.email && (
                <p className="text-[var(--danger)] text-xs font-medium ml-1 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[var(--text-secondary)] text-sm font-medium">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[var(--accent)] text-xs font-semibold hover:text-[var(--accent-hover)] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all duration-300 shadow-sm focus:shadow-[var(--shadow)] pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[var(--danger)] text-xs font-medium ml-1 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl brand-gradient text-[var(--on-accent)] font-semibold transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 shadow-[var(--shadow)] hover:shadow-[var(--shadow-lg)] active:scale-[0.98] hover:-translate-y-0.5 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-center text-[var(--text-secondary)] text-sm pt-4 pb-4">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors font-bold tracking-wide">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}