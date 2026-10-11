import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  ShoppingBag,
  Receipt,
  Clock,
  Briefcase,
  Ruler,
  User,
  Megaphone,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

// Helper for relative timestamps
function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// Icon selector based on notification type
function getNotificationIcon(type) {
  switch (type) {
    case 'order':
      return <ShoppingBag className="text-amber-700" size={17} />;
    case 'quote':
      return <Receipt className="text-emerald-700" size={17} />;
    case 'status':
      return <Clock className="text-blue-700" size={17} />;
    case 'bid':
      return <Briefcase className="text-purple-700" size={17} />;
    case 'measurement':
      return <Ruler className="text-rose-700" size={17} />;
    case 'profile':
      return <User className="text-teal-700" size={17} />;
    case 'announcement':
      return <Megaphone className="text-[#8f2338]" size={17} />;
    default:
      return <Bell className="text-stone-700" size={17} />;
  }
}

function getNotificationBg(type) {
  switch (type) {
    case 'order':
      return 'bg-amber-100/80 border-amber-200';
    case 'quote':
      return 'bg-emerald-100/80 border-emerald-200';
    case 'status':
      return 'bg-blue-100/80 border-blue-200';
    case 'bid':
      return 'bg-purple-100/80 border-purple-200';
    case 'measurement':
      return 'bg-rose-100/80 border-rose-200';
    case 'profile':
      return 'bg-teal-100/80 border-teal-200';
    case 'announcement':
      return 'bg-amber-100/80 border-amber-300';
    default:
      return 'bg-stone-100 border-stone-200';
  }
}

const NotificationDropdown = ({ onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    hasMore,
    filter,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    setFilter,
    loadMore,
    fetchNotifications,
  } = useNotifications();

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      onClose();
      navigate(notification.link);
    }
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    setConfirmClearOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-x-3 top-20 z-[90] max-h-[85vh] overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-2xl transition-all sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[440px]"
      role="dialog"
      aria-label={t('navbar.notifications', 'Notifications')}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/80 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-base font-bold text-stone-900 sm:text-lg">
            {t('navbar.notifications', 'Notifications')}
          </h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-[#8f2338] px-2 py-0.5 text-xs font-bold text-white shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount} {t('notifications.new', 'new')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <>
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                  unreadCount > 0
                    ? 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900 active:scale-95'
                    : 'text-stone-400 cursor-not-allowed opacity-60'
                }`}
                title={t('navbar.markAllRead', 'Mark all as read')}
              >
                <CheckCheck size={14} />
                <span className="hidden sm:inline">{t('navbar.markAllRead', 'Mark all read')}</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-stone-500 transition hover:bg-stone-200/70 hover:text-rose-700 active:scale-95 cursor-pointer"
                title={t('navbar.clearAll', 'Clear all')}
              >
                <Trash2 size={13} />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-200 hover:text-stone-700 cursor-pointer"
            aria-label="Close notifications"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* =====================================================
          CONFIRM CLEAR DIALOG OVERLAY
      ====================================================== */}
      {confirmClearOpen && (
        <div className="border-b border-rose-100 bg-rose-50/90 px-4 py-3 text-xs text-rose-950 sm:px-5">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle size={15} className="text-rose-700 shrink-0" />
            <span>{t('notifications.confirmClear', 'Clear all notifications permanently?')}</span>
          </div>
          <div className="mt-2.5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmClearOpen(false)}
              className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 font-medium text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-lg bg-rose-700 px-3 py-1 font-semibold text-white hover:bg-rose-800 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          FILTER TABS
      ====================================================== */}
      <div className="flex border-b border-stone-100 bg-white px-4 py-1.5 sm:px-5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
              filter === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
              filter === 'unread'
                ? 'bg-[#8f2338] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  filter === 'unread' ? 'bg-white/30 text-white' : 'bg-stone-200 text-stone-800'
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          NOTIFICATION LIST CONTENT
      ====================================================== */}
      <div className="max-h-[60vh] divide-y divide-stone-100 overflow-y-auto sm:max-h-[460px]">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-stone-400">
            <Loader2 className="animate-spin text-[#8f2338]" size={28} />
            <span className="mt-3 text-xs font-medium text-stone-500">
              {t('notifications.loading', 'Loading updates…')}
            </span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="p-6 text-center">
            <AlertCircle size={28} className="mx-auto text-rose-600" />
            <p className="mt-2 text-xs font-medium text-rose-900">{error}</p>
            <button
              type="button"
              onClick={() => fetchNotifications(1, false)}
              className="mt-3 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 shadow-inner">
              <CheckCircle2 size={26} className="text-stone-400" />
            </div>
            <p className="mt-4 font-serif text-sm font-bold text-stone-800">
              {filter === 'unread'
                ? t('notifications.allCaughtUp', 'All caught up!')
                : t('navbar.noNotifications', 'No notifications yet')}
            </p>
            <p className="mt-1 text-xs text-stone-500 max-w-xs">
              {filter === 'unread'
                ? 'You have read all current alerts. Check the All tab for past updates.'
                : 'Order requests, status changes, tailor quotes, and announcements will appear here.'}
            </p>
          </div>
        )}

        {/* Notification items */}
        {!loading &&
          !error &&
          notifications.map((notification) => {
            const isUnread = !notification.read;
            return (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer sm:px-4 sm:py-3.5 ${
                  isUnread
                    ? 'bg-amber-50/40 hover:bg-amber-100/50'
                    : 'bg-white hover:bg-stone-50/90'
                }`}
              >
                {/* Type Icon Badge */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-2xs ${getNotificationBg(
                    notification.type
                  )}`}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 pr-6">
                  <div className="flex items-center gap-1.5">
                    <h3
                      className={`text-xs font-semibold leading-snug line-clamp-1 ${
                        isUnread ? 'text-stone-900 font-bold' : 'text-stone-700'
                      }`}
                    >
                      {notification.title}
                    </h3>
                    {isUnread && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#8f2338]" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-stone-600 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[11px] font-medium text-stone-400">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                    {notification.link && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#8f2338] hover:underline">
                        <span>View</span>
                        <ArrowRight size={10} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Individual Delete Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification._id);
                  }}
                  className="absolute right-3 top-3.5 flex h-6 w-6 items-center justify-center rounded-md text-stone-400 opacity-0 transition hover:bg-stone-200/80 hover:text-rose-700 group-hover:opacity-100 cursor-pointer"
                  title="Delete notification"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
      </div>

      {/* =====================================================
          FOOTER / PAGINATION
      ====================================================== */}
      {hasMore && !loading && (
        <div className="border-t border-stone-100 bg-stone-50/80 p-2 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-200/80 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 size={13} className="animate-spin text-[#8f2338]" />
                <span>Loading more…</span>
              </>
            ) : (
              <span>Load older notifications</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
