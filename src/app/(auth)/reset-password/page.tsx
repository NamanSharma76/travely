"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle } from "lucide-react"

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ResetForm = z.infer<typeof schema>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: ResetForm) => {
    setError("")
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password: data.password }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error || "Something went wrong")
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/login"), 2000)
    } catch {
      setError("Something went wrong. Please try again.")
    }
  }

  if (!token || !email) {
    return (
      <div className="text-center space-y-5 py-4">
        <div className="w-16 h-16 rounded-full bg-[var(--danger-soft)] flex items-center justify-center mx-auto mb-2">
          <span className="text-[var(--danger)] text-2xl font-bold">!</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--text)] font-['Playfair_Display']">
          Invalid link
        </h2>
        <p className="text-[var(--text-secondary)] text-sm">This password reset link is invalid or has expired.</p>
        <Link 
          href="/forgot-password" 
          className="inline-block mt-4 px-6 py-3 rounded-xl bg-[var(--surface-2)] text-[var(--text)] font-semibold hover:bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all"
        >
          Request a new one
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center space-y-5 py-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-full bg-[var(--success-soft)] flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-[var(--success)]" />
        </div>
        <h2 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">
          Password reset!
        </h2>
        <p className="text-[var(--text-secondary)] text-sm font-medium">
          Your password has been successfully updated. Redirecting you to login...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display'] leading-tight">
          Set new password
        </h1>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          Please enter your new password below. Make sure it's at least 6 characters long.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3.5 rounded-2xl bg-[var(--danger-soft)] border border-[var(--danger-border)] text-[var(--danger)] text-sm font-medium flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[var(--text-secondary)] text-sm font-medium ml-1">New password</label>
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
          {errors.password && <p className="text-[var(--danger)] text-xs font-medium ml-1 mt-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[var(--text-secondary)] text-sm font-medium ml-1">Confirm password</label>
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors p-1"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-[var(--danger)] text-xs font-medium ml-1 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl brand-gradient text-[var(--on-accent)] font-semibold transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 shadow-[var(--shadow)] hover:shadow-[var(--shadow-lg)] active:scale-[0.98] hover:-translate-y-0.5 mt-2"
        >
          {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" />Resetting...</> : "Reset password"}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[var(--accent-soft)] rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm font-medium ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="premium-panel-strong p-8 sm:p-10 rounded-[2rem]">
          <Link href="/" className="flex items-center gap-3 group w-fit mb-10">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
              <img src="/travely-logo.png" alt="Travely Logo" className="h-full w-full object-contain" />
            </span>
            <span className="text-2xl font-bold text-[var(--text)] font-['Playfair_Display'] tracking-tight transition-colors group-hover:text-[var(--accent)]">
              travely
            </span>
          </Link>

          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
              <div className="text-[var(--text-secondary)] font-medium">Loading secure connection...</div>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}