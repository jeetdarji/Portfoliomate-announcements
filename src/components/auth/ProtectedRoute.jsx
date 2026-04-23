import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/Spinner'

export function ProtectedRoute({ children }) {
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const loading = useAuthStore((s) => s.loading)
  const signingOut = useRef(false)

  // Session exists but profile is missing (stale session / trigger failure).
  // Clear auth immediately (no network wait) so the user lands on login,
  // then fire signOut() in the background to clean the Supabase session.
  useEffect(() => {
    if (!loading && session && !profile && !signingOut.current) {
      signingOut.current = true
      // Immediately clear the store → triggers redirect to /login
      useAuthStore.getState().clearAuth()
      // Background cleanup — don't block on the network call
      supabase.auth.signOut().catch(() => {})
    }
  }, [loading, session, profile])

  // While checking session: show spinner
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <Spinner size="lg" color="indigo" />
      </div>
    )
  }

  // No session (or stale session just cleared) → redirect to login
  if (!session || !profile) {
    return <Navigate to="/login" replace />
  }

  // Session + profile exist → render the protected page
  return children
}