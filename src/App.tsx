import type { ReactNode } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import AnimeDetailPage from './pages/AnimeDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import { useAuth } from './context/AuthContext'

function AppLoading() {
  return (
    <div className="auth-page">
      <div
        className="auth-image"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}anime-auth-hero.png)`,
        }}
      />
      <div className="auth-vignette" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="soft-panel flex items-center gap-3 px-5 py-4 text-sm text-slate-700">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
          正在确认登录状态...
        </div>
      </div>
    </div>
  )
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AppLoading />
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Layout>{children}</Layout>
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <AppLoading />
  if (user) return <Navigate to="/" replace />

  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        }
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
      <Route
        path="/search"
        element={
          <RequireAuth>
            <SearchPage />
          </RequireAuth>
        }
      />
      <Route
        path="/anime/:id"
        element={
          <RequireAuth>
            <AnimeDetailPage />
          </RequireAuth>
        }
      />
      <Route
        path="/me"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
