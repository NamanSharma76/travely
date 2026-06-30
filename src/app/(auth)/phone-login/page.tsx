"use client"

import { useState, useRef, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Phone, ShieldCheck } from "lucide-react"

type Step = "phone" | "otp"

export default function PhoneLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [isNewUser, setIsNewUser] = useState(false)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendTimer, setResendTimer] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  const sendOtp = async () => {
    setError("")
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length < 10) {
      setError("Enter a valid 10-digit phone number")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to send OTP")
        return
      }

      setStep("otp")
      setResendTimer(60)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const verifyOtp = async () => {
    setError("")
    const otpValue = otp.join("")
    if (otpValue.length !== 6) {
      setError("Enter the complete 6-digit OTP")
      return
    }

    setLoading(true)
    try {
      const cleaned = phone.replace(/\D/g, "")
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, otp: otpValue, name }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Invalid OTP")
        return
      }

      // Sign in using the phone-otp provider with verified userId
      const result = await signIn("phone-otp", {
        userId: data.userId,
        redirect: false,
      })

      if (result?.error) {
        setError("Login failed. Please try again.")
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">

        <div>
          <Link href="/login"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors text-sm mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-[var(--text)] font-['Playfair_Display'] tracking-tight">
              travely
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mb-1 self-end" />
          </div>
        </div>

        <div className="premium-panel rounded-3xl p-8 space-y-6">

          {step === "phone" ? (
            <>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text)] font-['Playfair_Display']">
                  Sign in with phone
                </h1>
                <p className="text-[var(--text-secondary)] text-sm">
                  We'll send you a one-time verification code
                </p>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-[var(--danger-soft)] border border-[var(--danger-border)] text-[var(--danger)] text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[var(--text-secondary)] text-sm">Phone Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-secondary)] text-sm">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="flex-1 px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-border-strong)] transition-all text-sm"
                  />
                </div>
              </div>

              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</> : "Send OTP"}
              </button>

              <p className="text-[var(--text-muted)] text-xs text-center">
                By continuing, you agree to receive an SMS for verification.
              </p>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[var(--success-soft)] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[var(--success)]" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text)] font-['Playfair_Display']">
                  Enter verification code
                </h1>
                <p className="text-[var(--text-secondary)] text-sm">
                  Sent to <span className="text-[var(--text)] font-medium">+91 {phone}</span>
                </p>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-[var(--danger-soft)] border border-[var(--danger-border)] text-[var(--danger)] text-sm">
                  {error}
                </div>
              )}

              {/* OTP Input boxes */}
              <div className="flex gap-2 justify-between">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--accent-border-strong)] transition-all"
                  />
                ))}
              </div>

              {/* New user name field */}
              <div className="space-y-1">
                <label className="text-[var(--text-secondary)] text-sm">Your Name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-border-strong)] transition-all text-sm"
                />
              </div>

              <button
                onClick={verifyOtp}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying...</> : "Verify & Continue"}
              </button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-[var(--text-muted)] text-xs">
                    Resend code in {resendTimer}s
                  </p>
                ) : (
                  <button
                    onClick={sendOtp}
                    className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-xs font-medium transition-colors"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError("") }}
                className="w-full text-[var(--text-secondary)] hover:text-[var(--text)] text-xs transition-colors"
              >
                Change phone number
              </button>
            </>
          )}
        </div>

        <p className="text-center text-[var(--text-secondary)] text-sm">
          Prefer email?{" "}
          <Link href="/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors">
            Sign in with email
          </Link>
        </p>
      </div>
    </div>
  )
}