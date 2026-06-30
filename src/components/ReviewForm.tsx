"use client"

import { useState } from "react"
import { Star, Loader2, Check } from "lucide-react"

type Props = {
  packageId: string
  bookingId: string
  packageTitle: string
  onSuccess?: () => void
}

export default function ReviewForm({ packageId, bookingId, packageTitle, onSuccess }: Props) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const onSubmit = async () => {
    if (rating === 0) { setError("Please select a rating"); return }
    if (body.length < 20) { setError("Review must be at least 20 characters"); return }

    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, bookingId, rating, title, body }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to submit review")
        return
      }

      setSuccess(true)
      onSuccess?.()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-6 rounded-2xl border border-[color:var(--success-border)] bg-[var(--success-soft)] text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-[var(--success-soft)] flex items-center justify-center mx-auto">
          <Check className="w-5 h-5 text-[var(--success)]" />
        </div>
        <p className="text-[var(--text)] font-medium">Review submitted!</p>
        <p className="text-[var(--text-secondary)] text-sm">Thank you for sharing your experience.</p>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
      <div>
        <h3 className="text-[var(--text)] font-semibold font-['Playfair_Display']">Write a Review</h3>
        <p className="text-[var(--text-secondary)] text-sm mt-1">{packageTitle}</p>
      </div>

      {/* Star Rating */}
      <div className="space-y-2">
        <label className="text-[var(--text-secondary)] text-sm">Your Rating *</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star className={`w-8 h-8 transition-colors ${
                star <= (hovered || rating)
                  ? "text-[var(--warning)] fill-[var(--warning)]"
                  : "text-[var(--text-muted)]"
              }`} />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-[var(--text-secondary)] text-sm ml-2">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <label className="text-[var(--text-secondary)] text-sm">Review Title (optional)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
          className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm"
        />
      </div>

      {/* Body */}
      <div className="space-y-1">
        <label className="text-[var(--text-secondary)] text-sm">Your Review *</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell other travelers about your experience..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm resize-none"
        />
        <p className="text-[var(--text-muted)] text-xs text-right">{body.length} / 1000</p>
      </div>

      {error && (
        <p className="text-[var(--danger)] text-sm">{error}</p>
      )}

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : "Submit Review"}
      </button>
    </div>
  )
}