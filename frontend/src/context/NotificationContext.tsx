import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { NotificationItem } from '../types';
import { isDemoMode, request } from '../services/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (title: string, message: string, type?: NotificationItem['type']) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  toast: NotificationItem | null;
  loadError: string;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
  toast: null,
  loadError: '',
  refreshNotifications: async () => {},
});

const initialNotifications: NotificationItem[] = [
  { id: '1', title: 'Budget Limit Warning', message: 'Food & Dining has exceeded 100% of your allocated budget ($950 / $900).', type: 'WARNING', timestamp: '10 mins ago', read: false },
  { id: '2', title: 'Monthly Savings Goal Achieved', message: 'Congratulations! Your net cash flow reached $7,579.50 (+18.4% MoM).', type: 'SUCCESS', timestamp: '1 hour ago', read: false },
  { id: '3', title: 'AI Copilot Spending Insight', message: 'Recurring cloud subscription anomaly detected. View analysis in AI tab.', type: 'INFO', timestamp: '3 hours ago', read: true },
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => isDemoMode() ? initialNotifications : []);
  const [toast, setToast] = useState<NotificationItem | null>(null);
  const [loadError, setLoadError] = useState('');
  const { isAuthenticated } = useAuth();
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshNotifications = useCallback(async () => {
    if (isDemoMode() || !isAuthenticated) return;
    try {
      const data = await request<{ content: { id: number; title: string; message: string; type: string; isRead: boolean; createdAt: string }[] }>('/notifications?size=50');
      const loaded: NotificationItem[] = data.content.map(n => ({
        id: `server:${n.id}`, title: n.title, message: n.message,
        type: n.type === 'BUDGET_ALERT' ? 'WARNING' : n.type === 'LARGE_EXPENSE' ? 'ALERT' : 'INFO',
        timestamp: new Date(n.createdAt).toLocaleString(), read: n.isRead,
      }));
      setNotifications(previous => [...previous.filter(n => n.id.startsWith('local:')), ...loaded]);
      setLoadError('');
    } catch {
      setLoadError('Unable to load notifications. Please try again.');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshNotifications();
    const poll = setInterval(() => { void refreshNotifications(); }, 60000);
    return () => { clearInterval(poll); if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, [refreshNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (title: string, message: string, type: NotificationItem['type'] = 'INFO') => {
    const item: NotificationItem = {
      id: `local:${crypto.randomUUID()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [item, ...prev]);
    setToast(item);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    const results = await Promise.allSettled(unread.map(async n => {
      if (n.id.startsWith('server:')) await request(`/notifications/${n.id.slice(7)}/read`, { method: 'PATCH' });
      return n.id;
    }));
    const marked = new Set(results.flatMap(r => r.status === 'fulfilled' ? [r.value] : []));
    setNotifications(prev => prev.map(n => marked.has(n.id) ? { ...n, read: true } : n));
    if (results.some(r => r.status === 'rejected')) setLoadError('Some notifications could not be marked read. Please try again.');
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllAsRead, clearAll, toast, loadError, refreshNotifications }}>
      {children}
      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 left-6 sm:left-auto z-50 flex items-center gap-3 bg-[#18181B] border border-white/10 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl animate-bounce-short">
          <div className={`w-3 h-3 rounded-full ${toast.type === 'SUCCESS' ? 'bg-emerald-500' : toast.type === 'WARNING' ? 'bg-amber-500' : toast.type === 'ALERT' ? 'bg-rose-500' : 'bg-cyan-500'}`} />
          <div>
            <h4 className="text-sm font-semibold">{toast.title}</h4>
            <p className="text-xs text-zinc-400">{toast.message}</p>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
