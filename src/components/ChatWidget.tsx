"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { MessageCircle, X, Send, Loader2, Sparkles, Bot } from "lucide-react"
import Link from "next/link"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function ChatWidget() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isOpen])

  // Don't show on auth pages
  const hideOnPaths = ["/login", "/signup", "/forgot-password", "/reset-password", "/phone-login"]
  if (hideOnPaths.some((p) => pathname?.startsWith(p))) return null

  // Only show for logged-in users
  if (!session) return null

  const suggestions = [
    "Show me beach trips under ₹20,000",
    "What's the status of my bookings?",
    "How do refunds work?",
  ]

  const sendMessage = async (text: string) => {
    const userMessage: Message = { role: "user", content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }])
        return
      }

      setMessages([...newMessages, { role: "assistant", content: data.message }])
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    sendMessage(input.trim())
  }

  // Render message content with simple link detection for /packages/... and /bookings
  const renderContent = (content: string) => {
    const parts = content.split(/(\/packages\/[a-z0-9-]+|\/bookings)/g)
    return parts.map((part, i) => {
      if (part.startsWith("/packages/") || part === "/bookings") {
        return (
          <Link key={i} href={part} className="text-[var(--accent)] underline hover:text-[var(--accent-hover)]">
            View
          </Link>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] shadow-[var(--shadow-lg)] flex items-center justify-center transition-all hover:scale-105"
          aria-label="Open chat assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-3rem)] flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-[var(--text)] font-semibold text-sm">Travely Assistant</p>
                <p className="text-[var(--text-muted)] text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" /> Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <div className="bg-[var(--surface-2)] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-[var(--text)] max-w-[85%]">
                    Hi! I can help you find packages, check your bookings, or answer questions about Travely. What can I help with?
                  </div>
                </div>

                <div className="space-y-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="w-full text-left px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)] text-sm transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[var(--accent)] text-[var(--on-accent)] rounded-tr-sm"
                    : "bg-[var(--surface-2)] text-[var(--text)] rounded-tl-sm"
                }`}>
                  {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div className="bg-[var(--surface-2)] rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 text-[var(--text-muted)] animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--border)] flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about packages, bookings..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--accent-border-strong)] transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}