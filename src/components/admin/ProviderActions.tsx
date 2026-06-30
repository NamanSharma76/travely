"use client"

import { useState } from "react"
import { Check, X, Ban, Loader2 } from "lucide-react"

type Props = {
  providerId: string
  currentStatus: string
  userId: string
}

export default function ProviderActions({ providerId, currentStatus, userId }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState<string | null>(null)

  const updateStatus = async (newStatus: string) => {
    setLoading(newStatus)
    try {
      const res = await fetch(`/api/admin/providers/${providerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, userId }),
      })

      if (res.ok) setStatus(newStatus)
    } finally {
      setLoading(null)
    }
  }

  if (status === "PENDING") {
    return (
      <div className="flex items-center gap-2">
        <button onClick={() => updateStatus("VERIFIED")} disabled={!!loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--success-soft)] text-[var(--success)] border border-[color:var(--success-border)] hover:bg-[var(--success-soft-hover)] text-xs font-medium transition-colors disabled:opacity-50">
          {loading === "VERIFIED" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          Verify
        </button>
        <button onClick={() => updateStatus("REJECTED")} disabled={!!loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--danger-soft)] text-[var(--danger)] border border-[color:var(--danger-border)] hover:bg-[var(--danger-soft-hover)] text-xs font-medium transition-colors disabled:opacity-50">
          {loading === "REJECTED" ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
          Reject
        </button>
      </div>
    )
  }

  if (status === "VERIFIED") {
    return (
      <button onClick={() => updateStatus("SUSPENDED")} disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 text-xs font-medium transition-colors disabled:opacity-50">
        {loading === "SUSPENDED" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
        Suspend
      </button>
    )
  }

  if (status === "SUSPENDED" || status === "REJECTED") {
    return (
      <button onClick={() => updateStatus("VERIFIED")} disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--success-soft)] text-[var(--success)] border border-[color:var(--success-border)] hover:bg-[var(--success-soft-hover)] text-xs font-medium transition-colors disabled:opacity-50">
        {loading === "VERIFIED" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        Reinstate
      </button>
    )
  }

  return null
}