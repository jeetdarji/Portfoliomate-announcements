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
  // Automatically sign out so the user lands on the login page cleanly.
  useEffect(() => {
    if (!loading && session && !profile && !signingOut.current) {
      signingOut.current = true
      supabase.auth.signOut().catch(() => {
        // If signOut fails, force-clear the store so we still redirect
        useAuthStore.getState().clearAuth()
      })
    }
  }, [loading, session, profile])

  // While checking session (or signing out a stale session): show spinner
  if (loading || (session && !profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <Spinner size="lg" color="indigo" />
      </div>
    )
  }

  // No session → redirect to login
  if (!session) {
    return <Navigate to="/login" replace />
  }

  // Session + profile exist → render the protected page
  return children
}