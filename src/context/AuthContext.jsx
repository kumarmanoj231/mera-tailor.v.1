import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useClerk, useUser } from '@clerk/react';
import { useTranslation } from 'react-i18next';

const AuthContext = createContext(null);
const hasClerkKey = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const roleChoices = ['customer', 'tailor', 'business'];

function RoleChooser({ close, choose }) {
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onMouseDown={e => e.target === e.currentTarget && close()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-role-title"
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          aria-label={t('authFlow.close', 'Close')}
          onClick={close}
          className="float-right rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100"
        >
          ×
        </button>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8f2338]">MeraTailor</p>
        <h2 id="auth-role-title" className="mt-2 font-serif text-2xl font-bold text-stone-900">
          {t('authFlow.chooseRole', 'How will you use MeraTailor?')}
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          {t('authFlow.signUpIntro', 'Select your account type to get started with tailored tools and discovery.')}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {roleChoices.map(role => (
            <button
              key={role}
              onClick={() => choose(role)}
              className="group flex flex-col justify-between rounded-2xl border-2 border-stone-200 p-4 text-left transition hover:border-[#8f2338] hover:bg-rose-50/50 hover:shadow-md active:scale-95"
            >
              <div>
                <span className="block font-bold text-stone-900 capitalize text-base group-hover:text-[#8f2338]">
                  {t(`navbar.${role}`, role)}
                </span>
                <span className="mt-1.5 block text-xs text-stone-500 leading-relaxed">
                  {t(
                    `authFlow.${role}Hint`,
                    role === 'customer'
                      ? 'Find tailors & place orders'
                      : role === 'tailor'
                      ? 'Studio & client orders'
                      : 'Commercial batch orders'
                  )}
                </span>
              </div>
              <span className="mt-3 inline-flex items-center text-[11px] font-bold text-[#8f2338] group-hover:underline">
                {t('navbar.getStarted', 'Get Started')} →
              </span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-stone-400 text-center">{t('authFlow.clerkNote', 'Secure authentication with Clerk')}</p>
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
  const [authMode, setAuthMode] = useState(null);

  useEffect(() => {
    if (!isSignedIn) {
      setProfile(null);
      setProfileError('');
      return;
    }

    let active = true;
    const loadProfile = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('Your Clerk session is still loading. Please try again.');

        const response = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          if (active) setProfileError(body.error || 'Could not verify your app profile.');
          return;
        }

        const nextProfile = await response.json();
        const selectedRole = localStorage.getItem('meraTailor.pendingRole');

        if (active && nextProfile.onboardingCompleted && selectedRole) {
          localStorage.removeItem('meraTailor.pendingRole');
          localStorage.removeItem('meraTailor.pendingAuthMode');
        }

        if (active) {
          setProfile(nextProfile);
          setProfileError('');
        }
      } catch {
        if (active) setProfileError('Could not connect to the account service.');
      }
    };

    loadProfile();
    const interval = window.setInterval(loadProfile, 60000);
    const onFocus = () => {
      if (document.visibilityState === 'visible') loadProfile();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [isSignedIn, getToken]);

  const completeAuth = role => {
    if (role) localStorage.setItem('meraTailor.pendingRole', role);
    else localStorage.removeItem('meraTailor.pendingRole');
    localStorage.setItem('meraTailor.pendingAuthMode', 'signUp');
    setAuthMode(null);

    const redirect = `${window.location.origin}/onboarding`;
    clerk.openSignUp({ forceRedirectUrl: redirect, signInForceRedirectUrl: redirect });
  };

  const refreshProfile = async () => {
    const token = await getToken();
    if (!token) throw new Error('Your Clerk session is still loading. Please try again.');

    const response = await fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const body = await response.json();
      setProfile(body);
      setProfileError('');
      return body;
    }

    const error = await response.json().catch(() => ({}));
    setProfileError(error.error || 'Could not verify your app profile.');
    return null;
  };

  const value = {
    isSignedIn: Boolean(isSignedIn),
    isLoaded,
    user,
    profile,
    profileError,
    openSignIn: () => setAuthMode('signUp'),
    openSignUp: () => setAuthMode('signUp'),
    signOut: clerk.signOut,
    getToken,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {authMode && <RoleChooser close={() => setAuthMode(null)} choose={completeAuth} />}
    </AuthContext.Provider>
  );
}

function MissingClerkSession({ children }) {
  const [authMode, setAuthMode] = useState(null);
  const [message, setMessage] = useState('');

  const choose = role => {
    if (role) localStorage.setItem('meraTailor.pendingRole', role);
    setAuthMode(null);
    setMessage('Add VITE_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to .env to enable secure sign-in.');
  };

  const value = {
    isSignedIn: false,
    isLoaded: true,
    user: null,
    profile: null,
    profileError: '',
    getToken: async () => null,
    signOut: () => {},
    openSignIn: () => setAuthMode('signUp'),
    openSignUp: () => setAuthMode('signUp'),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {authMode && <RoleChooser close={() => setAuthMode(null)} choose={choose} />}
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
