import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Store,
  Layers,
  Megaphone,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  Shield,
  Building2,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getRoleMeta } from '../../Navbar/RoleAvatarWithBadge';

export default function AdminSidebar({
  currentTab,
  onTabChange,
  badgeCounts = {},
  isCollapsed,
  onToggleCollapse,
  adminUser = {},
  onSignOut,
  mobileOpen,
  onMobileClose,
}) {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const navGroups = [
    {
      group: isHi ? 'सिंहावलोकन' : 'OVERVIEW',
      items: [
        {
          id: 'dashboard',
          label: isHi ? 'डैशबोर्ड' : 'Dashboard',
          icon: LayoutDashboard,
          count: null,
          tooltip: 'System overview & executive metrics',
        },
      ],
    },
    {
      group: isHi ? 'प्लेटफ़ॉर्म प्रबंधन' : 'PLATFORM MANAGEMENT',
      items: [
        {
          id: 'verifications',
          label: isHi ? 'सत्यापन' : 'Verifications',
          icon: ShieldCheck,
          count: badgeCounts.pendingVerifications,
          countColor: 'bg-rose-500 text-white',
          tooltip: 'Atelier & GSTIN verification requests',
        },
        {
          id: 'users',
          label: isHi ? 'उपयोगकर्ता व भूमिकाएं' : 'Users & Roles',
          icon: Users,
          count: badgeCounts.totalUsers,
          countColor: 'bg-stone-200 text-stone-700',
          tooltip: 'Customer, artisan & corporate directory',
        },
        {
          id: 'tailors',
          label: isHi ? 'टेलर स्टूडियो' : 'Tailor Studios',
          icon: Store,
          count: badgeCounts.totalTailors,
          countColor: 'bg-stone-200 text-stone-700',
          tooltip: 'Bespoke boutique directory & geospatial coverage',
        },
        {
          id: 'bulk',
          label: isHi ? 'थोक मांग व RFQ' : 'Bulk Orders & RFQs',
          icon: Layers,
          count: badgeCounts.openRfqs ?? badgeCounts.totalBulk,
          countColor: 'bg-amber-500 text-white',
          tooltip: 'Institutional apparel tenders & quotations',
        },
      ],
    },
    {
      group: isHi ? 'संचार' : 'COMMUNICATION',
      items: [
        {
          id: 'announcements',
          label: isHi ? 'घोषणाएं' : 'Announcements',
          icon: Megaphone,
          count: null,
          tooltip: 'Platform-wide notifications & alerts broadcaster',
        },
      ],
    },
    {
      group: isHi ? 'सिस्टम' : 'SYSTEM',
      items: [
        {
          id: 'settings',
          label: isHi ? 'प्रशासन सेटिंग्स' : 'Admin Settings',
          icon: Settings,
          count: null,
          tooltip: 'Profile, security protocols, API & platform preferences',
        },
      ],
    },
  ];

  const adminName = adminUser.name || 'Administrator';
  const adminEmail = adminUser.email || 'admin@meratailor.in';
  const adminRoleMeta = getRoleMeta('admin');
  const avatarSrc = adminUser.avatar || adminUser.imageUrl || adminRoleMeta.defaultAvatar;

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto overflow-x-hidden p-3 scrollbar-thin">
      <div>
        {/* Top Branding Section */}
        <div className={`flex items-center gap-3 px-2 py-3 border-b border-stone-200/80 ${isCollapsed ? 'justify-center' : ''}`}>
          <Link
            to="/"
            title="Return to MeraTailor main site"
            className="flex items-center gap-2.5 transition active:scale-95 group shrink-0"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#fff7fb] border border-rose-100 shadow-2xs group-hover:scale-105 transition">
              <img
                src="/logo.png"
                alt="MeraTailor"
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <span className="font-serif font-black text-sm tracking-tight text-stone-900 block">
                  मेरा&nbsp;<span className="text-[#8f2338]">Tailor</span>
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8f2338] bg-rose-50 px-1.5 py-0.2 rounded-md border border-rose-200/60 inline-block mt-0.5">
                  Admin Console
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Administrator Identity Badge */}
        {!isCollapsed ? (
          <div className="my-3.5 mx-1 p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={avatarSrc}
                  alt={adminName}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-500"
                  onError={(e) => {
                    e.currentTarget.src = adminRoleMeta.defaultAvatar;
                  }}
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" title="Active Admin Session" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-900 truncate block leading-tight">
                    {adminName}
                  </span>
                  <span className="shrink-0 text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                    Admin
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 truncate block font-mono">
                  {adminEmail}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="my-3 flex justify-center" title={`${adminName} (${adminEmail})`}>
            <div className="relative">
              <img
                src={avatarSrc}
                alt={adminName}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500"
                onError={(e) => {
                  e.currentTarget.src = adminRoleMeta.defaultAvatar;
                }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
          </div>
        )}

        {/* Navigation Group Items */}
        <nav className="mt-2 space-y-4">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              {!isCollapsed && (
                <span className="px-2.5 text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-1">
                  {group.group}
                </span>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    title={isCollapsed ? `${item.label} — ${item.tooltip}` : undefined}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-[#8f2338] text-white shadow-xs'
                        : 'text-stone-600 hover:bg-stone-100/90 hover:text-stone-950'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon
                      size={18}
                      className={`shrink-0 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-white' : 'text-stone-500 group-hover:text-stone-900'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}

                    {!isCollapsed && item.count !== undefined && item.count !== null && item.count > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : item.countColor || 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}

                    {/* Collapsed dot badge */}
                    {isCollapsed && item.count !== undefined && item.count !== null && item.count > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#8f2338] ring-2 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="pt-3 border-t border-stone-200/80 space-y-1">
        {/* View Live Marketplace */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Open live customer store in new tab"
          className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <ExternalLink size={15} className="text-stone-400 group-hover:text-stone-700 shrink-0" />
          {!isCollapsed && <span className="truncate">View Live Marketplace</span>}
        </Link>

        {/* Sign Out Action */}
        <button
          type="button"
          onClick={onSignOut}
          title="Sign out of administrative console"
          className={`group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <LogOut size={15} className="text-rose-500 group-hover:text-rose-700 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:block pt-1">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar (Ctrl + B)' : 'Collapse sidebar (Ctrl + B)'}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-stone-200/80 bg-stone-50 py-1.5 text-[11px] font-bold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition cursor-pointer"
          >
            {isCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <>
                <ChevronLeft size={14} />
                <span>Collapse Navigation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-white border-r border-stone-200/90 z-30 transition-all duration-300 ease-in-out sticky top-0 h-screen ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onMobileClose}
        >
          <div
            className="relative h-full w-72 max-w-[85vw] bg-white shadow-2xl transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
