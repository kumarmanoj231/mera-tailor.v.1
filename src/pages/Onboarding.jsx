import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Navigation, Search, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Onboarding() {
  const { t } = useTranslation(); const { isSignedIn, isLoaded, profile, getToken, refreshProfile, openSignUp } = useAuth();
  const navigate = useNavigate();
  const [role] = useState(() => { const selected = localStorage.getItem('meraTailor.pendingRole'); return ['customer', 'tailor', 'business'].includes(selected) ? selected : ['customer', 'tailor', 'business'].includes(profile?.role) ? profile.role : 'customer'; });
  const [place, setPlace] = useState(''); const [candidate, setCandidate] = useState(null); const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false); const [error, setError] = useState('');
  async function persistLocation(value) {
    setBusy(true); setError('');
    try {
      const token = await getToken();
      const response = await fetch('/api/users/location', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...value, consent: true }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || t('authFlow.locationError'));
      setCandidate(null); setSaved(true); await refreshProfile();
      toast.success(t('authFlow.locationSaved')); confetti({ particleCount: 110, spread: 70, origin: { y: .72 } });
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  function useCurrentLocation() {
    if (!navigator.geolocation) { setError(t('authFlow.geoUnavailable')); return; }
    setBusy(true); setError('');
    navigator.geolocation.getCurrentPosition(async p => {
      let label = `${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`;
      try { const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${p.coords.latitude}&lon=${p.coords.longitude}`); const data = await r.json(); label = data.display_name || label; } catch { /* Coordinates remain usable if reverse lookup is unavailable. */ }
      setBusy(false); await persistLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude, label, source: 'browser', accuracyMeters: p.coords.accuracy });
    }, e => { setBusy(false); setError(e.code === 1 ? t('authFlow.geoDenied') : t('authFlow.geoUnavailable')); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 });
  }
  async function searchPlace(e) {
    e.preventDefault(); if (!place.trim()) return;
    setBusy(true); setError('');
    try { const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(place.trim())}`); const rows = await r.json(); if (!rows.length) throw new Error(t('authFlow.placeNotFound')); setCandidate({ latitude: Number(rows[0].lat), longitude: Number(rows[0].lon), label: rows[0].display_name, source: 'manual' }); }
    catch (e) { setError(e.message || t('authFlow.locationError')); } finally { setBusy(false); }
  }
  async function finish(skip = false) {
    if (!isSignedIn) { openSignUp(); return; }
    if (!skip && !profile?.location && !saved) { setError(t('authFlow.addOrSkip')); return; }
    setBusy(true); setError('');
    try { const token = await getToken(); const response = await fetch('/api/users/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ role, preferredLanguage: localStorage.getItem('meraTailorLanguage') || 'en' }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error || t('authFlow.finishError')); await refreshProfile(); localStorage.removeItem('meraTailor.pendingRole'); localStorage.removeItem('meraTailor.pendingAuthMode'); navigate(body.role === 'admin' ? '/admin' : '/dashboard', { replace: true }); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  if (!isLoaded) return <div className="grid min-h-screen place-items-center">{t('authFlow.loading')}</div>;
  return <div className="min-h-screen bg-stone-50"><Navbar/><main className="mx-auto max-w-2xl px-5 py-12 sm:px-6">
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-9">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-rose-800">{t('authFlow.step')}</p>
      <h1 className="mt-3 text-3xl font-bold">{t('authFlow.welcome')}</h1>
      <p className="mt-2 text-slate-600">{t('authFlow.roleSelected', { role: t(`navbar.${role}`) })}</p>
      <div className="mt-7 rounded-2xl bg-stone-50 p-5"><div className="flex gap-3"><MapPin className="mt-1 text-rose-800"/><div><h2 className="font-semibold">{t('authFlow.locationTitle')}</h2><p className="mt-1 text-sm text-slate-600">{t('authFlow.locationIntro')}</p></div></div>
        {profile?.location?.label && !saved ? <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm">{t('authFlow.currentLocation')}: {profile.location.label}</p> : null}
        <button type="button" disabled={busy} onClick={useCurrentLocation} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-50"><Navigation size={17}/>{busy ? t('authFlow.working') : t('authFlow.useCurrent')}</button>
        <form onSubmit={searchPlace} className="mt-3 flex gap-2"><input aria-label={t('authFlow.placePlaceholder')} value={place} onChange={e=>setPlace(e.target.value)} placeholder={t('authFlow.placePlaceholder')} className="min-w-0 flex-1 rounded-xl border px-3 py-3"/><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl border px-4 font-semibold"><Search size={16}/>{t('authFlow.search')}</button></form>
        {candidate && <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-sm font-medium">{candidate.label}</p><button onClick={()=>persistLocation(candidate)} disabled={busy} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white"><Check size={16}/>{t('authFlow.confirmLocation')}</button></div>}
        {saved && <p className="mt-3 text-sm font-semibold text-emerald-800">{t('authFlow.locationSaved')}</p>}
        <p className="mt-3 text-xs text-slate-500">{t('authFlow.privacy')}</p>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-rose-800">{error}</p>}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button onClick={()=>finish(true)} disabled={busy} className="rounded-xl px-4 py-3 font-medium text-slate-600">{t('authFlow.skip')}</button><button onClick={()=>finish(false)} disabled={busy} className="rounded-xl bg-rose-900 px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? t('authFlow.working') : t('authFlow.continue')}</button></div>
    </section>
  </main><Footer/></div>;
}
