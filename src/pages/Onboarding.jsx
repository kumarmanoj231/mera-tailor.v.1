import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Navigation,
  Search,
  Check,
  Scissors,
  UserCheck,
  Building2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const validRoles = ['customer', 'tailor', 'business'];

export default function Onboarding() {
  const { t } = useTranslation();
  const { isSignedIn, isLoaded, profile, getToken, refreshProfile, openSignUp } = useAuth();
  const navigate = useNavigate();

  // Redirect returning users who already finished onboarding
  useEffect(() => {
    if (isLoaded && isSignedIn && profile?.onboardingCompleted && profile?.role) {
      navigate(profile.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isLoaded, isSignedIn, profile, navigate]);

  // Determine authoritative initial role
  const getInitialRole = () => {
    // 1. Authoritative DB profile role
    if (profile?.role && validRoles.includes(profile.role) && !profile?.roleInconsistent) {
      return profile.role;
    }
    // 2. Pending selection from registration modal
    const pending = localStorage.getItem('meraTailor.pendingRole');
    if (pending && validRoles.includes(pending)) {
      return pending;
    }
    // 3. Fallback to customer if not set
    return 'customer';
  };

  const [role, setRole] = useState(getInitialRole);
  const [place, setPlace] = useState('');
  const [candidate, setCandidate] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Keep role in sync if profile loads with an existing authoritative role
  useEffect(() => {
    if (profile?.role && validRoles.includes(profile.role) && !profile?.roleInconsistent) {
      setRole(profile.role);
    }
  }, [profile]);

  // Check if role is locked by database
  const isRoleLocked = Boolean(
    profile?.role && validRoles.includes(profile.role) && !profile?.roleInconsistent
  );

  const roleMeta = {
    customer: {
      title: t('authFlow.customerTitle', 'Customer & Shopper'),
      desc: t('authFlow.customerHint', 'Find nearby tailors, book bespoke outfits, and save body measurements.'),
      icon: <UserCheck size={20} />,
      badge: t('authFlow.customerBadge', 'For Individuals'),
    },
    tailor: {
      title: t('authFlow.tailorTitle', 'Tailor & Boutique Studio'),
      desc: t('authFlow.tailorHint', 'Accept local retail client orders, manage workbooks, and bid on contracts.'),
      icon: <Scissors size={20} />,
      badge: t('authFlow.tailorBadge', 'For Artisans'),
    },
    business: {
      title: t('authFlow.businessTitle', 'Business & Brand'),
      desc: t('authFlow.businessHint', 'Post bulk uniform RFQs, review artisan bids, and manage manufacturing.'),
      icon: <Building2 size={20} />,
      badge: t('authFlow.businessBadge', 'For Bulk Buyers'),
    },
  };

  async function persistLocation(value) {
    setBusy(true);
    setError('');
    try {
      const token = await getToken();
      const response = await fetch('/api/users/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...value, consent: true }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || t('authFlow.locationError'));
      setCandidate(null);
      setSaved(true);
      await refreshProfile();
      toast.success(t('authFlow.locationSaved'));
      confetti({ particleCount: 110, spread: 70, origin: { y: 0.72 } });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError(t('authFlow.geoUnavailable'));
      return;
    }
    setBusy(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        let label = `${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`;
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${p.coords.latitude}&lon=${p.coords.longitude}`
          );
          const data = await r.json();
          label = data.display_name || label;
        } catch {
          /* Coordinates remain usable if reverse lookup is unavailable. */
        }
        setBusy(false);
        await persistLocation({
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
          label,
          source: 'browser',
          accuracyMeters: p.coords.accuracy,
        });
      },
      (e) => {
        setBusy(false);
        setError(e.code === 1 ? t('authFlow.geoDenied') : t('authFlow.geoUnavailable'));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
    );
  }

  async function searchPlace(e) {
    e.preventDefault();
    if (!place.trim()) return;
    setBusy(true);
    setError('');
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
          place.trim()
        )}`
      );
      const rows = await r.json();
      if (!rows.length) throw new Error(t('authFlow.placeNotFound'));
      setCandidate({
        latitude: Number(rows[0].lat),
        longitude: Number(rows[0].lon),
        label: rows[0].display_name,
        source: 'manual',
      });
    } catch (e) {
      setError(e.message || t('authFlow.locationError'));
    } finally {
      setBusy(false);
    }
  }

  async function finish(skip = false) {
    if (!isSignedIn) {
      openSignUp(role);
      return;
    }
    if (!skip && !profile?.location && !saved) {
      setError(t('authFlow.addOrSkip'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const token = await getToken();
      const response = await fetch('/api/users/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          preferredLanguage: localStorage.getItem('meraTailorLanguage') || 'en',
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error || t('authFlow.finishError'));
      }
      localStorage.removeItem('meraTailor.pendingRole');
      localStorage.removeItem('meraTailor.pendingAuthMode');
      await refreshProfile();
      navigate(body.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!isLoaded) {
    return <div className="grid min-h-screen place-items-center">{t('authFlow.loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="mx-auto max-w-2xl px-5 py-12 sm:px-6">
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-rose-800">
            {t('authFlow.step', 'Step 2: Profile Setup')}
          </p>
          <h1 className="mt-3 text-3xl font-bold">{t('authFlow.welcome', 'Welcome to MeraTailor')}</h1>

          {/* Account Inconsistency Recovery Notice */}
          {profile?.roleInconsistent && (
            <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">Account Role Configuration Required</p>
                <p className="mt-0.5 text-xs text-amber-800 leading-relaxed">
                  Your profile requires an authoritative account role. Select your account type below to complete recovery and unlock your dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Role Status or Role Selector */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                {isRoleLocked ? 'Registered Role (Locked)' : 'Account Role Selection'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                <ShieldCheck size={13} />
                {isRoleLocked ? 'Verified Permanent' : 'One-Time Setup'}
              </span>
            </div>

            {isRoleLocked ? (
              /* Role is locked by backend */
              <div className="mt-2.5 flex items-center gap-3 rounded-2xl border border-rose-200 bg-[#fffaf8] p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8f2338] text-white">
                  {roleMeta[role]?.icon || <UserCheck size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm sm:text-base capitalize">
                      {roleMeta[role]?.title || role}
                    </span>
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-[#8f2338]">
                      {roleMeta[role]?.badge || 'Permanent'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {roleMeta[role]?.desc || `Your account role is permanent as ${role}.`}
                  </p>
                </div>
              </div>
            ) : (
              /* Uncommitted / Incomplete Role Chooser */
              <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                {validRoles.map((r) => {
                  const isSelected = role === r;
                  const meta = roleMeta[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`relative flex flex-col justify-between rounded-2xl border-2 p-3 text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-[#8f2338] bg-[#fffaf8] shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                            isSelected ? 'bg-[#8f2338] text-white' : 'bg-[#f7eee5] text-[#8f2338]'
                          }`}
                        >
                          {meta.icon}
                        </div>
                        {isSelected && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8f2338] text-white">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5">
                        <span className="block font-bold text-stone-900 text-xs">
                          {meta.title}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-stone-500 leading-snug">
                          {meta.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Location setup section */}
          <div className="mt-7 rounded-2xl bg-stone-50 p-5">
            <div className="flex gap-3">
              <MapPin className="mt-1 text-rose-800" />
              <div>
                <h2 className="font-semibold">{t('authFlow.locationTitle')}</h2>
                <p className="mt-1 text-sm text-slate-600">{t('authFlow.locationIntro')}</p>
              </div>
            </div>

            {profile?.location?.label && !saved ? (
              <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm">
                {t('authFlow.currentLocation')}: {profile.location.label}
              </p>
            ) : null}

            <button
              type="button"
              disabled={busy}
              onClick={useCurrentLocation}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-50 cursor-pointer"
            >
              <Navigation size={17} />
              {busy ? t('authFlow.working') : t('authFlow.useCurrent')}
            </button>

            <form onSubmit={searchPlace} className="mt-3 flex gap-2">
              <input
                aria-label={t('authFlow.placePlaceholder')}
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder={t('authFlow.placePlaceholder')}
                className="min-w-0 flex-1 rounded-xl border border-stone-200 px-3 py-3 text-sm focus:border-[#8f2338] focus:outline-hidden"
              />
              <button
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 font-semibold hover:bg-stone-100 disabled:opacity-50 cursor-pointer text-sm"
              >
                <Search size={16} />
                {t('authFlow.search')}
              </button>
            </form>

            {candidate && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-medium">{candidate.label}</p>
                <button
                  onClick={() => persistLocation(candidate)}
                  disabled={busy}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white cursor-pointer"
                >
                  <Check size={16} />
                  {t('authFlow.confirmLocation')}
                </button>
              </div>
            )}

            {saved && (
              <p className="mt-3 text-sm font-semibold text-emerald-800">
                {t('authFlow.locationSaved')}
              </p>
            )}

            <p className="mt-3 text-xs text-slate-500">{t('authFlow.privacy')}</p>
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm text-rose-800">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              onClick={() => finish(true)}
              disabled={busy}
              className="rounded-xl px-4 py-3 font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer text-sm"
            >
              {t('authFlow.skip')}
            </button>
            <button
              onClick={() => finish(false)}
              disabled={busy}
              className="rounded-xl bg-rose-900 px-6 py-3 font-semibold text-white shadow-xs hover:bg-rose-950 transition disabled:opacity-50 cursor-pointer text-sm"
            >
              {busy ? t('authFlow.working') : t('authFlow.continue')}
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
