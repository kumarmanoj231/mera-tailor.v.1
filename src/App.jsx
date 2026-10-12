import React, { useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import Home from "./pages/Home";
import FindTailors from "./pages/FindTailors";
import HowItWorks from "./pages/HowItWorks";
import MyTailors from "./pages/MyTailors";
import Orders from "./pages/Orders";
import Bulk from "./pages/Bulk";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import AdminPortal from "./pages/AdminPortal";
import AppMeta from "./components/AppMeta";
import Onboarding from './pages/Onboarding';
import TailorDetail from './pages/TailorDetail';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ErrorBoundary from './components/common/ErrorBoundary';
import DashboardSkeleton from './components/common/DashboardSkeleton';

function RoleAccess({ roles, children }) {
  const { isSignedIn, isLoaded, isProfileLoaded, profile, profileError, retryProfile } = useAuth();
  const { t } = useTranslation();

  // 1. Initial authentication and profile role resolution state
  if (!isLoaded || (isSignedIn && !isProfileLoaded)) {
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
  if (isSignedIn && !profile && profileError) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div role="alert" className="rounded-3xl border border-amber-200 bg-amber-50/90 p-6 sm:p-8 text-amber-950 max-w-md w-full shadow-lg text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 mb-3">
            <span className="text-xl font-bold">!</span>
          </div>
          <h2 className="font-serif text-lg font-bold text-stone-900 mb-1">
            {t('authFlow.syncErrorTitle', 'Unable to load account permissions')}
          </h2>
          <p className="text-xs text-amber-900 mb-5 leading-relaxed">
            {t('authFlow.accountLoadError', { error: profileError })}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => retryProfile()}
              className="w-full sm:w-auto rounded-xl bg-[#8f2338] hover:bg-[#781c2e] px-5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
            >
              {t('common.retry', 'Retry Connection')}
            </button>
            <a
              href="/"
              className="w-full sm:w-auto rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition text-center"
            >
              {t('navbar.home', 'Home')}
            </a>
          </div>
        </div>
      </div>
    );
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
  const { t } = useTranslation();

  // 1. If not authenticated with Clerk, render Dashboard directly (guest mode)
  if (isLoaded && !isSignedIn) {
    return <Dashboard />;
  }

  // 2. If Clerk is initializing, or signed in and authoritative profile is still resolving:
  if (!isLoaded || (isSignedIn && !isProfileLoaded)) {
    const cachedRole = typeof window !== 'undefined' ? localStorage.getItem('meraTailor.userRole') : null;
    return <DashboardSkeleton role={cachedRole || 'customer'} />;
  }

  // 3. Retryable Error state if profile fetch failed
  if (isSignedIn && !profile && profileError) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div role="alert" className="rounded-3xl border border-amber-200 bg-amber-50/90 p-6 sm:p-8 text-amber-950 max-w-md w-full shadow-lg text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 mb-3">
            <span className="text-xl font-bold">!</span>
          </div>
          <h2 className="font-serif text-lg font-bold text-stone-900 mb-1">
            {t('authFlow.syncErrorTitle', 'Unable to load account permissions')}
          </h2>
          <p className="text-xs text-amber-900 mb-5 leading-relaxed">
            {t('authFlow.accountLoadError', { error: profileError })}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => retryProfile()}
              className="w-full sm:w-auto rounded-xl bg-[#8f2338] hover:bg-[#781c2e] px-5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
            >
              {t('common.retry', 'Retry Connection')}
            </button>
            <a
              href="/"
              className="w-full sm:w-auto rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition text-center"
            >
              {t('navbar.home', 'Home')}
            </a>
          </div>
        </div>
      </div>
    );
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
    </ErrorBoundary>
  );
};

export default App;
