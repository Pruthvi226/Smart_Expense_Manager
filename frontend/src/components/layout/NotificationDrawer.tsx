import React, { useEffect, useRef } from 'react';
import {
  X, Bell, CheckCheck, Trash2, BellOff,
  CheckCircle2, AlertTriangle, Info, AlertCircle
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import type { NotificationItem } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeConfig: Record<NotificationItem['type'], { icon: React.ElementType; color: string; bg: string; border: string }> = {
  SUCCESS:  { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  WARNING:  { icon: AlertTriangle, color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30'  },
  ALERT:    { icon: AlertCircle,  color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/30'   },
  INFO:     { icon: Info,         color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30'   },
};

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Trap focus inside drawer when open
  useEffect(() => {
    if (isOpen) drawerRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Notifications">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 w-full max-w-sm bg-[#121214] border-l border-white/10 shadow-2xl flex flex-col outline-none"
        style={{ animation: 'slideInRight 0.25s ease-out' }}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Notifications</h2>
              <p className="text-[11px] text-zinc-500">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            aria-label="Close notifications"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action bar */}
        {notifications.length > 0 && (
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 hover:text-rose-400 transition-colors"
            >
              <Trash2 size={13} />
              Clear all
            </button>
          </div>
        )}

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 mb-4">
                <BellOff size={32} className="text-zinc-600" />
              </div>
              <h3 className="text-sm font-bold text-zinc-300">No notifications</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">
                Budget alerts, AI insights, and system updates appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5" role="list">
              {notifications.map((n) => {
                const cfg = typeConfig[n.type] || typeConfig.INFO;
                const Icon = cfg.icon;
                return (
                  <li
                    key={n.id}
                    className={`p-4 flex items-start gap-3 hover:bg-white/[0.03] transition-colors ${!n.read ? 'bg-white/[0.01]' : ''}`}
                  >
                    {/* Status dot */}
                    <div className={`mt-1 p-2 rounded-xl ${cfg.bg} border ${cfg.border} flex-shrink-0`}>
                      <Icon size={14} className={cfg.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold ${n.read ? 'text-zinc-300' : 'text-white'}`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-1.5 font-mono">{n.timestamp}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <p className="text-[11px] text-zinc-600 text-center">
            Real-time alerts powered by Kafka event streams
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
