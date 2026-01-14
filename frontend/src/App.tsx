import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import RegistrationSuccessPage from './pages/RegistrationSuccessPage';
import DashboardPage from './pages/DashboardPage';
import TradesPage from './pages/TradesPage';
import TradeFormPage from './pages/TradeFormPage';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import WelcomeScreen from './components/WelcomeScreen';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}

function OnboardingRoute() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const token = searchParams.get('token');
  const google = searchParams.get('google');
  const restart = searchParams.get('restart');
  
  // Allow access if:
  // 1. User is not authenticated (new registration)
  // 2. Google OAuth flow (token + google params)
  // 3. Restart mode (authenticated user updating preferences)
  if (isAuthenticated && !token && google !== 'true' && restart !== 'true') {
    // User is logged in but trying to access onboarding without proper params
    return <Navigate to="/app/dashboard" replace />;
  }

  return <OnboardingPage />;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } 
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <OnboardingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/onboarding"
          element={<OnboardingRoute />}
        />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/registration-success" element={<RegistrationSuccessPage />} />
        <Route
          path="/app"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="trades" element={<TradesPage />} />
          <Route path="trades/new" element={<TradeFormPage />} />
          <Route path="trades/edit" element={<TradeFormPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { theme } = useThemeStore();
  const showWelcomeScreen = useAuthStore((state) => state.showWelcomeScreen);
  const user = useAuthStore((state) => state.user);
  const setShowWelcomeScreen = useAuthStore((state) => state.setShowWelcomeScreen);

  // Stelle sicher, dass das Theme beim Laden korrekt angewendet wird
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        {showWelcomeScreen && user && (
          <WelcomeScreen
            userName={user.name}
            onComplete={() => setShowWelcomeScreen(false)}
          />
        )}
        <AnimatedRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
