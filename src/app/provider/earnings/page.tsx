import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DollarSign, TrendingUp, CalendarCheck } from "lucide-react"

export default async function ProviderEarningsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
    include: {
      packages: {
        include: {
          bookings: {
            where: {
              status: { in: ["CONFIRMED", "COMPLETED"] }
            },
            include: { package: { select: { title: true } } }
          }
        }
      }
    }
  })

  if (!provider) redirect("/become-provider")

  // Flatten all confirmed/completed bookings
  const bookings = provider.packages.flatMap(p => p.bookings)
  
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0)
  const totalBookings = bookings.length

  const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`

  return (
    <div className="space-y-6">

      <div className="h-5"></div>
      
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">Earnings</h1>
        <p className="text-[var(--text-secondary)] mt-1">Overview of your revenue from confirmed bookings.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-[var(--text-secondary)] text-sm">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--info-soft)] text-[var(--info)]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-[var(--text-secondary)] text-sm">Total Paid Bookings</p>
          </div>
          <p className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display']">{totalBookings}</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <h2 className="text-[var(--text)] font-semibold mb-4">Transaction History</h2>
        {bookings.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm py-4 text-center">No completed transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div>
                  <p className="text-[var(--text)] text-sm font-medium">{booking.package.title}</p>
                  <p className="text-[var(--text-secondary)] text-xs">
                    {new Date(booking.createdAt).toLocaleDateString("en-IN")} • {booking.status}
                  </p>
                </div>
                <p className="text-[var(--text)] font-semibold font-['Playfair_Display']">
                  +{formatPrice(Number(booking.totalAmount))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}