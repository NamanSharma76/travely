"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  country: z.string().min(2, "Enter country"),
  destination: z.string().min(2, "Enter destination"),
  category: z.string().min(1, "Select a category"),
  durationDays: z.coerce.number().min(1).max(60),
  pricePerPerson: z.coerce.number().min(100, "Price must be at least ₹100"),
  maxTravelers: z.coerce.number().min(1).max(100),
  inclusions: z.array(z.object({ value: z.string().min(1) })).min(1),
  exclusions: z.array(z.object({ value: z.string().min(1) })).min(1),
  images: z.array(z.object({ value: z.string().url("Enter a valid image URL") })).min(1),
})

type PackageForm = z.infer<typeof schema>

const CATEGORIES = [
  "ADVENTURE", "BEACH", "HONEYMOON", "CULTURAL",
  "WILDLIFE", "PILGRIMAGE", "FAMILY", "LUXURY", "BUDGET", "GROUP"
]

export default function NewPackagePage() {
  const router = useRouter()
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PackageForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      inclusions: [{ value: "" }],
      exclusions: [{ value: "" }],
      images: [{ value: "" }],
      maxTravelers: 10,
      durationDays: 5,
    },
  })

  const inclusionsField = useFieldArray({ control, name: "inclusions" })
  const exclusionsField = useFieldArray({ control, name: "exclusions" })
  const imagesField = useFieldArray({ control, name: "images" })

  const onSubmit = async (data: PackageForm) => {
    setError("")
    try {
      const res = await fetch("/api/provider/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          inclusions: data.inclusions.map((i) => i.value),
          exclusions: data.exclusions.map((e) => e.value),
          images: data.images.map((i) => i.value),
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Something went wrong")
        return
      }

      router.push("/provider/packages")
    } catch {
      setError("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="h-5"></div>
      <div>
        <Link href="/provider/packages"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-secondary)] text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to packages
        </Link>
        <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">Add New Package</h1>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-[var(--danger-soft)] border border-[color:var(--danger-border)] text-[var(--danger)] text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Basic Info */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
          <h2 className="text-[var(--text)] font-semibold">Basic Information</h2>

          <div className="space-y-1">
            <label className="text-[var(--text-secondary)] text-sm">Package Title *</label>
            <input {...register("title")} placeholder="e.g. Kerala Backwaters Escape"
              className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm" />
            {errors.title && <p className="text-[var(--danger)] text-xs">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[var(--text-secondary)] text-sm">Description *</label>
            <textarea {...register("description")} rows={4} placeholder="Describe the package experience in detail..."
              className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm resize-none" />
            {errors.description && <p className="text-[var(--danger)] text-xs">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[var(--text-secondary)] text-sm">Destination *</label>
              <input {...register("destination")} placeholder="e.g. Kerala"
                className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm" />
              {errors.destination && <p className="text-[var(--danger)] text-xs">{errors.destination.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[var(--text-secondary)] text-sm">Country *</label>
              <input {...register("country")} placeholder="e.g. India"
                className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm" />
              {errors.country && <p className="text-[var(--danger)] text-xs">{errors.country.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[var(--text-secondary)] text-sm">Category *</label>
            <select {...register("category")}
              className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm">
              <option value="" className="bg-[var(--surface)]">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[var(--surface)]">
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-[var(--danger)] text-xs">{errors.category.message}</p>}
          </div>
        </div>

        {/* Pricing & Details */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
          <h2 className="text-[var(--text)] font-semibold">Pricing & Details</h2>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[var(--text-secondary)] text-sm">Price per Person (₹) *</label>
              <input {...register("pricePerPerson")} type="number" placeholder="15000"
                className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm" />
              {errors.pricePerPerson && <p className="text-[var(--danger)] text-xs">{errors.pricePerPerson.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[var(--text-secondary)] text-sm">Duration (days) *</label>
              <input {...register("durationDays")} type="number" placeholder="7"
                className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm" />
              {errors.durationDays && <p className="text-[var(--danger)] text-xs">{errors.durationDays.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[var(--text-secondary)] text-sm">Max Travelers *</label>
              <input {...register("maxTravelers")} type="number" placeholder="10"
                className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm" />
              {errors.maxTravelers && <p className="text-[var(--danger)] text-xs">{errors.maxTravelers.message}</p>}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
          <h2 className="text-[var(--text)] font-semibold">Images</h2>
          <p className="text-[var(--text-muted)] text-xs">Add image URLs (from Unsplash, Cloudinary, etc.)</p>
          {imagesField.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input {...register(`images.${index}.value`)} placeholder="https://images.unsplash.com/..."
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm" />
              {imagesField.fields.length > 1 && (
                <button type="button" onClick={() => imagesField.remove(index)}
                  className="p-3 rounded-xl bg-[var(--danger-soft)] text-[var(--danger)] hover:bg-[var(--danger-soft-hover)] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => imagesField.append({ value: "" })}
            className="flex items-center gap-2 text-[var(--accent)] text-sm hover:text-[var(--accent-hover)] transition-colors">
            <Plus className="w-4 h-4" /> Add image
          </button>
        </div>

        {/* Inclusions */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
          <h2 className="text-[var(--text)] font-semibold">What's Included</h2>
          {inclusionsField.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input {...register(`inclusions.${index}.value`)} placeholder="e.g. Hotel accommodation"
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm" />
              {inclusionsField.fields.length > 1 && (
                <button type="button" onClick={() => inclusionsField.remove(index)}
                  className="p-3 rounded-xl bg-[var(--danger-soft)] text-[var(--danger)] hover:bg-[var(--danger-soft-hover)] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => inclusionsField.append({ value: "" })}
            className="flex items-center gap-2 text-[var(--accent)] text-sm hover:text-[var(--accent-hover)] transition-colors">
            <Plus className="w-4 h-4" /> Add inclusion
          </button>
        </div>

        {/* Exclusions */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
          <h2 className="text-[var(--text)] font-semibold">What's Not Included</h2>
          {exclusionsField.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input {...register(`exclusions.${index}.value`)} placeholder="e.g. Flights"
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm" />
              {exclusionsField.fields.length > 1 && (
                <button type="button" onClick={() => exclusionsField.remove(index)}
                  className="p-3 rounded-xl bg-[var(--danger-soft)] text-[var(--danger)] hover:bg-[var(--danger-soft-hover)] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => exclusionsField.append({ value: "" })}
            className="flex items-center gap-2 text-[var(--accent)] text-sm hover:text-[var(--accent-hover)] transition-colors">
            <Plus className="w-4 h-4" /> Add exclusion
          </button>
        </div>

        <button type="submit" disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Creating package...</>
          ) : "Create Package"}
        </button>
      </form>
    </div>
  )
}