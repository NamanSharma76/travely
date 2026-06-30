// src/components/provider/BookingActionButtons.tsx
"use client"

import { useState } from "react"
import { Check, X, Flag, Loader2 } from "lucide-react"

type Props = {
  bookingId: string
  status: string
}

export default function BookingActionButtons({ bookingId, status }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [currentStatus, setCurrentStatus] = useState(status)

  const updateStatus = async (newStatus: string) => {
    setLoading(newStatus)
    try {
      const res = await fetch(`/api/provider/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setCurrentStatus(newStatus)
      }
    } finally {
      setLoading(null)
    }
  }

  if (currentStatus === "PENDING") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateStatus("CONFIRMED")}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--success-soft)] text-[var(--success)] border border-[color:var(--success-border)] hover:bg-[var(--success-soft-hover)] text-xs font-medium transition-colors disabled:opacity-50"
        >
          {loading === "CONFIRMED" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          Approve
        </button>
        <button
          onClick={() => updateStatus("REJECTED")}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--danger-soft)] text-[var(--danger)] border border-[color:var(--danger-border)] hover:bg-[var(--danger-soft-hover)] text-xs font-medium transition-colors disabled:opacity-50"
        >
          {loading === "REJECTED" ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
          Reject
        </button>
      </div>
    )
  }

  if (currentStatus === "CONFIRMED") {
    return (
      <button
        onClick={() => updateStatus("COMPLETED")}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--info-soft)] text-[var(--info)] border border-[color:var(--info-border)] hover:bg-[var(--info-soft)] text-xs font-medium transition-colors disabled:opacity-50"
      >
        {loading === "COMPLETED" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Flag className="w-3 h-3" />}
        Mark Completed
      </button>
    )
  }

  return (
    <span className="text-[var(--text-muted)] text-xs">
      {currentStatus.charAt(0) + currentStatus.slice(1).toLowerCase()}
    </span>
  )
}