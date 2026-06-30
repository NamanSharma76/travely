"use client"

import { useState } from "react"
import { Loader2, ToggleLeft, ToggleRight } from "lucide-react"

type Props = {
  packageId: string
  isActive: boolean
}

export default function PackageToggleButton({ packageId, isActive }: Props) {
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/provider/packages/${packageId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !active }),
      })
      if (res.ok) setActive(!active)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs transition-colors disabled:opacity-50 ${
        active
          ? "text-[var(--text-secondary)] hover:text-[var(--danger)]"
          : "text-[var(--text-secondary)] hover:text-[var(--success)]"
      }`}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : active ? (
        <ToggleRight className="w-3.5 h-3.5" />
      ) : (
        <ToggleLeft className="w-3.5 h-3.5" />
      )}
      {active ? "Deactivate" : "Activate"}
    </button>
  )
}