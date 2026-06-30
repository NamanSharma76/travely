import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const role = req.auth?.user?.role
  const pathname = req.nextUrl.pathname

  // Not logged in — redirect to login
  const isProtected = ["/dashboard", "/provider", "/admin", "/bookings"].some(
    (path) => pathname.startsWith(path)
  )
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Not admin — redirect to home
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Not provider — redirect to home
  if (pathname.startsWith("/provider") && role !== "PROVIDER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url))
  }
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/provider/:path*",
    "/admin/:path*",
    "/bookings/:path*",
  ],
}