"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, Calendar, Users, Clock, MapPin, Star, Loader2, Check } from "lucide-react"

type AvailableDate = {
  id: string
  startDate: string
  endDate: string
  spotsLeft: number
}

type Package = {
  id: string
  title: string
  slug: string
  destination: string
  country: string
  durationDays: number
  pricePerPerson: number
  maxTravelers: number
  images: string[]
  avgRating: number
  inclusions: string[]
  availableDates: AvailableDate[]
  provider: { businessName: string }
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const slug = params.slug as string

  const [pkg, setPkg] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<AvailableDate | null>(null)
  const [travelers, setTravelers] = useState(1)
  const [notes, setNotes] = useState("")
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/packages/${slug}/book`)
    }
  }, [status, router, slug])

  useEffect(() => {
    async function fetchPackage() {
      const res = await fetch(`/api/packages/${slug}`)
      const data = await res.json()
      setPkg(data)
      setLoading(false)
    }
    fetchPackage()
  }, [slug])

  const totalAmount = pkg ? pkg.pricePerPerson * travelers : 0
  const platformFee = Math.round(totalAmount * 0.02) // 2% platform fee
  const grandTotal = totalAmount + platformFee

  const formatPrice = (price: number) =>
    `₹${price.toLocaleString("en-IN")}`

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    })

  const handleBooking = async () => {
    if (!selectedDate) {
      setError("Please select a travel date")
      return
    }
    if (!pkg) return

    setError("")
    setIsBooking(true)

    try {
      // Step 1: Create booking
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          availableDateId: selectedDate.id,
          travelers,
          notes,
          totalAmount: grandTotal,
        }),
      })

      const bookingData = await bookingRes.json()

      if (!bookingRes.ok) {
        setError(bookingData.error || "Failed to create booking")
        setIsBooking(false)
        return
      }

      // Step 2: Create Razorpay order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingData.bookingId,
          amount: grandTotal,
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        setError(orderData.error || "Payment initialization failed")
        setIsBooking(false)
        return
      }

      const checkoutAccent =
        getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#0575e6"

      // Step 3: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Travely",
        description: pkg.title,
        order_id: orderData.orderId,
        prefill: {
          name: session?.user?.name,
          email: session?.user?.email,
        },
        theme: { color: checkoutAccent },
        handler: async (response: any) => {
          // Step 4: Verify payment
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: bookingData.bookingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          if (verifyRes.ok) {
            router.push(`/bookings/${bookingData.bookingId}/confirmation`)
          } else {
            setError("Payment verification failed. Contact support.")
            setIsBooking(false)
          }
        },
        modal: {
          ondismiss: () => setIsBooking(false),
        },
      }

      // Load Razorpay script and open
      const rzp = new (window as any).Razorpay(options)
      rzp.open()

    } catch {
      setError("Something went wrong. Please try again.")
      setIsBooking(false)
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--bg)] pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
      </div>
    )
  }

  if (!pkg) return null

  return (
    <>
      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="min-h-screen bg-[var(--bg)] pt-24">
        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* Back */}
          <Link href={`/packages/${slug}`}
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-secondary)] text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to package
          </Link>

          <h1 className="text-3xl font-bold text-[var(--text)] font-['Playfair_Display'] mb-8">
            Complete your booking
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ── Left: Booking Form ── */}
            <div className="lg:col-span-3 space-y-6">

              {/* Package Summary */}
              <div className="flex gap-4 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--surface-2)]">
                  {pkg.images[0] && (
                    <img src={pkg.images[0]} alt={pkg.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <h2 className="text-[var(--text)] font-semibold font-['Playfair_Display'] mb-1">{pkg.title}</h2>
                  <div className="flex items-center gap-3 text-[var(--text-secondary)] text-xs">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{pkg.destination}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{pkg.durationDays} days</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-[var(--warning)] fill-[var(--warning)]" />{pkg.avgRating}</span>
                  </div>
                  <p className="text-[var(--text-muted)] text-xs mt-1">{pkg.provider.businessName}</p>
                </div>
              </div>

              {/* Select Date */}
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <h3 className="text-[var(--text)] font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--accent)]" />
                  Select Travel Date
                </h3>
                {pkg.availableDates.length === 0 ? (
                  <p className="text-[var(--text-secondary)] text-sm">No dates available currently.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pkg.availableDates.map((date) => (
                      <button
                        key={date.id}
                        onClick={() => setSelectedDate(date)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedDate?.id === date.id
                            ? "border-[color:var(--accent)] bg-[var(--accent-soft)]"
                            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border)]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[var(--text)] text-sm font-medium">{formatDate(date.startDate)}</p>
                          {selectedDate?.id === date.id && (
                            <Check className="w-4 h-4 text-[var(--accent)]" />
                          )}
                        </div>
                        <p className="text-[var(--text-muted)] text-xs">to {formatDate(date.endDate)}</p>
                        <p className={`text-xs mt-2 font-medium ${
                          date.spotsLeft <= 3 ? "text-[var(--danger)]" : "text-[var(--accent)]"
                        }`}>
                          {date.spotsLeft} spots left
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Travelers */}
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <h3 className="text-[var(--text)] font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--accent)]" />
                  Number of Travelers
                </h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    className="w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors flex items-center justify-center text-xl"
                  >
                    −
                  </button>
                  <span className="text-[var(--text)] text-2xl font-bold w-8 text-center">{travelers}</span>
                  <button
                    onClick={() => setTravelers(Math.min(
                      selectedDate ? selectedDate.spotsLeft : pkg.maxTravelers,
                      travelers + 1
                    ))}
                    className="w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors flex items-center justify-center text-xl"
                  >
                    +
                  </button>
                  <span className="text-[var(--text-secondary)] text-sm">
                    (max {selectedDate ? selectedDate.spotsLeft : pkg.maxTravelers})
                  </span>
                </div>
              </div>

              {/* Special Requests */}
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <h3 className="text-[var(--text)] font-semibold mb-4">Special Requests (optional)</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any dietary requirements, special occasions, or other requests..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm resize-none"
                />
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-[var(--danger-soft)] border border-[color:var(--danger-border)] text-[var(--danger)] text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* ── Right: Price Summary ── */}
            <div className="lg:col-span-2">
              <div className="sticky top-28 p-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
                <h3 className="text-[var(--text)] font-semibold font-['Playfair_Display']">Price Summary</h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">
                      {formatPrice(pkg.pricePerPerson)} × {travelers} traveler{travelers > 1 ? "s" : ""}
                    </span>
                    <span className="text-[var(--text)]">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Platform fee (2%)</span>
                    <span className="text-[var(--text)]">{formatPrice(platformFee)}</span>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] flex justify-between">
                    <span className="text-[var(--text)] font-semibold">Total</span>
                    <span className="text-[var(--text)] font-bold text-xl">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Selected date summary */}
                {selectedDate && (
                  <div className="p-3 rounded-xl bg-[var(--accent-soft)] border border-[color:var(--accent-border)]">
                    <p className="text-[var(--accent)] text-xs font-medium mb-1">Selected dates</p>
                    <p className="text-[var(--text)] text-sm">{formatDate(selectedDate.startDate)} → {formatDate(selectedDate.endDate)}</p>
                  </div>
                )}

                {/* What's included */}
                <div className="space-y-2">
                  <p className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider">Includes</p>
                  {pkg.inclusions.slice(0, 4).map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                      <Check className="w-3 h-3 text-[var(--accent)] flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleBooking}
                  disabled={isBooking || !selectedDate}
                  className="w-full py-4 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isBooking ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
                  ) : (
                    `Pay ${formatPrice(grandTotal)}`
                  )}
                </button>

                <p className="text-[var(--text-muted)] text-xs text-center">
                  Secured by Razorpay. Test mode active.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
