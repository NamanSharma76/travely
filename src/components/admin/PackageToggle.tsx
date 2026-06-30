// src/components/admin/PackageToggle.tsx
"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function PackageToggle({ packageId, isActive }: { packageId: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/packages/${packageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !active }),
    })
    if (res.ok) setActive(!active)
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
        active
          ? "bg-[var(--danger-soft)] text-[var(--danger)] border border-[color:var(--danger-border)] hover:bg-[var(--danger-soft-hover)]"
          : "bg-[var(--success-soft)] text-[var(--success)] border border-[color:var(--success-border)] hover:bg-[var(--success-soft-hover)]"
      }`}>
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
      {active ? "Deactivate" : "Activate"}
    </button>
  )
}