import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { AnnouncementsPage } from './pages/AnnouncementsPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { useAuthInit } from '@/hooks/useAuth'

export default function App() {
  // Start the auth listener on app load (only here, once)
  useAuthInit()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/app/announcements"
        element={
          <ProtectedRoute>
            <AppShell>
              <AnnouncementsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/app/announcements" replace />} />
    </Routes>
  )
}