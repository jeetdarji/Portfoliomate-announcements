import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  // The Supabase Auth session object
  session: null,

  // The row from our profiles table (includes firm_id, full_name, role, avatar_url)
  profile: null,

  // True while we are checking if a session exists on app load
  loading: true,

  // Actions
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  // Clear everything on logout
  clearAuth: () => set({ session: null, profile: null, loading: false }),
}))