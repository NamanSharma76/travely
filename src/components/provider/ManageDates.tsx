"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Loader2, Calendar } from "lucide-react"

type DateSlot = {
  id?: string
  startDate: string
  endDate: string
  spotsLeft: number
  isAvailable: boolean
}

type Props = {
  packageId: string
}

export default function ManageDates({ packageId }: Props) {
  const [dates, setDates] = useState<DateSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [newDate, setNewDate] = useState({
    startDate: "",
    endDate: "",
    spotsLeft: 10,
  })

  useEffect(() => {
    fetchDates()
  }, [packageId])

  const fetchDates = async () => {
    setLoading(true)
    const res = await fetch(`/api/provider/packages/${packageId}/dates`)
    const data = await res.json()
    setDates(data.dates ?? [])
    setLoading(false)
  }

  const addDate = async () => {
    if (!newDate.startDate || !newDate.endDate) {
      setError("Please fill in both dates")
      return
    }
    if (new Date(newDate.startDate) >= new Date(newDate.endDate)) {
      setError("End date must be after start date")
      return
    }
    if (new Date(newDate.startDate) < new Date()) {
      setError("Start date must be in the future")
      return
    }

    setError("")
    setSaving(true)

    const res = await fetch(`/api/provider/packages/${packageId}/dates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDate),
    })

    if (res.ok) {
      setSuccess("Date added successfully!")
      setNewDate({ startDate: "", endDate: "", spotsLeft: 10 })
      fetchDates()
      setTimeout(() => setSuccess(""), 3000)
    } else {
      const data = await res.json()
      setError(data.error || "Failed to add date")
    }
    setSaving(false)
  }

  const deleteDate = async (dateId: string) => {
    const res = await fetch(`/api/provider/packages/${packageId}/dates/${dateId}`, {
      method: "DELETE",
    })
    if (res.ok) fetchDates()
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-[var(--accent)]" />
        <h3 className="text-[var(--text)] font-semibold">Available Dates</h3>
      </div>

      {/* Add new date */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
        <p className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider">Add Date Slot</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[var(--text-secondary)] text-xs">Start Date</label>
            <input
              type="date"
              value={newDate.startDate}
              onChange={(e) => setNewDate({ ...newDate, startDate: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[var(--text-secondary)] text-xs">End Date</label>
            <input
              type="date"
              value={newDate.endDate}
              onChange={(e) => setNewDate({ ...newDate, endDate: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[var(--text-secondary)] text-xs">Spots Available</label>
            <input
              type="number"
              min={1}
              value={newDate.spotsLeft}
              onChange={(e) => setNewDate({ ...newDate, spotsLeft: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm"
            />
          </div>
        </div>

        {error && <p className="text-[var(--danger)] text-xs">{error}</p>}
        {success && <p className="text-[var(--success)] text-xs">{success}</p>}

        <button
          onClick={addDate}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Add Date
        </button>
      </div>

      {/* Existing dates */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
        </div>
      ) : dates.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm text-center py-4">
          No dates added yet. Add date slots so travelers can book.
        </p>
      ) : (
        <div className="space-y-2">
          {dates.map((date) => (
            <div key={date.id}
              className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <div>
                <p className="text-[var(--text)] text-sm font-medium">
                  {formatDate(date.startDate)} → {formatDate(date.endDate)}
                </p>
                <p className={`text-xs mt-0.5 ${date.spotsLeft <= 3 ? "text-[var(--danger)]" : "text-[var(--accent)]"}`}>
                  {date.spotsLeft} spots available
                </p>
              </div>
              <button
                onClick={() => date.id && deleteDate(date.id)}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}