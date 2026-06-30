"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Building2, Phone, Globe, FileText, ArrowRight } from "lucide-react"

const schema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().min(50, "Please write at least 50 characters about your business"),
  phone: z.string().min(10, "Enter a valid phone number"),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
})

type ProviderForm = z.infer<typeof schema>

export default function BecomeProviderPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProviderForm>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: ProviderForm) => {
    setError("")
    try {
      const res = await fetch("/api/provider/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Something went wrong")
        return
      }

      setSuccess(true)
    } catch {
      setError("Something went wrong. Please try again.")
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--bg)] pt-24 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] border border-[color:var(--accent-border)] flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-[var(--accent)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] font-['Playfair_Display']">Application Submitted!</h1>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            Your provider application is under review. We'll notify you once verified. This usually takes 1-2 business days.
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Back to Home <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 px-6">
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--text)] font-['Playfair_Display'] mb-2">
            Become a Provider
          </h1>
          <p className="text-[var(--text-secondary)]">
            List your travel packages and reach thousands of travelers on Travely.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: "🌍", title: "Global Reach", desc: "Access to thousands of travelers" },
            { icon: "💳", title: "Easy Payments", desc: "Automatic payouts via Razorpay" },
            { icon: "📊", title: "Analytics", desc: "Track bookings and revenue" },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-center">
              <span className="text-2xl">{item.icon}</span>
              <p className="text-[var(--text)] text-sm font-medium mt-2">{item.title}</p>
              <p className="text-[var(--text-muted)] text-xs mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-[var(--danger-soft)] border border-[color:var(--danger-border)] text-[var(--danger)] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
            <h2 className="text-[var(--text)] font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--accent)]" />
              Business Details
            </h2>

            <div className="space-y-1">
              <label className="text-[var(--text-secondary)] text-sm">Business Name *</label>
              <input
                {...register("businessName")}
                placeholder="e.g. Himalayan Adventures"
                className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm"
              />
              {errors.businessName && <p className="text-[var(--danger)] text-xs">{errors.businessName.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[var(--text-secondary)] text-sm">About Your Business *</label>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="Tell travelers about your company, experience, specializations..."
                className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm resize-none"
              />
              {errors.description && <p className="text-[var(--danger)] text-xs">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[var(--text-secondary)] text-sm flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone *
                </label>
                <input
                  {...register("phone")}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm"
                />
                {errors.phone && <p className="text-[var(--danger)] text-xs">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[var(--text-secondary)] text-sm flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Website (optional)
                </label>
                <input
                  {...register("website")}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm"
                />
                {errors.website && <p className="text-[var(--danger)] text-xs">{errors.website.message}</p>}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
              <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                By submitting, you agree to Travely's provider terms. Your application will be reviewed by our team within 1-2 business days. Document verification may be required.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
            ) : (
              <>Submit Application <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}