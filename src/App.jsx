import React, { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import AppMeta from "./components/AppMeta";
import ErrorBoundary from './components/common/ErrorBoundary';
import DashboardSkeleton from './components/common/DashboardSkeleton';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Home = lazy(() => import("./pages/Home"));
const FindTailors = lazy(() => import("./pages/FindTailors"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const MyTailors = lazy(() => import("./pages/MyTailors"));
const Orders = lazy(() => import("./pages/Orders"));
const Bulk = lazy(() => import("./pages/Bulk"));
const Contact = lazy(() => import("./pages/Contact"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminPortal = lazy(() => import("./pages/AdminPortal"));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const TailorDetail = lazy(() => import('./pages/TailorDetail'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));

function ProfileSyncError({ profileError, retryProfile }) {
  const { t, i18n } = useTranslation();
  const message = /sign in is required|sign-in session could not be verified/i.test(profileError || '')
    ? (i18n.resolvedLanguage?.startsWith('hi')
      ? 'आपके साइन-इन की पुष्टि नहीं हो सकी। कृपया कुछ देर बाद खाता जाँच फिर से करें।'
      : 'Your sign-in could not be verified. Retry the account check in a moment.')
    : t('authFlow.accountLoadError', { error: profileError || 'Your account profile could not be verified yet.' });

  return (
    <div className="flex min-h-screen flex-col bg-[#fbf9f5] text-stone-900">
      <Navbar />
      <main className="grid flex-1 place-items-center px-4 py-12 sm:px-6">
        <section role="alert" className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-9">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f8edf0] text-xl font-bold text-[#8f2338]" aria-hidden="true">!</div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#8f2338]">MeraTailor account</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {t('authFlow.syncErrorTitle', 'Unable to load account permissions')}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-600">{message}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => retryProfile()}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#8f2338] px-5 text-sm font-semibold text-white transition hover:bg-[#781c2e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f2338]"
            >
              {t('common.retry', 'Retry Connection')}
            </button>
            <a href="/" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 px-5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50">
              {t('navbar.home', 'Home')}
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function RoleAccess({ roles, children }) {
  const { isSignedIn, isLoaded, isProfileLoaded, profile, profileError, retryProfile } = useAuth();

  // 1. Initial authentication and profile role resolution state
  if (!isLoaded || (isSignedIn && (!isProfileLoaded || (!profile && !profileError)))) {
    // Determine expected role archetype hint based on route if available
    const expectedRole = roles.includes('admin') && roles.length === 1
      ? 'admin'
      : roles.includes('tailor') && roles.length === 1
      ? 'tailor'
      : roles.includes('business') && roles.length === 1
      ? 'business'
      : 'customer';

    return <DashboardSkeleton role={expectedRole} />;
  }

  // 2. Retryable Error state if profile fetch failed
  if (isSignedIn && !profile) {
    return <ProfileSyncError profileError={profileError} retryProfile={retryProfile} />;
  }

  const userRole = isSignedIn ? profile?.role : 'guest';
  if (!roles.includes(userRole)) {
    if (isSignedIn) {
      const fallbackUrl = profile?.role === 'admin' ? '/admin' : '/dashboard';
      return <Navigate to={fallbackUrl} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

function DashboardRoleRouter() {
  const { isSignedIn, isLoaded, isProfileLoaded, profile, profileError, retryProfile } = useAuth();

  // 1. If not authenticated with Clerk, render Dashboard directly (guest mode)
  if (isLoaded && !isSignedIn) {
    return <Dashboard />;
  }

  // 2. If Clerk is initializing, or signed in and authoritative profile is still resolving:
  if (!isLoaded || (isSignedIn && (!isProfileLoaded || (!profile && !profileError)))) {
    const cachedRole = typeof window !== 'undefined' ? localStorage.getItem('meraTailor.userRole') : null;
    return <DashboardSkeleton role={cachedRole || 'customer'} />;
  }

  // 3. Retryable Error state if profile fetch failed
  if (isSignedIn && !profile) {
    return <ProfileSyncError profileError={profileError} retryProfile={retryProfile} />;
  }

  // 4. Authoritative profile loaded:
  // If user is Admin -> Immediately redirect to /admin, NEVER mount Dashboard!
  if (profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // If user is Tailor, Business, or Customer -> Mount Dashboard with authoritative profile!
  return <Dashboard />;
}

function AuthFlowGuard() {
  const { isSignedIn, isLoaded, isProfileLoaded, profile } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !isProfileLoaded || !profile) return;

    if (!profile.onboardingCompleted && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true });
      return;
    }

    if (profile.onboardingCompleted && location.pathname === '/onboarding') {
      try {
        const pendingOrder = JSON.parse(sessionStorage.getItem('meraTailor.pending-order') || 'null');
        if (/^[a-f\d]{24}$/i.test(String(pendingOrder?.tailorId || ''))) {
          navigate(`/tailors/${encodeURIComponent(pendingOrder.tailorId)}?checkout=resume`, { replace: true });
          return;
        }
      } catch {
        sessionStorage.removeItem('meraTailor.pending-order');
      }

      const dest = profile.role === 'admin' ? '/admin' : '/dashboard';
      navigate(dest, { replace: true });
    }
  }, [isLoaded, isSignedIn, isProfileLoaded, profile, location.pathname, navigate]);

  useEffect(() => {
    if (!isSignedIn || !profile?.onboardingCompleted || profile.location || !profile.id) return;
    const key = `meraTailor.locationPrompt.${profile.id}`;
    if (!sessionStorage.getItem(key)) {
      toast.info(
        <span>
          {t('authFlow.locationPrompt')}{' '}
          <a href="/dashboard" className="font-semibold underline">
            {t('authFlow.openProfile')}
          </a>
        </span>,
        { autoClose: 7500 }
      );
      sessionStorage.setItem(key, 'shown');
    }
  }, [isSignedIn, profile, t]);

  return null;
}

const App = () => {
  return (
    <ErrorBoundary>
      <AppMeta />
      <AuthFlowGuard />
      <ToastContainer position="top-right" newestOnTop closeOnClick pauseOnFocusLoss theme="light" />
      <Suspense
        fallback={
          <div role="status" aria-live="polite" className="grid min-h-[45vh] place-items-center px-4 text-sm text-stone-500">
            Loading MeraTailor…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/find-tailors" element={<FindTailors />} />
          <Route path="/tailors" element={<Navigate to="/find-tailors" replace />} />
          <Route path="/tailors/:id" element={<TailorDetail />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/bulk" element={<RoleAccess roles={['business', 'tailor', 'admin']}><Bulk /></RoleAccess>} />

          <Route path="/my-tailors" element={<RoleAccess roles={['customer', 'admin']}><MyTailors /></RoleAccess>} />
          <Route path="/orders" element={<RoleAccess roles={['customer', 'business', 'tailor', 'admin']}><Orders /></RoleAccess>} />
          <Route path="/my-orders" element={<RoleAccess roles={['customer', 'business', 'tailor', 'admin']}><Orders /></RoleAccess>} />
          <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/dashboard" element={<ErrorBoundary><DashboardRoleRouter /></ErrorBoundary>} />
          <Route path="/admin" element={<RoleAccess roles={['admin']}><AdminPortal /></RoleAccess>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
