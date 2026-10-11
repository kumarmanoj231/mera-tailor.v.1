import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isSignedIn, getToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const lastUnreadRef = useRef(0);
  const pollTimerRef = useRef(null);

  // Authenticated fetch wrapper
  const authFetch = useCallback(
    async (url, options = {}) => {
      const token = await getToken();
      if (!token) throw new Error('Authentication required.');
      return fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });
    },
    [getToken]
  );

  // Fast unread count fetch
  const fetchUnreadCount = useCallback(async () => {
    if (!isSignedIn) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await authFetch('/api/notifications/unread-count');
      if (!res.ok) return;
      const data = await res.json();
      const count = Number(data.unreadCount) || 0;
      setUnreadCount(count);
      lastUnreadRef.current = count;
    } catch {
      // Non-blocking silent fail for background polling
    }
  }, [isSignedIn, authFetch]);

  // Load notifications with pagination & filtering
  const fetchNotifications = useCallback(
    async (pageToFetch = 1, append = false, currentFilter = filter) => {
      if (!isSignedIn) return;
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        const res = await authFetch(
          `/api/notifications?page=${pageToFetch}&limit=15&filter=${currentFilter}`
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to load notifications');
        }

        const data = await res.json();
        const incoming = Array.isArray(data.notifications) ? data.notifications : [];
        const pagination = data.pagination || {};

        setNotifications((prev) => (append ? [...prev, ...incoming] : incoming));
        setPage(pagination.page || pageToFetch);
        setHasMore(Boolean(pagination.hasMore));
        setUnreadCount(pagination.unreadCount ?? 0);
        lastUnreadRef.current = pagination.unreadCount ?? 0;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [isSignedIn, authFetch, filter]
  );

  // Mark single notification as read
  const markAsRead = useCallback(
    async (id) => {
      if (!id || !isSignedIn) return;
      // Optimistic UI update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        const res = await authFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
        if (res.ok) {
          const data = await res.json();
          if (data.unreadCount !== undefined) {
            setUnreadCount(data.unreadCount);
          }
        }
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    },
    [isSignedIn, authFetch]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!isSignedIn) return;
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      const res = await authFetch('/api/notifications/mark-all-read', { method: 'POST' });
      if (res.ok) {
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [isSignedIn, authFetch]);

  // Delete single notification
  const deleteNotification = useCallback(
    async (id) => {
      if (!id || !isSignedIn) return;
      // Optimistic removal
      const target = notifications.find((n) => n._id === id);
      const wasUnread = target && !target.read;

      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        const res = await authFetch(`/api/notifications/${id}`, { method: 'DELETE' });
        if (res.ok) {
          const data = await res.json();
          if (data.unreadCount !== undefined) {
            setUnreadCount(data.unreadCount);
          }
        }
      } catch (err) {
        console.error('Error deleting notification:', err);
        // Refresh on error
        fetchNotifications(1, false);
      }
    },
    [isSignedIn, authFetch, notifications, fetchNotifications]
  );

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    if (!isSignedIn) return;
    setNotifications([]);
    setUnreadCount(0);

    try {
      await authFetch('/api/notifications/clear-all', { method: 'DELETE' });
    } catch (err) {
      console.error('Error clearing all notifications:', err);
      fetchNotifications(1, false);
    }
  }, [isSignedIn, authFetch, fetchNotifications]);

  // Filter change handler
  const handleFilterChange = useCallback(
    (newFilter) => {
      setFilter(newFilter);
      fetchNotifications(1, false, newFilter);
    },
    [fetchNotifications]
  );

  // Load next page
  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    fetchNotifications(page + 1, true, filter);
  }, [hasMore, loadingMore, page, filter, fetchNotifications]);

  // Toggle open / close
  const toggleOpen = useCallback((explicitState) => {
    setIsOpen((prev) => (typeof explicitState === 'boolean' ? explicitState : !prev));
  }, []);

  // Sync when dropdown opens
  useEffect(() => {
    if (isOpen && isSignedIn) {
      fetchNotifications(1, false, filter);
    }
  }, [isOpen, isSignedIn, fetchNotifications, filter]);

  // Initial unread count & periodic 30-sec polling when signed in
  useEffect(() => {
    if (!isSignedIn) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchUnreadCount();

    const startPolling = () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchUnreadCount();
        }
      }, 30000);
    };

    startPolling();

    // Re-fetch immediately when user returns to the browser tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
        if (isOpen) {
          fetchNotifications(1, false);
        }
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [isSignedIn, fetchUnreadCount, fetchNotifications, isOpen]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        loadingMore,
        hasMore,
        filter,
        error,
        isOpen,
        toggleOpen,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        setFilter: handleFilterChange,
        loadMore,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
