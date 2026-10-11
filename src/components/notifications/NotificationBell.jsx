import React, { useRef } from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = ({ mobile = false }) => {
  const { t } = useTranslation();
  const { unreadCount, isOpen, toggleOpen } = useNotifications();
  const triggerRef = useRef(null);

  return (
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleOpen();
        }}
        className={`group relative flex items-center justify-center rounded-xl border border-stone-200 text-stone-700 transition cursor-pointer active:scale-95 ${
          isOpen
            ? 'bg-stone-100 border-stone-300 text-stone-900'
            : 'hover:bg-stone-100 hover:border-stone-300 hover:text-stone-900'
        } ${mobile ? 'h-9 w-9' : 'h-9 w-9 sm:h-10 sm:w-10'}`}
        aria-label={t('navbar.notifications', 'Notifications')}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell
          size={mobile ? 17 : 18}
          className={`transition-transform duration-200 group-hover:scale-110 ${
            unreadCount > 0 ? 'text-[#8f2338]' : 'text-stone-700'
          }`}
        />

        {/* Live Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#8f2338] px-1 text-[10px] font-bold text-white shadow-xs ring-2 ring-white">
            <span className="absolute -inset-0.5 rounded-full bg-[#8f2338] opacity-35 animate-ping" />
            <span className="relative">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <NotificationDropdown
          triggerRef={triggerRef}
          onClose={() => toggleOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
