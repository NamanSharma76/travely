"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function StoryToggleButton({ storyId, isActive }: { storyId: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/provider/stories/${storyId}`, {
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
    <button onClick={toggle} disabled={loading}
      className="flex items-center gap-1.5 text-xs transition-colors disabled:opacity-50 text-[var(--text-secondary)] hover:text-[var(--danger)]">
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
      {active ? "Unpublish" : "Publish"}
    </button>
  )
}