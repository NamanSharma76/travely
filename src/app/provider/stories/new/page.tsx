"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Plus, Trash2, ArrowLeft, BookText } from "lucide-react"
import Link from "next/link"

const schema = z.object({
  packageId: z.string().min(1, "Select a package"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  excerpt: z.string().min(20, "Excerpt must be at least 20 characters").max(200),
  content: z.string().min(100, "Story content must be at least 100 characters"),
  coverImage: z.string().url("Enter a valid image URL"),
  images: z.array(z.object({ value: z.string().url("Enter a valid image URL") })),
})

type StoryForm = z.infer<typeof schema>

type ProviderPackage = {
  id: string
  title: string
  destination: string
  images: string[]
}

export default function NewStoryPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [packages, setPackages] = useState<ProviderPackage[]>([])
  const [loadingPackages, setLoadingPackages] = useState(true)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StoryForm>({
    resolver: zodResolver(schema),
    defaultValues: { images: [{ value: "" }] },
  })

  const imagesField = useFieldArray({ control, name: "images" })
  const selectedPackageId = watch("packageId")
  const selectedPackage = packages.find((p) => p.id === selectedPackageId)

  useEffect(() => {
    async function fetchPackages() {
      const res = await fetch("/api/provider/packages")
      const data = await res.json()
      setPackages(data.packages ?? [])
      setLoadingPackages(false)
    }
    fetchPackages()
  }, [])

  const onSubmit = async (data: StoryForm) => {
    setError("")
    try {
      const res = await fetch("/api/provider/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          images: data.images.map((i) => i.value).filter(Boolean),
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Something went wrong")
        return
      }

      router.push("/provider/stories")
    } catch {
      setError("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="h-5"></div>
      <div>
        <Link href="/provider/stories"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to stories
        </Link>
        <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display'] flex items-center gap-2">
          <BookText className="w-7 h-7 text-[var(--accent)]" />
          Write a Story
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Share a real trip experience and link it to one of your packages</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-[var(--danger-soft)] border border-[var(--danger-border)] text-[var(--danger)] text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Package Selection */}
        <div className="premium-panel rounded-2xl p-6 space-y-4">
          <h2 className="text-[var(--text)] font-semibold">Link to a Package *</h2>
          <p className="text-[var(--text-muted)] text-xs">Every story must be linked to one of your packages</p>

          {loadingPackages ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-[var(--text-muted)] text-sm mb-3">You need at least one package to write a story</p>
              <Link href="/provider/packages/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors">
                <Plus className="w-4 h-4" /> Create a package first
              </Link>
            </div>
          ) : (
            <select {...register("packageId")}
              className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--accent-border-strong)] transition-all text-sm">
              <option value="">Select a package</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title} — {pkg.destination}
                </option>
              ))}
            </select>
          )}
          {errors.packageId && <p className="text-[var(--danger)] text-xs">{errors.packageId.message}</p>}

          {/* Preview of selected package */}
          {selectedPackage && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-border)]">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--surface-2)] flex-shrink-0">
                {selectedPackage.images[0] && (
                  <img src={selectedPackage.images[0]} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <p className="text-[var(--text)] text-sm font-medium">{selectedPackage.title}</p>
                <p className="text-[var(--text-secondary)] text-xs">{selectedPackage.destination}</p>
              </div>
            </div>
          )}
        </div>

        {/* Story Content */}
        <div className="premium-panel rounded-2xl p-6 space-y-4">
          <h2 className="text-[var(--text)] font-semibold">Story Details</h2>

          <div className="space-y-1">
            <label className="text-[var(--text-secondary)] text-sm">Story Title *</label>
            <input {...register("title")} placeholder="e.g. 5 Sunsets That Changed How I See Kerala"
              className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-border-strong)] transition-all text-sm" />
            {errors.title && <p className="text-[var(--danger)] text-xs">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[var(--text-secondary)] text-sm">Short Excerpt *</label>
            <textarea {...register("excerpt")} rows={2} placeholder="A short teaser shown on the stories listing page (max 200 characters)"
              className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-border-strong)] transition-all text-sm resize-none" />
            {errors.excerpt && <p className="text-[var(--danger)] text-xs">{errors.excerpt.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[var(--text-secondary)] text-sm">Cover Image URL *</label>
            <input {...register("coverImage")} placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-border-strong)] transition-all text-sm" />
            {errors.coverImage && <p className="text-[var(--danger)] text-xs">{errors.coverImage.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[var(--text-secondary)] text-sm">Story Content *</label>
            <textarea {...register("content")} rows={8} placeholder="Tell the full story — what made this trip special, moments worth remembering, tips for future travelers..."
              className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-border-strong)] transition-all text-sm resize-none" />
            {errors.content && <p className="text-[var(--danger)] text-xs">{errors.content.message}</p>}
          </div>
        </div>

        {/* Additional Images */}
        <div className="premium-panel rounded-2xl p-6 space-y-4">
          <h2 className="text-[var(--text)] font-semibold">Additional Photos (optional)</h2>
          {imagesField.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input {...register(`images.${index}.value`)} placeholder="https://images.unsplash.com/..."
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-border-strong)] transition-all text-sm" />
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

        <button type="submit" disabled={isSubmitting || packages.length === 0}
          className="w-full py-4 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</>
          ) : "Publish Story"}
        </button>
      </form>
    </div>
  )
}