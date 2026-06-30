import ThemeProvider from "@/components/ThemeProvider"
import type { Metadata } from "next"
import { Playfair_Display } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import Navbar from "@/components/layout/Navbar"
import ChatWidget from "@/components/ChatWidget"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Travely — Discover Your Next Adventure",
  description: "Book curated travel packages from trusted providers across India and beyond.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} antialiased`}>
        <ThemeProvider>
          <SessionProvider>
            <Navbar />
            {children}
            <ChatWidget/>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}