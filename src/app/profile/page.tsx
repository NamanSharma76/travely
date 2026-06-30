"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, User, Mail, Lock, Check, Eye, EyeOff } from "lucide-react"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Enter your current password"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: session?.user?.name ?? "" },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileError("")
    setProfileSuccess(false)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        setProfileError(json.error || "Failed to update profile")
        return
      }
      await update({ name: data.name })
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch {
      setProfileError("Something went wrong")
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordError("")
    setPasswordSuccess(false)
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        setPasswordError(json.error || "Failed to update password")
        return
      }
      setPasswordSuccess(true)
      passwordForm.reset()
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch {
      setPasswordError("Something went wrong")
    }
  }

  const isOAuthUser = !session?.user?.email?.includes("@") === false &&
    session?.user?.image?.includes("google")

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        <div>
          <h1 className="text-4xl font-bold text-[var(--text)] font-['Playfair_Display']">Profile</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your account details</p>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="w-16 h-16 rounded-full bg-[var(--accent-soft)] border-2 border-[color:var(--accent-border-strong)] flex items-center justify-center overflow-hidden flex-shrink-0">
            {session?.user?.image ? (
              <img src={session.user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[var(--accent)] text-2xl font-bold font-['Playfair_Display']">
                {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
              </span>
            )}
          </div>
          <div>
            <p className="text-[var(--text)] font-semibold text-lg">{session?.user?.name}</p>
            <p className="text-[var(--text-secondary)] text-sm">{session?.user?.email}</p>
            <p className="text-[var(--text-muted)] text-xs mt-0.5 capitalize">
              {session?.user?.role?.toLowerCase()} account
            </p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
          <h2 className="text-[var(--text)] font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--accent)]" />
            Personal Information
          </h2>

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[var(--text-secondary)] text-sm">Full Name</label>
              <input
                {...profileForm.register("name")}
                className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm"
              />
              {profileForm.formState.errors.name && (
                <p className="text-[var(--danger)] text-xs">{profileForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[var(--text-secondary)] text-sm">Email</label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-[var(--text-secondary)] text-sm">{session?.user?.email}</span>
              </div>
              <p className="text-[var(--text-muted)] text-xs">Email cannot be changed</p>
            </div>

            {profileError && <p className="text-[var(--danger)] text-sm">{profileError}</p>}
            {profileSuccess && (
              <div className="flex items-center gap-2 text-[var(--success)] text-sm">
                <Check className="w-4 h-4" /> Profile updated successfully
              </div>
            )}

            <button type="submit" disabled={profileForm.formState.isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
              {profileForm.formState.isSubmitting
                ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                : "Save Changes"
              }
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
          <h2 className="text-[var(--text)] font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4 text-[var(--accent)]" />
            Change Password
          </h2>

          {session?.user?.image?.includes("googleusercontent") ? (
            <p className="text-[var(--text-muted)] text-sm">
              You signed in with Google. Password change is not available for Google accounts.
            </p>
          ) : (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              {[
                { name: "currentPassword" as const, label: "Current Password", show: showCurrent, setShow: setShowCurrent },
                { name: "newPassword" as const, label: "New Password", show: showNew, setShow: setShowNew },
                { name: "confirmPassword" as const, label: "Confirm New Password", show: showConfirm, setShow: setShowConfirm },
              ].map((field) => (
                <div key={field.name} className="space-y-1">
                  <label className="text-[var(--text-secondary)] text-sm">{field.label}</label>
                  <div className="relative">
                    <input
                      {...passwordForm.register(field.name)}
                      type={field.show ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[color:var(--accent-border-strong)] transition-all text-sm pr-10"
                    />
                    <button type="button" onClick={() => field.setShow(!field.show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                      {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors[field.name] && (
                    <p className="text-[var(--danger)] text-xs">{passwordForm.formState.errors[field.name]?.message}</p>
                  )}
                </div>
              ))}

              {passwordError && <p className="text-[var(--danger)] text-sm">{passwordError}</p>}
              {passwordSuccess && (
                <div className="flex items-center gap-2 text-[var(--success)] text-sm">
                  <Check className="w-4 h-4" /> Password updated successfully
                </div>
              )}

              <button type="submit" disabled={passwordForm.formState.isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                {passwordForm.formState.isSubmitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Updating...</>
                  : "Update Password"
                }
              </button>
            </form>
          )}
        </div>

        {/* Danger Zone */}
        <div className="p-6 rounded-2xl border border-[color:var(--danger-border)] bg-[var(--danger-soft)] space-y-3">
          <h2 className="text-[var(--text)] font-semibold">Danger Zone</h2>
          <p className="text-[var(--text-secondary)] text-sm">Once you delete your account, there is no going back.</p>
          <button className="px-4 py-2 rounded-xl border border-[color:var(--danger-border)] text-[var(--danger)] hover:bg-[var(--danger-soft)] text-sm transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}