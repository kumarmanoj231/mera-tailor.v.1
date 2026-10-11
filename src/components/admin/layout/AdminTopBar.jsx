import React from 'react';
import { Menu, Bell, RefreshCw, ExternalLink, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../../Navbar/LanguageToggle';

export default function AdminTopBar({
  title = 'Admin Console',
  subtitle = 'Master atelier, user management & system oversight',
  onMobileMenuToggle,
  onRefresh,
  refreshing = false,
  notificationsCount = 0,
  onNotificationsToggle,
  notificationsOpen = false,
  notificationPopover = null,
}) {
  const { i18n } = useTranslation();

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between border-b border-stone-200/90 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile hamburger & Active Tab Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 lg:hidden cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-extrabold text-stone-900 leading-tight">
            {title}
          </h1>
          <p className="hidden sm:block text-[11px] text-stone-500 truncate max-w-md">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Refresh, Language, Notifications */}
      <div className="flex items-center gap-2">
        {/* Real-time Refresh Action */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh real-time data from database"
          className="flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 text-xs font-bold text-stone-700 hover:bg-stone-50 hover:text-stone-950 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#8f2338]' : ''} />
          <span className="hidden md:inline">{refreshing ? 'Syncing...' : 'Refresh'}</span>
        </button>

        {/* Language Switcher */}
        <div className="hidden sm:block">
          <LanguageToggle language={i18n.language} onChange={(lang) => i18n.changeLanguage(lang)} />
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={onNotificationsToggle}
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition cursor-pointer ${
              notificationsOpen
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
            }`}
            title="Administrator notifications & alerts"
          >
            <Bell size={15} />
            {notificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#8f2338] px-1 text-[9px] font-black text-white ring-2 ring-white">
                {notificationsCount}
              </span>
            )}
          </button>

          {notificationsOpen && notificationPopover}
        </div>
      </div>
    </header>
  );
}
