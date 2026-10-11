import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Megaphone,
  Send,
  Users,
  Store,
  Building2,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AdminAnnouncementBroadcaster = () => {
  const { t } = useTranslation();
  const { getToken } = useAuth();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('all'); // 'all' | 'customer' | 'tailor' | 'business'
  const [link, setLink] = useState('/dashboard');
  const [sending, setSending] = useState(false);
  const [lastBroadcast, setLastBroadcast] = useState(null);

  const targetRoles = [
    { id: 'all', label: 'All Users', icon: Globe, desc: 'Every registered account on MeraTailor' },
    { id: 'customer', label: 'Customers', icon: Users, desc: 'Individual clients & shoppers' },
    { id: 'tailor', label: 'Tailors', icon: Store, desc: 'Artisans & boutique studios' },
    { id: 'business', label: 'Businesses', icon: Building2, desc: 'Corporate & bulk apparel buyers' },
  ];

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Please enter both announcement title and message.');
      return;
    }

    try {
      setSending(true);
      const token = await getToken();
      const res = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          targetRole,
          link: link.trim() || '/dashboard',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch broadcast');
      }

      toast.success(
        `Announcement successfully broadcast to ${data.sentCount} recipient(s)!`
      );
      setLastBroadcast({
        title: title.trim(),
        message: message.trim(),
        targetRole,
        sentCount: data.sentCount,
        timestamp: new Date(),
      });

      // Reset form
      setTitle('');
      setMessage('');
    } catch (err) {
      toast.error(err.message || 'Error broadcasting announcement.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#8f2338] via-stone-900 to-stone-900 p-6 text-white shadow-xl sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide backdrop-blur-md">
            <Sparkles size={14} className="text-amber-300" />
            <span>PLATFORM BROADCASTER</span>
          </div>
          <h2 className="mt-3 font-serif text-2xl font-bold sm:text-3xl">
            System & Event Announcements
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-stone-300 sm:text-sm">
            Dispatch announcements, maintenance alerts, or festive greetings directly into users'
            notification drawers across mobile and desktop.
          </p>
        </div>
        <Megaphone
          size={180}
          className="pointer-events-none absolute -bottom-8 -right-6 text-white/5"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Form Column */}
        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-sm lg:col-span-7">
          <form onSubmit={handleBroadcast} className="space-y-5">
            {/* Target Role Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Target Audience
              </label>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {targetRoles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = targetRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setTargetRole(role.id)}
                      className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition cursor-pointer ${
                        isSelected
                          ? 'border-[#8f2338] bg-rose-50/50 text-[#8f2338] shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <Icon size={18} className="mb-1.5" />
                      <span className="text-xs font-bold">{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Announcement Title */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Announcement Title
                </label>
                <span className="text-[11px] text-stone-400">{title.length}/140</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 140))}
                placeholder="e.g., Seasonal Atelier Festival & Order Promotions"
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8f2338] focus:ring-1 focus:ring-[#8f2338] focus:outline-hidden"
                required
              />
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Message Content
                </label>
                <span className="text-[11px] text-stone-400">{message.length}/600</span>
              </div>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 600))}
                placeholder="Compose announcement body clearly. This will be stored persistently in recipients' notification drawers."
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8f2338] focus:ring-1 focus:ring-[#8f2338] focus:outline-hidden"
                required
              />
            </div>

            {/* Action Link */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Target URL / Route (Optional)
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/dashboard or /orders or /bulk"
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8f2338] focus:ring-1 focus:ring-[#8f2338] focus:outline-hidden"
              />
              <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] text-stone-500">
                <span>Quick links:</span>
                {['/dashboard', '/orders', '/find-tailors', '/bulk'].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setLink(quick)}
                    className="font-medium text-[#8f2338] hover:underline cursor-pointer"
                  >
                    {quick}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={sending || !title.trim() || !message.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8f2338] px-5 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#781c2e] active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {sending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Broadcasting to accounts…</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Send Announcement</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-3xl border border-stone-200/90 bg-stone-50/60 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
              Live Preview in Notification Drawer
            </h3>

            {/* Preview Card */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-300 bg-amber-100/80 text-[#8f2338]">
                  <Megaphone size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                      {title.trim() || 'Announcement Title'}
                    </h4>
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#8f2338]" />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-stone-600 line-clamp-3">
                    {message.trim() ||
                      'Announcement text will render here with full typography formatting and read/unread indicators.'}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-stone-400">Just now</span>
                    <span className="inline-flex items-center gap-0.5 font-bold text-[#8f2338]">
                      <span>Open Link</span>
                      <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-stone-400 leading-relaxed">
              When clicked, the notification marks as read and navigates directly to the specified
              link: <span className="font-mono text-stone-600">{link || '/dashboard'}</span>.
            </p>
          </div>

          {/* Last Broadcast Card */}
          {lastBroadcast && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                <span>Last Broadcast Successful</span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-800">
                Dispatched to <span className="font-bold">{lastBroadcast.sentCount}</span> account(s)
                under target <span className="font-bold capitalize">{lastBroadcast.targetRole}</span>.
              </p>
              <p className="mt-0.5 text-[10px] text-emerald-700">
                "{lastBroadcast.title}" · {lastBroadcast.timestamp.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncementBroadcaster;
