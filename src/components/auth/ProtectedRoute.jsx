import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Spinner } from '@/components/ui/Spinner'

export function ProtectedRoute({ children }) {
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const loading = useAuthStore((s) => s.loading)

  // While checking session: show centered full-screen spinner
  if (loading) {
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

  // Session exists but profile creation failed (e.g. trigger failure after OAuth)
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] px-4">
        <div className="max-w-md w-full bg-white rounded-[14px] p-8 text-center"
          style={{ boxShadow: '0px 4px 24px rgba(0,0,0,0.08)' }}>
          <h2 className="font-display font-bold text-[20px] text-[#171727] mb-2">
            Account Not Set Up
          </h2>
          <p className="font-sans text-[14px] text-[#696975] mb-6">
            Your account is not yet set up. Please contact your administrator.
          </p>
          <button
            onClick={async () => {
              const { supabase } = await import('@/lib/supabase')
              await supabase.auth.signOut()
            }}
            className="px-6 py-2.5 bg-[#33337B] text-white rounded-[10px] font-sans font-semibold text-[14px] border-none cursor-pointer hover:bg-[#2D2D6B] transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  // Session + profile exist → render the protected page
  return children
}