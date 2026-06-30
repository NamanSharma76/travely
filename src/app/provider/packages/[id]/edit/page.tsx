import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ManageDates from "@/components/provider/ManageDates"

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
  })
  if (!provider) redirect("/become-provider")

  const pkg = await prisma.package.findFirst({
    where: { id, providerId: provider.id },
    include: {
      availableDates: {
        orderBy: { startDate: "asc" },
      },
    },
  })

  if (!pkg) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <div className="h-5"></div>
      <div>
        <Link href="/provider/packages"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-secondary)] text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to packages
        </Link>
        <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">
          Manage Package
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">{pkg.title}</p>
      </div>

      {/* Package summary */}
      <div className="flex gap-4 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--surface-2)] flex-shrink-0">
          {pkg.images[0] && (
            <img src={pkg.images[0]} alt={pkg.title} className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <h2 className="text-[var(--text)] font-semibold font-['Playfair_Display']">{pkg.title}</h2>
          <p className="text-[var(--text-secondary)] text-sm">{pkg.destination}, {pkg.country}</p>
          <p className="text-[var(--text-secondary)] text-sm">{pkg.durationDays} days · ₹{Number(pkg.pricePerPerson).toLocaleString("en-IN")}/person</p>
        </div>
      </div>

      {/* Date Management */}
      <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <ManageDates packageId={pkg.id} />
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Link href={`/packages/${pkg.slug}`}
          className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] text-sm transition-colors">
          View live page
        </Link>
        <Link href={`/provider/packages/${pkg.id}/edit-details`}
          className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] text-sm transition-colors">
          Edit package details
        </Link>
      </div>
    </div>
  )
}