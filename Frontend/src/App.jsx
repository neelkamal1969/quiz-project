import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// App-wide providers / safety
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeSwitcher from './components/ThemeSwitcher';
import BackToTop from './components/BackToTop';
import OfflineNotice from './components/OfflineNotice';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { ROUTES } from './lib/constants';

// Shared chrome (eager — small, on every route)
import Header from './components/Header';
import Spinner from './components/ui/Spinner';

// Pages — lazy-loaded so each route ships as its own chunk. This keeps the
// initial bundle small; the heavy OCR page (tesseract.js) loads only on demand.
const HomePage = lazy(() => import('./Pages/HomePage'));
const ValueToQuestions = lazy(() => import('./Pages/ValueToQuestions'));
const PhotoToQuestions = lazy(() => import('./Pages/PhotoToQuestions'));
const LoginPage = lazy(() => import('./Pages/LoginPage'));
const SignUpPage = lazy(() => import('./Pages/SignUpPage'));
const ProfileSetup = lazy(() => import('./Pages/ProfileSetup'));
const Vault = lazy(() => import('./Pages/Vault'));
const AdminLogs = lazy(() => import('./Pages/AdminLogs'));
const ReviewDue = lazy(() => import('./Pages/ReviewDue'));
const Analytics = lazy(() => import('./Pages/Analytics'));
const QuizMode = lazy(() => import('./Pages/QuizMode'));
const Wiki = lazy(() => import('./Pages/Wiki'));

// Centered fallback shown while a route chunk loads.
const PageLoader = () => (
  <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
    <Spinner size={32} color="var(--accent-light)" />
  </div>
);

// Every page renders below the shared Header, inside a <main> landmark.
// The skip-link lets keyboard users jump straight past the nav to content.
// Suspense gives each lazy route its loading boundary.
const withHeader = (element) => (
  <>
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <Header />
    <main id="main-content">
      <Suspense fallback={<PageLoader />}>{element}</Suspense>
    </main>
  </>
);

export default function App() {
  const router = createBrowserRouter([
    { path: ROUTES.HOME, element: withHeader(<HomePage />) },
    { path: ROUTES.VALUE_INPUT, element: withHeader(<ValueToQuestions />) },
    { path: ROUTES.IMAGE_INPUT, element: withHeader(<PhotoToQuestions />) },
    { path: ROUTES.SIGNUP, element: withHeader(<SignUpPage />) },
    { path: ROUTES.LOGIN, element: withHeader(<LoginPage />) },
    // Routes that require authentication (these pages already self-redirected).
    { path: ROUTES.PROFILE_SETUP, element: withHeader(<ProtectedRoute><ProfileSetup /></ProtectedRoute>) },
    { path: ROUTES.VAULT, element: withHeader(<ProtectedRoute><Vault /></ProtectedRoute>) },
    { path: ROUTES.REVIEW, element: withHeader(<ProtectedRoute><ReviewDue /></ProtectedRoute>) },
    { path: ROUTES.ANALYTICS, element: withHeader(<ProtectedRoute><Analytics /></ProtectedRoute>) },
    { path: ROUTES.QUIZ, element: withHeader(<ProtectedRoute><QuizMode /></ProtectedRoute>) },
    { path: ROUTES.ADMIN_LOGS, element: withHeader(<ProtectedRoute><AdminLogs /></ProtectedRoute>) },
    { path: ROUTES.WIKI, element: withHeader(<ProtectedRoute><Wiki /></ProtectedRoute>) },
  ]);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              <RouterProvider router={router} />
              <ThemeSwitcher />
              <BackToTop />
              <OfflineNotice />
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
