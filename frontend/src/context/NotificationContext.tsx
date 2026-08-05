import React, { createContext, useContext, useState } from 'react';
import type { NotificationItem } from '../types';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (title: string, message: string, type?: NotificationItem['type']) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  toast: NotificationItem | null;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
  toast: null,
});

const initialNotifications: NotificationItem[] = [
  { id: '1', title: 'Budget Limit Warning', message: 'Food & Dining has exceeded 100% of your allocated budget ($950 / $900).', type: 'WARNING', timestamp: '10 mins ago', read: false },
  { id: '2', title: 'Monthly Savings Goal Achieved', message: 'Congratulations! Your net cash flow reached $7,579.50 (+18.4% MoM).', type: 'SUCCESS', timestamp: '1 hour ago', read: false },
  { id: '3', title: 'AI Copilot Spending Insight', message: 'Recurring cloud subscription anomaly detected. View analysis in AI tab.', type: 'INFO', timestamp: '3 hours ago', read: true },
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [toast, setToast] = useState<NotificationItem | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (title: string, message: string, type: NotificationItem['type'] = 'INFO') => {
    const item: NotificationItem = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [item, ...prev]);
    setToast(item);
    setTimeout(() => setToast(null), 4000);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllAsRead, clearAll, toast }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#18181B] border border-white/10 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl animate-bounce-short">
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
