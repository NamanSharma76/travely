"use client"

import { useState } from "react"
import { Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupForm) => {
    setError("")
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Something went wrong")
        return
      }

      // Auto login after signup
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      router.push("/")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    await signIn("google", { callbackUrl: "/" })
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[var(--bg-secondary)]">
        <div className="absolute inset-0">
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

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Spacer to replace redundant logo and maintain flex-between layout */}
          <div className="h-10" />

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-[var(--accent)] text-sm font-bold tracking-[0.2em] uppercase drop-shadow-sm">
                Start your journey
              </p>
              <h2 className="text-5xl lg:text-6xl font-bold text-[var(--text)] leading-tight font-['Playfair_Display']">
                Every trip<br />
                begins with<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)]">a step.</span>
              </h2>
            </div>
            <p className="text-[var(--text-secondary)] text-lg max-w-sm leading-relaxed font-medium">
              Join thousands of travelers discovering their next adventure with Travely.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Browse 500+ curated packages",
              "Book with verified providers",
              "Pay securely with Razorpay or Stripe",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
                </div>
                <p className="text-[var(--text-secondary)] text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[var(--surface)] shadow-[-20px_0_40px_rgba(0,0,0,0.02)] z-10">
        <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Mobile Spacer to replace redundant logo and account for navbar */}
          <div className="h-10 lg:hidden mb-8" />

          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[var(--text)] font-['Playfair_Display']">
              Create account
            </h1>
            <p className="text-[var(--text-secondary)] text-lg">Join Travely and start exploring</p>
          </div>

          {/* Google */}
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
            <span className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">or sign up with email</span>
            <div className="flex-1 h-px bg-[var(--border-strong)]" />
          </div>

          {error && (
            <div className="px-4 py-3.5 rounded-2xl bg-[var(--danger-soft)] border border-[var(--danger-border)] text-[var(--danger)] text-sm font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[var(--text-secondary)] text-sm font-medium ml-1">Full name</label>
              <input
                {...register("name")}
                type="text"
                placeholder="Naman Sharma"
                className="w-full px-4 py-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all duration-300 shadow-sm focus:shadow-[var(--shadow)]"
              />
              {errors.name && (
                <p className="text-[var(--danger)] text-xs font-medium ml-1 mt-1">{errors.name.message}</p>
              )}
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[var(--text-secondary)] text-sm font-medium ml-1">Password</label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[var(--danger)] text-xs font-medium ml-1 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[var(--text-secondary)] text-sm font-medium ml-1">Confirm</label>
                <div className="relative">
                  <input
                    {...register("confirmPassword")}
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all duration-300 shadow-sm focus:shadow-[var(--shadow)] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors p-1"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[var(--danger)] text-xs font-medium ml-1 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl brand-gradient text-[var(--on-accent)] font-semibold transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 shadow-[var(--shadow)] hover:shadow-[var(--shadow-lg)] active:scale-[0.98] hover:-translate-y-0.5 mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="text-center text-[var(--text-secondary)] text-sm pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors font-bold tracking-wide">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}