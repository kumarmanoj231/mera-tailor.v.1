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

function RoleAccess({ roles, children }) {
  const { isSignedIn, isLoaded, isProfileLoaded, profile, profileError } = useAuth();
  const { t } = useTranslation();

  if (!isLoaded || (isSignedIn && !isProfileLoaded)) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-stone-200 border-t-[#8f2338]" />
          <span className="text-xs font-semibold text-stone-600">
            {t('authFlow.loadingPermissions', 'Loading account permissions…')}
          </span>
        </div>
      </div>
    );
  }

  if (isSignedIn && !profile && profileError) {
    return (
      <div role="alert" className="m-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 max-w-lg mx-auto shadow-xs">
        <p className="font-bold text-sm mb-1">{t('common.error', 'Error')}</p>
        <p className="text-xs text-amber-800 leading-relaxed">{t('authFlow.accountLoadError', { error: profileError })}</p>
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
        <Route path="/tailors/:id" element={<TailorDetail />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/bulk" element={<RoleAccess roles={['business', 'tailor', 'admin']}><Bulk /></RoleAccess>} />

        <Route path="/my-tailors" element={<RoleAccess roles={['customer', 'admin']}><MyTailors /></RoleAccess>} />
        <Route path="/orders" element={<RoleAccess roles={['customer', 'tailor', 'admin']}><Orders /></RoleAccess>} />
        <Route path="/my-orders" element={<RoleAccess roles={['customer', 'tailor', 'admin']}><Orders /></RoleAccess>} />
        <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
        <Route path="/admin" element={<RoleAccess roles={['admin']}><AdminPortal /></RoleAccess>} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
