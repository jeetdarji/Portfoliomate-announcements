import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { sanitizeSupabaseError } from '@/lib/utils'
import { toast } from 'sonner'

// ── Fetch profile (standalone, no hooks) ────────────────────────────
const fetchProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching profile:', error.message)
    return null
  }
  return data
}

// ── Clean OAuth tokens from URL after processing ────────────────────
function cleanOAuthUrl() {
  // Remove hash fragments (#access_token=... etc.)
  if (window.location.hash && window.location.hash.includes('access_token')) {
    window.history.replaceState(null, '', window.location.pathname)
  }
  // Remove query params (?error=... or ?code=... etc.)
  if (window.location.search && (
    window.location.search.includes('error=') ||
    window.location.search.includes('code=')
  )) {
    window.history.replaceState(null, '', window.location.pathname)
  }
}

// ── Auth initializer hook (call ONCE in App.jsx) ────────────────────
// Uses ONLY onAuthStateChange (which fires INITIAL_SESSION immediately)
// instead of calling both getSession() + onAuthStateChange in parallel,
// which caused a race condition that left Chrome in infinite loading.
export function useAuthInit() {
  useEffect(() => {
    const { setSession, setProfile, setLoading, clearAuth } = useAuthStore.getState()

    // Track whether this effect instance is still active (not cleaned up).
    // Prevents stale async callbacks from writing to the store after unmount.
    let active = true

    // onAuthStateChange fires INITIAL_SESSION synchronously on registration,
    // so we do NOT need a separate getSession() call.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (import.meta.env.DEV) console.log('[auth event]', event)

        if (event === 'SIGNED_OUT') {
          clearAuth()
          return
        }

        if (event === 'TOKEN_REFRESHED') {
          if (session) setSession(session)
          return
        }

        // INITIAL_SESSION or SIGNED_IN
        if (session) {
          setSession(session)
          try {
            const profile = await fetchProfile(session.user.id)
            if (active) setProfile(profile)
          } catch {
            // Profile fetch failed — ProtectedRoute will handle it
          }
        }

        if (active) {
          setLoading(false)
          cleanOAuthUrl()
        }
      }
    )

    // Safety net: if auth never resolves (corrupt localStorage, network issue,
    // or a browser extension blocking Supabase), stop the loading spinner.
    const safetyTimeout = setTimeout(() => {
      const { loading } = useAuthStore.getState()
      if (loading) {
        if (import.meta.env.DEV) console.warn('[auth] Safety timeout — forcing loading=false')
        setLoading(false)
      }
    }, 5000)

    return () => {
      active = false
      subscription.unsubscribe()
      clearTimeout(safetyTimeout)
    }
  }, [])
}

// ── Auth actions hook (call anywhere you need sign-in/out) ──────────
// Does NOT register any useEffect — safe to call in any component.
export function useAuth() {
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const loading = useAuthStore((s) => s.loading)

  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app/announcements`,
        },
      })
      if (error) throw error
    } catch (err) {
      toast.error(sanitizeSupabaseError(err))
    }
  }, [])

  const signInWithEmail = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw new Error(sanitizeSupabaseError(error))

    // Eagerly populate the store BEFORE returning so that
    // navigate() finds the session already set in ProtectedRoute.
    if (data.session) {
      const { setSession, setProfile, setLoading } = useAuthStore.getState()
      setSession(data.session)
      const prof = await fetchProfile(data.session.user.id)
      setProfile(prof)
      setLoading(false)
    }

    return data
  }, [])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      toast.error(sanitizeSupabaseError(err))
    }
  }, [])

  const resetPassword = useCallback(async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) throw error
      return { success: true }
    } catch (err) {
      throw new Error(sanitizeSupabaseError(err))
    }
  }, [])

  return {
    session,
    profile,
    loading,
    user: session?.user ?? null,
    isAuthenticated: !!session,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    resetPassword,
  }
}