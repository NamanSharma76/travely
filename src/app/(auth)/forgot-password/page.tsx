"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, ArrowLeft, Mail } from "lucide-react"

const schema = z.object({
  email: z.string().email("Invalid email address"),
})

type ForgotForm = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: ForgotForm) => {
    setError("")
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error || "Something went wrong")
        return
      }

      setSent(true)
    } catch {
      setError("Something went wrong. Please try again.")
    }
  }

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

          {!sent ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display'] leading-tight">
                  Forgot password?
                </h1>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  No worries. Enter your email and we'll send you a secure link to reset it.
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
                  <label className="text-[var(--text-secondary)] text-sm font-medium ml-1">Email address</label>
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl brand-gradient text-[var(--on-accent)] font-semibold transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 shadow-[var(--shadow)] hover:shadow-[var(--shadow-lg)] active:scale-[0.98] hover:-translate-y-0.5 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center space-y-5 py-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-full bg-[var(--accent-soft)] flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-[var(--accent)]" />
              </div>
              <h2 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">
                Check your inbox
              </h2>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-[280px] mx-auto">
                We sent a password reset link to{" "}
                <span className="text-[var(--text)] font-semibold">{getValues("email")}</span>
              </p>
              
              <div className="pt-6 border-t border-[var(--border)] mt-6">
                <p className="text-[var(--text-muted)] text-xs">
                  Didn't receive it? Check your spam folder or{" "}
                  <button
                    onClick={() => setSent(false)}
                    className="text-[var(--accent)] font-semibold hover:text-[var(--accent-hover)] transition-colors underline-offset-2 hover:underline"
                  >
                    try again
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}