import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import useAuthStore from './store/authStore'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Income from './pages/Income'
import Analytics from './pages/Analytics'
import Goals from './pages/Goals'
import Profile from './pages/Profile'
import { ToastProvider } from './context/ToastContext'
import ToastContainer from './components/ui/Toast'
import AIAdvisor from './components/AIAdvisor'
import Onboarding from './components/Onboarding'

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/auth" replace />
}

function AppRoutes() {
  const location = useLocation()
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)

  useEffect(() => {
    if (isAuthenticated) fetchMe()
  }, [])

  const showOnboarding =
    isAuthenticated &&
    user !== null &&
    !user.monthly_budget &&
    !onboardingDismissed

  return (
    <>
      <Routes location={location}>
        {/* Public routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/auth" element={<Auth />} />

        {/* Private app routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout>
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/income" element={<Income />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </AnimatePresence>
              </Layout>
              <AIAdvisor />
            </PrivateRoute>
          }
        />
      </Routes>

      <AnimatePresence>
        {showOnboarding && (
          <Onboarding onClose={() => setOnboardingDismissed(true)} />
        )}
      </AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  )
}
