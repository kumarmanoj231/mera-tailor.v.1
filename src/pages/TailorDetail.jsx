import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  MapPin,
  PackageCheck,
  Ruler,
  ShoppingBag,
  Star,
  Bookmark,
  Share2,
  Phone,
  ShieldCheck,
  Scissors,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  Lock,
  Copy,
  CheckCircle2,
  Layers,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const EMPTY_FORM = {
  garment: '',
  quantity: 1,
  color: '',
  fabric: '',
  deadline: 'Flexible',
  notes: '',
  measurementMode: 'self',
  measurementProfileId: ''
};

const money = value => {
  if (value === null || value === undefined || isNaN(value)) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

export default function TailorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { isSignedIn, profile, getToken, openSignUp } = useAuth();

  const [tailor, setTailor] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [step, setStep] = useState('details'); // 'details' | 'review' | 'placed'
  const [placedOrder, setPlacedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Normalize services
  const services = useMemo(() => {
    if (tailor?.services?.length) return tailor.services;
    if (tailor?.categories?.length) {
      return tailor.categories.map(name => ({
        name,
        price: tailor.minPrice || 499,
        days: 5
      }));
    }
    return [{
      name: t('orderFlow.customStitching'),
      price: tailor?.minPrice || 499,
      days: 5
    }];
  }, [tailor, t]);

  const selectedService = services.find(service => service.name === form.garment) || services[0];
  const unitPrice = Number(selectedService?.price ?? tailor?.minPrice);
  const hasPrice = Number.isFinite(unitPrice) && unitPrice >= 0;
  const total = hasPrice ? unitPrice * Number(form.quantity || 1) : null;
  const canOrder = isSignedIn && ['customer', 'admin'].includes(profile?.role);

  // Fetch tailor details & restore draft if pending
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetch(`/api/tailors/${encodeURIComponent(id)}`)
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || t('tailorView.notFound'));
        if (!active) return;
        setTailor(data);

        // Restore pending order draft if returning from auth
        const savedDraft = sessionStorage.getItem('meraTailor.pending-order');
        if (savedDraft) {
          try {
            const draft = JSON.parse(savedDraft);
            if (String(draft.tailorId) === String(id)) {
              setForm({ ...EMPTY_FORM, ...draft.form });
              setStep('review');
            }
          } catch {
            sessionStorage.removeItem('meraTailor.pending-order');
          }
        }
      })
      .catch(err => {
        if (active) setError(err.message || t('tailorView.notFound'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, t]);

  // Check if saved & fetch measurements
  useEffect(() => {
    if (!isSignedIn || !['customer', 'admin'].includes(profile?.role)) {
      setMeasurements([]);
      setIsSaved(false);
      return;
    }

    let active = true;
    (async () => {
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch user's saved tailors to check bookmark status
        const savedRes = await fetch('/api/saved-tailors', { headers });
        if (savedRes.ok) {
          const savedList = await savedRes.json();
          if (active && Array.isArray(savedList)) {
            setIsSaved(savedList.some(item => String(item._id || item.id) === String(id)));
          }
        }

        // Fetch user's saved measurements
        const mRes = await fetch('/api/measurements', { headers });
        const mData = await mRes.json();
        if (active && mRes.ok && Array.isArray(mData)) {
          setMeasurements(mData);
        }
      } catch {
        // Optional during browse
      }
    })();

    return () => {
      active = false;
    };
  }, [isSignedIn, profile?.role, getToken, id]);

  // Set default garment if empty
  useEffect(() => {
    if (tailor && !form.garment && services.length) {
      setForm(current => ({ ...current, garment: services[0].name }));
    }
  }, [tailor, services, form.garment]);

  // Resume checkout parameter check
  useEffect(() => {
    if (searchParams.get('checkout') === 'resume' && isSignedIn && profile?.onboardingCompleted && tailor) {
      const savedDraft = sessionStorage.getItem('meraTailor.pending-order');
      if (savedDraft) setStep('review');
    }
  }, [isSignedIn, profile?.onboardingCompleted, searchParams, tailor]);

  // Confetti trigger on successful placement
  useEffect(() => {
    if (placedOrder && step === 'placed') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8f2338', '#d97706', '#10b981', '#3b82f6', '#f59e0b']
        });
      } catch {
        // Safe fallback
      }
    }
  }, [placedOrder, step]);

  const update = event => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const handleServiceSelect = serviceName => {
    setForm(current => ({ ...current, garment: serviceName }));
  };

  const adjustQuantity = delta => {
    setForm(current => {
      const next = Math.max(1, Math.min(500, (Number(current.quantity) || 1) + delta));
      return { ...current, quantity: next };
    });
  };

  const handleToggleBookmark = async () => {
    if (!isSignedIn) {
      toast.info(t('discovery.getStartedToSave') || 'Get started to save this studio.');
      openSignUp();
      return;
    }

    try {
      setSavingBookmark(true);
      const token = await getToken();
      const response = await fetch(`/api/saved-tailors/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ saved: !isSaved })
      });

      if (!response.ok) throw new Error('Failed to update bookmark');
      const data = await response.json();
      setIsSaved(data.saved);
      toast.success(data.saved ? t('tailorView.savedToFavorites') : t('discovery.removed'));
    } catch {
      toast.error(t('discovery.saveError'));
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${tailor?.name || 'Tailor'} | MeraTailor`,
        text: `Check out ${tailor?.name} on MeraTailor for custom tailoring!`,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success(t('tailorView.linkCopied'));
    }
  };

  const copyOrderReference = () => {
    if (!placedOrder?.id) return;
    navigator.clipboard.writeText(placedOrder.id);
    setCopiedId(true);
    toast.success('Order ID copied!');
    setTimeout(() => setCopiedId(false), 2500);
  };

  const goToReview = event => {
    event.preventDefault();
    setError('');
    if (!form.garment) {
      setError(t('orderFlow.chooseServiceError'));
      return;
    }
    const q = Number(form.quantity);
    if (!Number.isInteger(q) || q < 1 || q > 500) {
      setError(t('orderFlow.quantityError'));
      return;
    }
    setForm(current => ({
      ...current,
      quantity: q,
      garment: selectedService?.name || current.garment
    }));
    setStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const placeOrder = async () => {
    setError('');
    if (!isSignedIn) {
      sessionStorage.setItem('meraTailor.pending-order', JSON.stringify({ tailorId: id, form }));
      openSignUp();
      return;
    }
    if (!canOrder) {
      setError(t('orderFlow.customerOnly'));
      return;
    }

    setBusy(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tailorId: id,
          garment: selectedService?.name || form.garment,
          category: selectedService?.name || form.garment,
          quantity: Number(form.quantity),
          color: form.color,
          fabric: form.fabric,
          deadline: form.deadline,
          notes: form.notes,
          measurementMode: form.measurementMode,
          measurementProfileId: form.measurementMode === 'profile' ? form.measurementProfileId : ''
        })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || t('orderFlow.placeError'));

      sessionStorage.removeItem('meraTailor.pending-order');
      setPlacedOrder(result);
      setStep('placed');
      toast.success(t('orderFlow.orderPlaced'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (orderError) {
      setError(orderError.message || t('orderFlow.placeError'));
    } finally {
      setBusy(false);
    }
  };

  const selectedMeasurement = measurements.find(
    item => String(item._id) === String(form.measurementProfileId)
  );

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#231b1a]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <Link
              to="/find-tailors"
              className="inline-flex items-center gap-1.5 font-medium text-[#8f2338] transition hover:text-[#781c2e]"
            >
              <ArrowLeft size={16} />
              {t('tailorView.back')}
            </Link>
            <span className="text-stone-300">/</span>
            <span className="line-clamp-1 max-w-[200px] text-stone-700 sm:max-w-xs">
              {tailor?.name || t('tailorView.eyebrow')}
            </span>
          </div>

          {tailor && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 hover:border-stone-300"
                title={t('tailorView.share')}
              >
                <Share2 size={14} className="text-stone-500" />
                <span className="hidden sm:inline">{t('tailorView.share')}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleBookmark}
                disabled={savingBookmark}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-sm transition ${
                  isSaved
                    ? 'border-rose-200 bg-rose-50 text-[#8f2338]'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Bookmark size={14} className={isSaved ? 'fill-[#8f2338]' : ''} />
                <span>{isSaved ? t('tailorView.savedToFavorites') : t('tailorView.saveToFavorites')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Global Error Notice */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-[#8f2338]"
          >
            <Info size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <div className="h-72 w-full animate-pulse rounded-3xl bg-stone-200/80" />
              <div className="h-40 w-full animate-pulse rounded-3xl bg-stone-200/80" />
            </div>
            <div className="lg:col-span-5">
              <div className="h-96 w-full animate-pulse rounded-3xl bg-stone-200/80" />
            </div>
          </div>
        ) : !tailor ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-bold text-stone-900">{t('tailorView.notFound')}</h2>
            <p className="mt-2 text-sm text-stone-500">
              The tailor studio you are looking for may have been removed or updated.
            </p>
            <Link
              to="/find-tailors"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8f2338] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#781c2e]"
            >
              <ArrowLeft size={16} />
              {t('tailorView.back')}
            </Link>
          </div>
        ) : step === 'placed' && placedOrder ? (
          /* =========================================================
             STEP 3: ORDER CONFIRMATION & CELEBRATION
          ========================================================= */
          <section className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-md sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
              <PackageCheck size={40} className="animate-bounce" />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-emerald-700">
              {t('orderFlow.confirmationEyebrow')}
            </p>
            <h1 className="mt-2 text-2xl font-black text-stone-950 sm:text-3xl">
              {t('orderFlow.confirmationTitle')}
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-stone-600 sm:text-base">
              {t('orderFlow.confirmationHelp', { tailor: tailor.name })}
            </p>

            {/* Order Reference Ticket */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50/80 p-5 text-left">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    {t('orderFlow.orderNumber')}
                  </span>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-stone-900">
                      {placedOrder.id || placedOrder._id}
                    </span>
                    <button
                      type="button"
                      onClick={copyOrderReference}
                      className="rounded-lg p-1 text-stone-400 transition hover:bg-stone-200 hover:text-stone-700"
                      title="Copy Reference ID"
                    >
                      {copiedId ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-bold text-amber-900">
                  <Clock3 size={13} />
                  {t('orderFlow.requestStatus')}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="text-xs text-stone-500">Selected Garment</span>
                  <p className="font-semibold text-stone-900">
                    {form.quantity} × {selectedService?.name || form.garment}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{t('orderFlow.totalEstimate')}</span>
                  <p className="font-bold text-[#8f2338]">
                    {total === null ? t('orderFlow.quoteAfterReview') : money(total)}
                  </p>
                </div>
                {form.color && (
                  <div>
                    <span className="text-xs text-stone-500">{t('orderFlow.color')}</span>
                    <p className="font-medium text-stone-800">{form.color}</p>
                  </div>
                )}
                {form.fabric && (
                  <div>
                    <span className="text-xs text-stone-500">{t('orderFlow.fabric')}</span>
                    <p className="font-medium text-stone-800">{form.fabric}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 4-Stage Lifecycle Stepper Visualizer */}
            <div className="mt-8 rounded-2xl border border-stone-100 bg-[#fbf9f5] p-5 text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {t('orderFlow.orderLifecycleTitle')}
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                  <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    ✓
                  </div>
                  <p className="mt-2 text-xs font-bold text-emerald-900">{t('orderFlow.stage1')}</p>
                  <span className="text-[11px] text-emerald-700">Dispatched</span>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-center">
                  <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                    2
                  </div>
                  <p className="mt-2 text-xs font-bold text-amber-950">{t('orderFlow.stage2')}</p>
                  <span className="text-[11px] text-amber-800">Pending Review</span>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white p-3 text-center opacity-70">
                  <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-stone-300 text-xs font-bold text-stone-700">
                    3
                  </div>
                  <p className="mt-2 text-xs font-semibold text-stone-700">{t('orderFlow.stage3')}</p>
                  <span className="text-[11px] text-stone-500">Upon Approval</span>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white p-3 text-center opacity-70">
                  <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-stone-300 text-xs font-bold text-stone-700">
                    4
                  </div>
                  <p className="mt-2 text-xs font-semibold text-stone-700">{t('orderFlow.stage4')}</p>
                  <span className="text-[11px] text-stone-500">Pickup / Drop</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/my-orders"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8f2338] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#781c2e]"
              >
                {t('orderFlow.trackOrder')}
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/find-tailors"
                className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-6 py-3.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                {t('orderFlow.continueShopping')}
              </Link>
            </div>
          </section>
        ) : (
          /* =========================================================
             2-COLUMN MODERN LAYOUT: STUDIO PROFILE + ORDER BOOKING
          ========================================================= */
          <div className="grid gap-8 lg:grid-cols-12">
            {/* -------------------------------------------------------
               LEFT COLUMN: STUDIO PROFILE, SERVICES & TRUST PILLARS
            ------------------------------------------------------- */}
            <div className="space-y-8 lg:col-span-7">
              {/* Studio Hero Profile Card */}
              <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                <div className="relative h-64 w-full bg-stone-900 sm:h-72">
                  <img
                    src={tailor.image || '/assets/tailor-character.png'}
                    alt={tailor.name}
                    className="h-full w-full object-cover opacity-90 transition duration-500 hover:scale-105"
                    onError={e => {
                      e.currentTarget.src = '/assets/tailor-character.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {tailor.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-bold tracking-wide text-white backdrop-blur-md shadow-sm">
                          <ShieldCheck size={14} />
                          {t('tailorView.verifiedMaster')}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-900/80 px-3 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                        {t('tailorView.acceptingOrders')}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-stone-950 shadow-sm">
                      <Star size={13} className="fill-stone-950 text-stone-950" />
                      {tailor.rating ? `${tailor.rating} ★` : t('tailorView.new')}
                      {tailor.reviews > 0 && ` (${tailor.reviews})`}
                    </span>
                  </div>

                  {/* Title & Location Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs font-bold uppercase tracking-widest text-rose-300">
                      {t('tailorView.eyebrow')}
                    </p>
                    <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl text-white">
                      {tailor.name}
                    </h1>
                  </div>
                </div>

                {/* Studio Meta & Info Bar */}
                <div className="p-6 sm:p-7">
                  {/* Location & Contact Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-5">
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <MapPin size={18} className="shrink-0 text-[#8f2338]" />
                      {isSignedIn ? (
                        <span>
                          {[tailor.area, tailor.city, tailor.state, tailor.country]
                            .filter(Boolean)
                            .join(', ') || 'Jaipur, Rajasthan'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-stone-500">
                          <Lock size={13} />
                          {t('tailorView.locationHidden')}
                        </span>
                      )}
                    </div>

                    {isSignedIn && tailor.phone ? (
                      <a
                        href={`tel:${tailor.phone}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-stone-100 px-3.5 py-2 text-xs font-bold text-stone-800 transition hover:bg-stone-200"
                      >
                        <Phone size={14} className="text-[#8f2338]" />
                        {tailor.phone}
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={openSignUp}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8f2338] transition hover:underline"
                      >
                        <Lock size={12} />
                        {t('tailorView.getStartedToCall', 'Get started to call')}
                      </button>
                    )}
                  </div>

                  {/* Bio / Description */}
                  {tailor.description && (
                    <div className="mt-5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                        {t('tailorView.aboutStudio')}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
                        {tailor.description}
                      </p>
                    </div>
                  )}

                  {/* Key Metric Cards */}
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl bg-stone-50 p-3.5 text-center border border-stone-100">
                      <span className="text-xs text-stone-500">{t('tailorView.experience')}</span>
                      <p className="mt-1 font-bold text-stone-900">
                        {tailor.experience ? `${tailor.experience} ${t('tailorView.years')}` : '8+ yrs'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 p-3.5 text-center border border-stone-100">
                      <span className="text-xs text-stone-500">{t('tailorView.startingPrice')}</span>
                      <p className="mt-1 font-bold text-[#8f2338]">
                        {tailor.minPrice != null ? `${money(tailor.minPrice)}+` : '₹499+'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 p-3.5 text-center border border-stone-100">
                      <span className="text-xs text-stone-500">{t('tailorView.status')}</span>
                      <p className="mt-1 font-bold text-emerald-700">
                        {tailor.status || 'Active'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 p-3.5 text-center border border-stone-100">
                      <span className="text-xs text-stone-500">{t('tailorView.reviews')}</span>
                      <p className="mt-1 font-bold text-stone-900">
                        {tailor.reviews || 0} reviews
                      </p>
                    </div>
                  </div>

                  {/* Spoken Languages & Specialties */}
                  <div className="mt-5 flex flex-wrap items-center gap-2 pt-2">
                    {tailor.languages?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
                        <span className="font-semibold text-stone-700">{t('tailorView.languages')}:</span>
                        {tailor.languages.map(lang => (
                          <span key={lang} className="rounded-md bg-stone-100 px-2 py-0.5 text-stone-700">
                            {lang}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Interactive Services & Craftsmanship Menu */}
              <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-stone-950 sm:text-xl">
                      {t('tailorView.servicesTitle')}
                    </h2>
                    <p className="mt-1 text-xs text-stone-500 sm:text-sm">
                      {t('tailorView.servicesSubtitle')}
                    </p>
                  </div>
                  <span className="hidden rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-[#8f2338] sm:inline">
                    {services.length} {t('tailorView.services')}
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {services.map(service => {
                    const isSelected = form.garment === service.name;
                    return (
                      <button
                        key={service.name}
                        type="button"
                        onClick={() => handleServiceSelect(service.name)}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? 'border-[#8f2338] bg-rose-50/40 ring-2 ring-[#8f2338]/20 shadow-sm'
                            : 'border-stone-200 bg-stone-50/50 hover:border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-bold transition ${
                                isSelected
                                  ? 'bg-[#8f2338] text-white'
                                  : 'bg-stone-200 text-stone-700 group-hover:bg-stone-300'
                              }`}
                            >
                              <Scissors size={15} />
                            </span>
                            <span className="font-bold text-stone-900 text-sm sm:text-base">
                              {service.name}
                            </span>
                          </div>

                          {isSelected && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#8f2338] px-2 py-0.5 text-[11px] font-bold text-white">
                              ✓ {t('tailorView.selected')}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-stone-200/60 pt-3 text-xs">
                          <span className="flex items-center gap-1 text-stone-500">
                            <Clock3 size={13} />
                            {service.days
                              ? `${service.days} ${t('tailorView.days')}`
                              : '3-5 days'}
                          </span>
                          <span className="font-extrabold text-[#8f2338] text-sm">
                            {service.price != null ? money(service.price) : t('orderFlow.quoteAfterReview')}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* MeraTailor Trust Pillars Guarantee */}
              <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
                <h3 className="text-base font-bold text-stone-950 sm:text-lg">
                  {t('tailorView.trustPillarsTitle')}
                </h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-stone-100 bg-[#fbf9f5] p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100/70 text-[#8f2338]">
                      <Scissors size={18} />
                    </div>
                    <h4 className="mt-3 text-xs font-bold uppercase tracking-wider text-stone-900">
                      {t('tailorView.trustPillar1Title')}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-stone-600">
                      {t('tailorView.trustPillar1Desc')}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone-100 bg-[#fbf9f5] p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-800">
                      <ShieldCheck size={18} />
                    </div>
                    <h4 className="mt-3 text-xs font-bold uppercase tracking-wider text-stone-900">
                      {t('tailorView.trustPillar2Title')}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-stone-600">
                      {t('tailorView.trustPillar2Desc')}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone-100 bg-[#fbf9f5] p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100/70 text-amber-800">
                      <Sparkles size={18} />
                    </div>
                    <h4 className="mt-3 text-xs font-bold uppercase tracking-wider text-stone-900">
                      {t('tailorView.trustPillar3Title')}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-stone-600">
                      {t('tailorView.trustPillar3Desc')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Reviews Showcase */}
              <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-stone-950 sm:text-lg">
                      {t('tailorView.reviewsTitle')}
                    </h3>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {t('tailorView.reviewsSubtitle')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
                    <Star size={13} className="fill-amber-500 text-amber-500" />
                    {tailor.rating ? `${tailor.rating} / 5.0` : '5.0 ★'}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-[#8f2338] text-white flex items-center justify-center font-bold text-xs">
                          R
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900">Rohit S.</p>
                          <span className="text-[11px] text-stone-400">Verified Stitching Order</span>
                        </div>
                      </div>
                      <div className="flex text-amber-500">
                        {'★'.repeat(5)}
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-stone-600">
                      "Extremely impressed with the precision fit of my 3-piece formal suit. Completed right on time before the wedding event!"
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                          P
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900">Pooja M.</p>
                          <span className="text-[11px] text-stone-400">Verified Kurti & Saree Fitting</span>
                        </div>
                      </div>
                      <div className="flex text-amber-500">
                        {'★'.repeat(5)}
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-stone-600">
                      "Very polite tailor, took in-person measurements carefully and gave suggestions on neckline styling. Will order again."
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* -------------------------------------------------------
               RIGHT COLUMN: ORDER CONFIGURATION & STEPPER CARD (STICKY)
            ------------------------------------------------------- */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 rounded-3xl border border-stone-200 bg-white p-5 shadow-lg sm:p-7">
                {/* Stepper Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-50 text-[#8f2338]">
                      <ShoppingBag size={20} />
                    </span>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        {t('orderFlow.checkoutEyebrow')}
                      </p>
                      <h2 className="text-lg font-black text-stone-950 sm:text-xl">
                        {t('orderFlow.checkoutTitle')}
                      </h2>
                    </div>
                  </div>

                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
                    {step === 'review' ? t('orderFlow.stepReview') : t('orderFlow.stepDetails')}
                  </span>
                </div>

                {/* Stepper Progress Indicator */}
                <div className="mt-5 flex items-center gap-2">
                  <div
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      step === 'details' || step === 'review' || step === 'placed'
                        ? 'bg-[#8f2338]'
                        : 'bg-stone-200'
                    }`}
                  />
                  <div
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      step === 'review' || step === 'placed' ? 'bg-[#8f2338]' : 'bg-stone-200'
                    }`}
                  />
                </div>

                {/* STEP 1: CONFIGURE FIT & GARMENT */}
                {step === 'details' ? (
                  <form onSubmit={goToReview} className="mt-6 space-y-4">
                    {/* Garment Selector */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                        {t('orderFlow.service')} <span className="text-[#8f2338]">*</span>
                      </label>
                      <select
                        name="garment"
                        value={form.garment}
                        onChange={update}
                        required
                        className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm font-medium text-stone-900 shadow-sm focus:border-[#8f2338] focus:outline-none focus:ring-1 focus:ring-[#8f2338]"
                      >
                        <option value="">{t('orderFlow.chooseService')}</option>
                        {services.map(service => (
                          <option key={service.name} value={service.name}>
                            {service.name}
                            {service.price != null ? ` · ${money(Number(service.price))}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity & Timeline */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                          {t('orderFlow.quantity')} <span className="text-[#8f2338]">*</span>
                        </label>
                        <div className="mt-1.5 flex items-center rounded-xl border border-stone-200 bg-white shadow-sm">
                          <button
                            type="button"
                            onClick={() => adjustQuantity(-1)}
                            className="px-3.5 py-2.5 text-base font-bold text-stone-600 transition hover:bg-stone-100 rounded-l-xl"
                          >
                            -
                          </button>
                          <input
                            name="quantity"
                            type="number"
                            min="1"
                            max="500"
                            step="1"
                            value={form.quantity}
                            onChange={update}
                            required
                            className="w-full text-center text-sm font-bold text-stone-900 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => adjustQuantity(1)}
                            className="px-3.5 py-2.5 text-base font-bold text-stone-600 transition hover:bg-stone-100 rounded-r-xl"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                          {t('orderFlow.deadline')}
                        </label>
                        <select
                          name="deadline"
                          value={form.deadline}
                          onChange={update}
                          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm font-medium text-stone-900 shadow-sm focus:border-[#8f2338] focus:outline-none focus:ring-1 focus:ring-[#8f2338]"
                        >
                          <option value="Flexible">{t('orderFlow.flexible')}</option>
                          <option value="7 days">{t('orderFlow.days7')}</option>
                          <option value="14 days">{t('orderFlow.days14')}</option>
                          <option value="30 days">{t('orderFlow.days30')}</option>
                        </select>
                      </div>
                    </div>

                    {/* Color & Fabric Source */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                          {t('orderFlow.color')}
                        </label>
                        <input
                          name="color"
                          value={form.color}
                          onChange={update}
                          maxLength={60}
                          placeholder={t('orderFlow.colorPlaceholder')}
                          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#8f2338] focus:outline-none focus:ring-1 focus:ring-[#8f2338]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                          {t('orderFlow.fabric')}
                        </label>
                        <input
                          name="fabric"
                          value={form.fabric}
                          onChange={update}
                          maxLength={100}
                          placeholder={t('orderFlow.fabricPlaceholder')}
                          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#8f2338] focus:outline-none focus:ring-1 focus:ring-[#8f2338]"
                        />
                      </div>
                    </div>

                    {/* Measurement Mode Selector */}
                    <fieldset className="pt-1">
                      <legend className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700">
                        <Ruler size={14} className="text-[#8f2338]" />
                        {t('orderFlow.measurements')}
                      </legend>

                      <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                        <label
                          className={`flex cursor-pointer items-start gap-2.5 rounded-2xl border p-3.5 text-xs transition ${
                            form.measurementMode === 'self'
                              ? 'border-[#8f2338] bg-rose-50/50 ring-1 ring-[#8f2338]'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="measurementMode"
                            value="self"
                            checked={form.measurementMode === 'self'}
                            onChange={update}
                            className="mt-0.5 text-[#8f2338] focus:ring-[#8f2338]"
                          />
                          <div>
                            <strong className="block text-stone-900">
                              {t('orderFlow.measureInPerson')}
                            </strong>
                            <span className="mt-0.5 block text-[11px] text-stone-500 leading-tight">
                              {t('orderFlow.measureInPersonHelp')}
                            </span>
                          </div>
                        </label>

                        <label
                          className={`flex cursor-pointer items-start gap-2.5 rounded-2xl border p-3.5 text-xs transition ${
                            form.measurementMode === 'profile'
                              ? 'border-[#8f2338] bg-rose-50/50 ring-1 ring-[#8f2338]'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          } ${!measurements.length ? 'opacity-80' : ''}`}
                        >
                          <input
                            type="radio"
                            name="measurementMode"
                            value="profile"
                            checked={form.measurementMode === 'profile'}
                            onChange={update}
                            disabled={!measurements.length}
                            className="mt-0.5 text-[#8f2338] focus:ring-[#8f2338]"
                          />
                          <div>
                            <strong className="block text-stone-900">
                              {t('orderFlow.savedMeasurement')}
                            </strong>
                            <span className="mt-0.5 block text-[11px] text-stone-500 leading-tight">
                              {measurements.length
                                ? t('orderFlow.savedMeasurementHelp')
                                : t('orderFlow.noSavedMeasurement')}
                            </span>
                          </div>
                        </label>
                      </div>
                    </fieldset>

                    {/* Saved Profile Dropdown if Mode is 'profile' */}
                    {form.measurementMode === 'profile' && (
                      <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-3.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                          {t('orderFlow.measurementProfile')} <span className="text-[#8f2338]">*</span>
                        </label>
                        <select
                          name="measurementProfileId"
                          value={form.measurementProfileId}
                          onChange={update}
                          required
                          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-900 shadow-sm focus:border-[#8f2338] focus:outline-none"
                        >
                          <option value="">{t('orderFlow.chooseMeasurement')}</option>
                          {measurements.map(item => (
                            <option key={item._id} value={item._id}>
                              {item.name} · {item.garment}
                            </option>
                          ))}
                        </select>

                        {/* Measurement preview chip */}
                        {selectedMeasurement?.values && (
                          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-stone-600">
                            {Object.entries(selectedMeasurement.values).map(([k, v]) => (
                              <span key={k} className="rounded-lg bg-white border border-stone-200 px-2 py-1 font-medium">
                                {k}: <strong>{v}cm</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Custom Notes */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                        {t('orderFlow.notes')}
                      </label>
                      <textarea
                        name="notes"
                        value={form.notes}
                        onChange={update}
                        maxLength={1000}
                        rows={3}
                        placeholder={t('orderFlow.notesPlaceholder')}
                        className="mt-1.5 w-full resize-y rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-[#8f2338] focus:outline-none focus:ring-1 focus:ring-[#8f2338]"
                      />
                    </div>

                    {/* Estimated Total Bar */}
                    <div className="flex items-center justify-between rounded-2xl bg-stone-50 border border-stone-100 p-4">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                        <Clock3 size={15} className="text-[#8f2338]" />
                        {selectedService?.days
                          ? `${selectedService.days} ${t('tailorView.days')}`
                          : t('orderFlow.estimateTimeline')}
                      </span>
                      <div className="text-right">
                        <span className="block text-[11px] text-stone-400 uppercase font-semibold">
                          {t('orderFlow.totalEstimate')}
                        </span>
                        <span className="text-base font-black text-[#8f2338]">
                          {total === null ? t('orderFlow.quoteAfterReview') : money(total)}
                        </span>
                      </div>
                    </div>

                    {/* Submit / Proceed to Review Button */}
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#8f2338] px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#781c2e] active:scale-[0.99]"
                    >
                      {t('orderFlow.reviewOrder')}
                    </button>
                  </form>
                ) : (
                  /* STEP 2: REVIEW & CONFIRM DETAILS */
                  <div className="mt-6 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-stone-950">
                        {t('orderFlow.reviewTitle')}
                      </h3>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {t('orderFlow.reviewHelp')}
                      </p>
                    </div>

                    {/* Breakdown Card */}
                    <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-stone-50/50">
                      <div className="flex items-center justify-between p-3.5 text-sm">
                        <div>
                          <p className="font-bold text-stone-900">
                            {form.quantity} × {selectedService?.name || form.garment}
                          </p>
                          <p className="text-xs text-stone-500">{tailor.name}</p>
                        </div>
                        <p className="text-sm font-black text-[#8f2338]">
                          {total === null ? t('orderFlow.quoteAfterReview') : money(total)}
                        </p>
                      </div>

                      {form.color && (
                        <ReviewRow label={t('orderFlow.color')} value={form.color} />
                      )}
                      {form.fabric && (
                        <ReviewRow label={t('orderFlow.fabric')} value={form.fabric} />
                      )}
                      <ReviewRow
                        label={t('orderFlow.deadline')}
                        value={form.deadline === 'Flexible' ? t('orderFlow.flexible') : form.deadline}
                      />
                      <ReviewRow
                        label={t('orderFlow.measurements')}
                        value={
                          form.measurementMode === 'profile'
                            ? selectedMeasurement
                              ? `${selectedMeasurement.name} (${selectedMeasurement.garment})`
                              : t('orderFlow.chooseMeasurement')
                            : t('orderFlow.measureInPerson')
                        }
                      />
                      {form.notes && (
                        <ReviewRow label={t('orderFlow.notes')} value={form.notes} />
                      )}
                    </div>

                    {/* Upfront notice */}
                    <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs leading-relaxed text-amber-950">
                      <Info size={16} className="mt-0.5 shrink-0 text-amber-700" />
                      <span>{t('orderFlow.quoteNotice')}</span>
                    </div>

                    {/* Auth Status Check Notice */}
                    {!isSignedIn && (
                      <p className="text-xs text-stone-600 bg-stone-100 rounded-xl p-3 text-center">
                        {t('orderFlow.getStartedToPlace', 'Get started to place your custom order.')}
                      </p>
                    )}
                    {isSignedIn && profile && !canOrder && (
                      <p className="text-xs text-[#8f2338] bg-rose-50 rounded-xl p-3 font-semibold text-center">
                        {t('orderFlow.customerOnly')}
                      </p>
                    )}

                    {/* Button Group */}
                    <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setStep('details')}
                        disabled={busy}
                        className="flex-1 rounded-2xl border border-stone-300 bg-white px-4 py-3 text-xs font-bold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
                      >
                        {t('orderFlow.editDetails')}
                      </button>

                      <button
                        type="button"
                        onClick={placeOrder}
                        disabled={busy || (isSignedIn && !canOrder) || (isSignedIn && !profile)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#8f2338] px-4 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#781c2e] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy ? (
                          t('orderFlow.placing')
                        ) : !isSignedIn ? (
                          t('orderFlow.getStartedAndPlace', 'Get Started & Place Order')
                        ) : (
                          <>
                            {t('orderFlow.placeOrder')}
                            <Check size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3.5 text-xs">
      <span className="font-medium text-stone-500">{label}</span>
      <span className="max-w-[65%] text-right font-semibold text-stone-900">{value}</span>
    </div>
  );
}
