import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useClerk, useUser } from '@clerk/react';
import { useTranslation } from 'react-i18next';
import { Check, AlertTriangle, ArrowRight, Scissors, UserCheck, Building2 } from 'lucide-react';

const AuthContext = createContext(null);
const hasClerkKey = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const roleChoices = ['customer', 'tailor', 'business'];

function RoleChooser({ close, choose, initialRole }) {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState(() => {
    return initialRole && roleChoices.includes(initialRole) ? initialRole : 'customer';
  });
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (initialRole && roleChoices.includes(initialRole)) {
      setSelectedRole(initialRole);
      setIsConfirmed(false);
    }
  }, [initialRole]);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setIsConfirmed(false);
  };

  const roleMeta = {
    customer: {
      title: t('authFlow.customerTitle', 'Customer & Shopper'),
      desc: t('authFlow.customerHint', 'Find nearby tailors, book bespoke outfits, and save body measurements in your cloud vault.'),
      icon: <UserCheck size={20} />,
      badge: t('authFlow.customerBadge', 'For Individuals'),
    },
    tailor: {
      title: t('authFlow.tailorTitle', 'Tailor & Boutique Studio'),
      desc: t('authFlow.tailorHint', 'Accept local retail client orders, manage digital client workbooks, and bid on profitable bulk contracts.'),
      icon: <Scissors size={20} />,
      badge: t('authFlow.tailorBadge', 'For Artisans'),
    },
    business: {
      title: t('authFlow.businessTitle', 'Business & Brand'),
      desc: t('authFlow.businessHint', 'Post bulk institutional uniform RFQs, review artisan bids, and manage batch garment manufacturing.'),
      icon: <Building2 size={20} />,
      badge: t('authFlow.businessBadge', 'For Bulk Buyers'),
    },
  };

  const currentRoleTitle = roleMeta[selectedRole]?.title || selectedRole;

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/65 p-4 backdrop-blur-xs"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-role-title"
        className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-block rounded-full bg-rose-100 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#8f2338]">
              {t('authFlow.stepEyebrow', 'Step 1 of 2: Role Selection')}
            </span>
            <h2 id="auth-role-title" className="mt-2 font-serif text-2xl font-bold text-stone-900 sm:text-3xl">
              {t('authFlow.chooseRole', 'Select Your Account Role')}
            </h2>
          </div>
          <button
            aria-label={t('authFlow.close', 'Close')}
            onClick={close}
            className="rounded-xl p-2 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            ×
          </button>
        </div>

        <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
          {t('authFlow.signUpIntro', 'Select the role that fits your use case. Your dashboard and tools will be configured specifically for this role.')}
        </p>

        {/* Role Options */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {roleChoices.map((role) => {
            const isSelected = selectedRole === role;
            const meta = roleMeta[role];
            return (
              <button
                key={role}
                type="button"
                onClick={() => handleSelectRole(role)}
                className={`relative flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#8f2338] bg-[#fffaf8] shadow-md ring-2 ring-[#8f2338]/20'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/70'
                }`}
              >
                {/* Check / Radio Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                      isSelected ? 'bg-[#8f2338] text-white' : 'bg-[#f7eee5] text-[#8f2338]'
                    }`}
                  >
                    {meta.icon}
                  </div>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                      isSelected
                        ? 'border-[#8f2338] bg-[#8f2338] text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="block font-bold text-stone-900 text-sm">
                    {meta.title}
                  </span>
                  <span className="mt-1 block text-[11px] text-stone-500 leading-snug">
                    {meta.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Warning Callout: Role Cannot Be Changed */}
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 flex items-start gap-3 text-amber-900">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold">
              {t('authFlow.permanentRoleNotice', 'Important: Account role cannot be changed after registration')}
            </p>
            <p className="mt-0.5 text-amber-800 leading-relaxed text-[11px] sm:text-xs">
              {t(
                'authFlow.permanentRoleDesc',
                'Your account role is permanent once your profile is created. All permissions, orders, and dashboard features are irreversibly configured for this role.'
              )}
            </p>
          </div>
        </div>

        {/* Mandatory Confirmation Checkbox */}
        <label className="mt-4 flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50/90 p-3.5 cursor-pointer transition hover:bg-stone-100/80 select-none">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#8f2338] focus:ring-[#8f2338] accent-[#8f2338] cursor-pointer shrink-0"
          />
          <span className="text-xs text-stone-700 leading-relaxed font-medium">
            {t(
              'authFlow.confirmCheckbox',
              'I confirm that I want to create an account as a {{role}}. I understand that this role cannot be changed later.',
              { role: currentRoleTitle }
            )}
          </span>
        </label>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <span>{t('authFlow.alreadyHaveAccount', 'Already registered?')}</span>
            <button
              type="button"
              onClick={() => {
                close();
                if (typeof window !== 'undefined' && window.__meraTailorOpenSignIn) {
                  window.__meraTailorOpenSignIn();
                }
              }}
              className="font-bold text-[#8f2338] hover:underline cursor-pointer"
            >
              {t('navbar.signIn', 'Sign in here')}
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={close}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition cursor-pointer"
            >
              {t('common.cancel', 'Cancel')}
            </button>

            <button
              type="button"
              disabled={!selectedRole || !isConfirmed}
              onClick={() => choose(selectedRole)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8f2338] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#781c2e] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <span>
                {t('navbar.getStarted', 'Get Started')}
              </span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-stone-400 text-center">
          {t('authFlow.clerkNote', 'Secure authentication with Clerk')}
        </p>
      </section>
    </div>
  );
}

function ClerkSession({ children }) {
  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken } = useClerkAuth();
  const clerk = useClerk();
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [pendingRole, setPendingRole] = useState(null);

  useEffect(() => {
    if (!isSignedIn) {
      setProfile(null);
      setProfileError('');
      setIsProfileLoaded(true);
      return;
    }

    let active = true;
    let loadingProfile = false;
    let profileIsResolved = false;
    const loadProfile = async () => {
      if (loadingProfile) return;
      loadingProfile = true;
      try {
        setIsProfileLoaded(profileIsResolved);
        let lastError;
        for (let attempt = 0; attempt < 4; attempt += 1) {
          try {
            // A signed-in state can arrive just before Clerk finishes establishing
            // its session token after a redirect. Force a fresh token on retry.
            const token = await getToken(attempt ? { skipCache: true } : undefined);
            if (!token) throw new Error('Your Clerk session is still loading. Please try again.');

            const response = await fetch('/api/users/me', {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 401 && attempt < 3) {
              await new Promise((resolve) => window.setTimeout(resolve, 500 * (attempt + 1)));
              continue;
            }
            if (!response.ok) {
              const body = await response.json().catch(() => ({}));
              throw new Error(body.error || 'Could not verify your app profile.');
            }

            const nextProfile = await response.json();

            if (active && nextProfile.onboardingCompleted) {
              localStorage.removeItem('meraTailor.pendingRole');
              localStorage.removeItem('meraTailor.pendingAuthMode');
              setAuthMode(null);
            }

            if (active) {
              setProfile(nextProfile);
              setProfileError('');
              setIsProfileLoaded(true);
              profileIsResolved = true;
              if (nextProfile?.role) {
                localStorage.setItem('meraTailor.userRole', nextProfile.role);
              }
            }
            return;
          } catch (error) {
            lastError = error;
            if (attempt < 3 && !/disabled|access/i.test(error.message || '')) {
              await new Promise((resolve) => window.setTimeout(resolve, 500 * (attempt + 1)));
              continue;
            }
            break;
          }
        }
        if (active) {
          setProfileError(lastError?.message || 'Could not connect to the account service.');
          setIsProfileLoaded(true);
        }
      } finally {
        loadingProfile = false;
      }
    };

    loadProfile();
    const onFocus = () => {
      if (document.visibilityState === 'visible') loadProfile();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      active = false;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [isSignedIn, getToken]);

  const completeAuth = (role) => {
    if (role && roleChoices.includes(role)) {
      localStorage.setItem('meraTailor.pendingRole', role);
    } else {
      localStorage.removeItem('meraTailor.pendingRole');
    }
    localStorage.setItem('meraTailor.pendingAuthMode', 'signUp');
    setAuthMode(null);
    setPendingRole(null);

    const onboardingUrl = `${window.location.origin}/onboarding`;
    const dashboardUrl = `${window.location.origin}/dashboard`;
    clerk.openSignUp({
      forceRedirectUrl: onboardingUrl,
      fallbackRedirectUrl: onboardingUrl,
      signInForceRedirectUrl: dashboardUrl,
      signInFallbackRedirectUrl: dashboardUrl,
      oidcPrompt: 'select_account',
    });
  };

  const refreshProfile = async () => {
    try {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error('Your Clerk session is still loading. Please try again.');

        const response = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const body = await response.json();
          setProfile(body);
          setProfileError('');
          setIsProfileLoaded(true);
          if (body?.role) {
            localStorage.setItem('meraTailor.userRole', body.role);
          }
          return body;
        }

        const error = await response.json().catch(() => ({}));
        if (response.status === 401 && attempt < 2) {
          await new Promise((resolve) => window.setTimeout(resolve, 500 * (attempt + 1)));
          continue;
        }
        setProfileError(error.error || 'Could not verify your app profile.');
        setIsProfileLoaded(true);
        return null;
      }
      setProfileError('Your sign-in session could not be verified. Please retry or sign in again.');
      setIsProfileLoaded(true);
      return null;
    } catch (error) {
      setProfileError(error.message || 'Could not connect to the account service.');
      setIsProfileLoaded(true);
      return null;
    }
  };

  const handleOpenSignUp = (role) => {
    if (isSignedIn) {
      if (profile?.onboardingCompleted) {
        const dest = profile.role === 'admin' ? '/admin' : '/dashboard';
        if (window.location.pathname !== dest) {
          window.location.href = dest;
        }
      } else {
        if (window.location.pathname !== '/onboarding') {
          window.location.href = '/onboarding';
        }
      }
      return;
    }
    setPendingRole(role && roleChoices.includes(role) ? role : null);
    setAuthMode('signUp');
  };

  const handleOpenSignIn = (options = {}) => {
    setAuthMode(null);
    setPendingRole(null);
    const cachedRole = profile?.role || (typeof window !== 'undefined' ? localStorage.getItem('meraTailor.userRole') : null);
    const defaultTarget = cachedRole === 'admin' ? '/admin' : '/dashboard';

    if (isSignedIn && !options.forcePrompt) {
      const dest = options.redirectUrl || defaultTarget;
      if (window.location.pathname !== dest) {
        window.location.href = dest;
      }
      return;
    }

    const redirectPath = options.redirectUrl || (window.location.pathname !== '/login' ? window.location.pathname : defaultTarget);
    const targetUrl = redirectPath.startsWith('http') ? redirectPath : `${window.location.origin}${redirectPath}`;

    clerk.openSignIn({
      forceRedirectUrl: targetUrl,
      fallbackRedirectUrl: targetUrl,
      signUpForceRedirectUrl: `${window.location.origin}/onboarding`,
      oidcPrompt: 'select_account',
    });
  };

  const handleSwitchAccount = async () => {
    localStorage.removeItem('meraTailor.userRole');
    await clerk.signOut();
    setProfile(null);
    setProfileError('');
    setIsProfileLoaded(false);
    handleOpenSignIn({ forcePrompt: true });
  };

  const handleSignOut = async (...args) => {
    localStorage.removeItem('meraTailor.userRole');
    return clerk.signOut(...args);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__meraTailorOpenSignIn = handleOpenSignIn;
      return () => {
        delete window.__meraTailorOpenSignIn;
      };
    }
  }, [clerk]);

  const retryProfile = async () => {
    setIsProfileLoaded(false);
    setProfileError('');
    return refreshProfile();
  };

  const value = {
    isSignedIn: Boolean(isSignedIn),
    isLoaded,
    isProfileLoaded,
    user,
    profile,
    profileError,
    openSignIn: handleOpenSignIn,
    openSignUp: handleOpenSignUp,
    switchAccount: handleSwitchAccount,
    signOut: handleSignOut,
    getToken,
    refreshProfile,
    retryProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {authMode && (
        <RoleChooser
          close={() => {
            setAuthMode(null);
            setPendingRole(null);
          }}
          choose={completeAuth}
          initialRole={pendingRole}
        />
      )}
    </AuthContext.Provider>
  );
}

function MissingClerkSession({ children }) {
  const [authMode, setAuthMode] = useState(null);
  const [pendingRole, setPendingRole] = useState(null);
  const [message, setMessage] = useState('');

  const choose = (role) => {
    if (role && roleChoices.includes(role)) {
      localStorage.setItem('meraTailor.pendingRole', role);
    }
    setAuthMode(null);
    setPendingRole(null);
    setMessage('Add VITE_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to .env to enable secure sign-in.');
  };

  const handleOpenSignUp = (role) => {
    setPendingRole(role && roleChoices.includes(role) ? role : null);
    setAuthMode('signUp');
  };

  const handleOpenSignIn = () => {
    setAuthMode(null);
    setPendingRole(null);
    setMessage('Add VITE_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to .env to enable secure sign-in.');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__meraTailorOpenSignIn = handleOpenSignIn;
      return () => {
        delete window.__meraTailorOpenSignIn;
      };
    }
  }, []);

  const value = {
    isSignedIn: false,
    isLoaded: true,
    isProfileLoaded: true,
    user: null,
    profile: null,
    profileError: '',
    getToken: async () => null,
    signOut: () => {},
    refreshProfile: async () => null,
    retryProfile: async () => null,
    openSignIn: handleOpenSignIn,
    openSignUp: handleOpenSignUp,
    switchAccount: async () => {},
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {authMode && (
        <RoleChooser
          close={() => {
            setAuthMode(null);
            setPendingRole(null);
          }}
          choose={choose}
          initialRole={pendingRole}
        />
      )}
      {message && (
        <div role="status" className="fixed bottom-5 left-1/2 z-[130] -translate-x-1/2 rounded-xl bg-gray-950 px-5 py-3 text-sm text-white shadow-xl">
          {message}
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }) {
  return hasClerkKey ? <ClerkSession>{children}</ClerkSession> : <MissingClerkSession>{children}</MissingClerkSession>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
