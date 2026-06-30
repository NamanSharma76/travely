import type { User, Package, Booking, Provider } from "@prisma/client"

export type SafeUser = Omit<User, "password">

export type PackageWithProvider = Package & {
  provider: Provider
}

export type BookingWithDetails = Booking & {
  package: Package
  user: SafeUser
}