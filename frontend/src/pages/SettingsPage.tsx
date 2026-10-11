import React, { useState } from 'react';
import { User, Shield, Download, LogOut, Check, RefreshCw, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useExpenses } from '../context/ExpenseContext';
import { request, isDemoMode } from '../services/api';
import { Button, Card, CardHeader } from '../components/ui';
import type { User as UserType } from '../types';

type Section = 'profile' | 'security' | 'export';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { addNotification } = useNotifications();
  const { expenses, budgets } = useExpenses();

  const [section, setSection] = useState<Section>('profile');
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);

  const nav: { id: Section; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'export', label: 'Data export', icon: Download },
  ];

  const saveProfile = async () => {
    if (name.trim().length < 2) {
      addNotification('Invalid name', 'Name must be at least 2 characters.', 'WARNING');
      return;
    }
    setSaving(true);
    try {
      if (isDemoMode()) {
        updateUser({ name: name.trim(), email: email.trim() });
        addNotification('Profile updated', 'Saved locally in demo mode.', 'SUCCESS');
      } else {
        const updated = await request<UserType>('/users/profile', {
          method: 'PUT',
          body: JSON.stringify({ name: name.trim(), email: email.trim() }),
        });
        updateUser(updated);
        addNotification('Profile updated', 'Your account details were saved.', 'SUCCESS');
      }
    } catch {
      addNotification('Save failed', 'Could not update profile. Is the API running?', 'ALERT');
    } finally {
      setSaving(false);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ user, expenses, budgets }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartexpense-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification('Export ready', 'JSON archive downloaded from this session.', 'SUCCESS');
  };

  const exportCsv = () => {
    const headers = ['id', 'title', 'amount', 'category', 'date', 'paymentMethod', 'location'];
    const rows = expenses.map((e) =>
      [e.id, e.title, e.amount, e.category, e.expenseDate, e.paymentMethod ?? '', e.location ?? '']
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(','),
    );
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartexpense-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification('Export ready', `${expenses.length} transactions exported as CSV.`, 'SUCCESS');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">Account details, security facts, and local data export.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <nav className="md:w-52 shrink-0 space-y-1">
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                section === id
                  ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                  : 'text-zinc-400 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex-1 space-y-5 min-w-0">
          {section === 'profile' && (
            <Card className="space-y-4">
              <CardHeader title="Profile" subtitle="Updates name and email via PUT /api/v1/users/profile." />
              <label className="block text-xs font-semibold text-zinc-400">
                Name
                <input className="field-input mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="block text-xs font-semibold text-zinc-400">
                Email
                <input
                  type="email"
                  className="field-input mt-1.5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <p className="text-[11px] text-zinc-500">Role: {user?.role ?? '—'}</p>
              <Button onClick={() => void saveProfile()} loading={saving} size="sm">
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                Save profile
              </Button>
            </Card>
          )}

          {section === 'security' && (
            <Card className="space-y-4">
              <CardHeader
                title="Authentication"
                subtitle="What this API actually implements — not a placeholder toggle."
              />
              <ul className="space-y-3 text-xs text-zinc-300">
                <li className="flex gap-2">
                  <Lock size={14} className="text-teal-300 mt-0.5 shrink-0" />
                  JWT access tokens with refresh-token rotation (`/auth/refresh`).
                </li>
                <li className="flex gap-2">
                  <Lock size={14} className="text-teal-300 mt-0.5 shrink-0" />
                  BCrypt password hashing and lockout after 5 failed login attempts (15 minutes).
                </li>
                <li className="flex gap-2">
                  <Lock size={14} className="text-teal-300 mt-0.5 shrink-0" />
                  Idempotency-Key on writes and token-bucket rate limiting on the API.
                </li>
              </ul>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Authenticator-app TOTP (2FA) is not implemented. Password changes use the forgot/reset-token
                flow (`/auth/forgot-password`, `/auth/reset-password`), not an in-app password form.
              </p>
              <Button variant="danger" size="sm" onClick={logout}>
                <LogOut size={14} />
                Sign out
              </Button>
            </Card>
          )}

          {section === 'export' && (
            <Card className="space-y-4">
              <CardHeader
                title="Export this session"
                subtitle="Downloads the expenses and budgets currently loaded in the app."
              />
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" size="sm" onClick={exportCsv}>
                  Download CSV
                </Button>
                <Button variant="secondary" size="sm" onClick={exportJson}>
                  Download JSON
                </Button>
              </div>
              <p className="text-[11px] text-zinc-500">
                {expenses.length} expenses · {budgets.length} budgets in memory.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
