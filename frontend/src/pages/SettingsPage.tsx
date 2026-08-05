import React, { useState, useRef } from 'react';
import {
  User, Shield, Palette, Bell, Settings, Monitor,
  Key, Lock, Download, Trash2, LogOut, Eye, EyeOff,
  Check, Copy, RefreshCw, Globe, Clock,
  Smartphone, AlertTriangle, CheckCircle2, Plus, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useExpenses } from '../context/ExpenseContext';

// ── Types ─────────────────────────────────────────────────────────────────────
type SettingsSection =
  | 'profile' | 'security' | 'appearance' | 'notifications'
  | 'preferences' | 'sessions' | 'api-keys' | 'privacy'
  | 'data-export' | 'danger';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  requests: number;
}

interface ActiveSession {
  id: string;
  browser: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const INITIAL_KEYS: ApiKey[] = [
  { id: '1', name: 'Production API', key: 'sem_live_sk_••••••••••••••4a2f', created: 'Jul 14, 2026', lastUsed: '2 mins ago', requests: 18420 },
  { id: '2', name: 'Analytics Service', key: 'sem_live_sk_••••••••••••••9c1e', created: 'Jun 2, 2026', lastUsed: '1 hour ago', requests: 7243 },
];

const INITIAL_SESSIONS: ActiveSession[] = [
  { id: '1', browser: 'Chrome 125', os: 'Windows 11', location: 'Hyderabad, IN', ip: '49.37.18.242', lastActive: 'Active now', current: true },
  { id: '2', browser: 'Safari 17', os: 'iOS 17.5', location: 'Mumbai, IN', ip: '117.213.44.8', lastActive: '2 hours ago', current: false },
  { id: '3', browser: 'Firefox 126', os: 'macOS 14', location: 'Bangalore, IN', ip: '103.24.61.19', lastActive: 'Yesterday', current: false },
];

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Amber', value: '#F59E0B' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const rand = Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `sem_live_sk_${rand.slice(0, 12)}••••`;
}

// ── Sub-section Wrapper ───────────────────────────────────────────────────────
const SectionCard: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="p-6 rounded-3xl glass-card space-y-5">
    <div className="border-b border-white/8 pb-4">
      <h3 className="font-bold text-base text-white">{title}</h3>
      {description && <p className="text-xs text-zinc-400 mt-0.5">{description}</p>}
    </div>
    {children}
  </div>
);

// ── Field Wrapper ─────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-zinc-400">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-zinc-500">{hint}</p>}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors ${props.className || ''}`}
  />
);

const SaveButton: React.FC<{ saving: boolean; saved: boolean; onClick: () => void; label?: string }> = ({ saving, saved, onClick, label = 'Save Changes' }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-5 py-2.5 rounded-xl primary-gradient-bg text-white text-xs font-bold shadow-lg primary-gradient-glow hover:opacity-95 transition-all disabled:opacity-50"
    disabled={saving}
  >
    {saved ? <CheckCircle2 size={14} className="text-emerald-300" /> : saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
    {saved ? 'Saved!' : saving ? 'Saving…' : label}
  </button>
);

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative w-10 h-5 rounded-full transition-all ${value ? 'bg-indigo-600' : 'bg-zinc-700'}`}
  >
    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-5' : 'left-0.5'}`} />
  </button>
);

// ── Confirmation Dialog ───────────────────────────────────────────────────────
const ConfirmDialog: React.FC<{ title: string; message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }> = ({
  title, message, onConfirm, onCancel, danger
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="w-full max-w-sm glass-card rounded-3xl p-6 border border-white/10 space-y-5 shadow-2xl mx-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
          <AlertTriangle size={20} />
        </div>
        <h3 className="font-bold text-white">{title}</h3>
      </div>
      <p className="text-xs text-zinc-300 leading-relaxed">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-white/5 text-white text-xs font-semibold hover:bg-white/10 transition-all">Cancel</button>
        <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-all ${danger ? 'bg-rose-600 hover:bg-rose-500' : 'primary-gradient-bg primary-gradient-glow'}`}>Confirm</button>
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
  const { expenses, budgets, deleteExpense, deleteBudget } = useExpenses();

  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState<{ action: string; msg: string; danger?: boolean } | null>(null);

  // Profile
  const [profileName, setProfileName] = useState(user?.name || 'Pruthviraj');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'pruthviraj@smartexpense.com');
  const [profilePhone, setProfilePhone] = useState('+91 98765 43210');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [language, setLanguage] = useState('English');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Security
  const [showPassword, setShowPassword] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  // Appearance
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [accentColor, setAccentColor] = useState('#6366F1');
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [notifWeeklySummary, setNotifWeeklySummary] = useState(true);
  const [notifMonthlyReport, setNotifMonthlyReport] = useState(true);
  const [notifBudgetAlerts, setNotifBudgetAlerts] = useState(true);
  const [notifAiSuggestions, setNotifAiSuggestions] = useState(true);

  // Preferences
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [defaultCategory, setDefaultCategory] = useState('Food & Dining');
  const [weekStartsOn, setWeekStartsOn] = useState('Monday');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [numberFormat, setNumberFormat] = useState('1,234.56');

  // Privacy Settings State (Fixing React Hook inside map bug)
  const [privacySettings, setPrivacySettings] = useState({
    analytics: true,
    marketing: false,
    aiTraining: true,
    integrations: false,
  });

  // API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sessions
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addNotification('File Too Large', 'Please select an image smaller than 2 MB.', 'WARNING');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
        addNotification('Avatar Uploaded', 'Your profile picture has been updated.', 'SUCCESS');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (sectionName: string = 'Settings') => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      addNotification(`${sectionName} Saved`, 'Your settings have been saved successfully.', 'SUCCESS');
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  const handleUpdatePassword = () => {
    if (!currentPw) {
      addNotification('Password Required', 'Please enter your current password.', 'WARNING');
      return;
    }
    if (!newPw || newPw.length < 12) {
      addNotification('Weak Password', 'New password must be at least 12 characters long.', 'WARNING');
      return;
    }
    if (newPw !== confirmPw) {
      addNotification('Password Mismatch', 'New password and confirmation do not match.', 'ALERT');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      addNotification('Password Updated', 'Your security password has been changed successfully.', 'SUCCESS');
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const exportData = (format: 'CSV' | 'JSON' | 'PDF' | 'Excel') => {
    if (format === 'PDF') {
      window.print();
      return;
    }
    if (format === 'JSON') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ user, expenses, budgets }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `SmartExpense_Data_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addNotification('JSON Export Ready', 'Your full data archive has been downloaded.', 'SUCCESS');
      return;
    }
    if (format === 'CSV' || format === 'Excel') {
      const headers = ['ID', 'Title', 'Amount', 'Category', 'Date', 'Payment Method', 'Location'];
      const rows = expenses.map(e => [
        e.id, `"${e.title}"`, e.amount.toFixed(2), `"${e.category}"`, e.expenseDate, `"${e.paymentMethod || ''}"`, `"${e.location || ''}"`
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `SmartExpense_Transactions_${new Date().toISOString().split('T')[0]}.${format === 'Excel' ? 'csv' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addNotification(`${format} Export Ready`, `Transactions exported in ${format} format.`, 'SUCCESS');
    }
  };

  const generateNewKey = () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: generateApiKey(),
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastUsed: 'Never',
      requests: 0,
    };
    setApiKeys((prev) => [newKey, ...prev]);
    addNotification('API Key Generated', 'New key created. Copy it now — it won\'t be shown again.', 'INFO');
  };

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key).catch(() => {});
    setCopiedKey(id);
    addNotification('Copied to Clipboard', 'API key copied successfully.', 'INFO');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const deleteKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
    addNotification('API Key Revoked', 'The key has been permanently revoked.', 'WARNING');
  };

  const revokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    addNotification('Session Terminated', 'The selected session has been logged out.', 'SUCCESS');
  };

  const handleDangerConfirm = () => {
    if (!confirm) return;
    if (confirm.action === 'RESET_DATA') {
      expenses.forEach(e => deleteExpense(e.id));
      budgets.forEach(b => deleteBudget(b.id));
      addNotification('Data Reset', 'All transactions and budget caps have been cleared.', 'WARNING');
    } else if (confirm.action === 'EXPORT_DELETE') {
      exportData('JSON');
      expenses.forEach(e => deleteExpense(e.id));
      budgets.forEach(b => deleteBudget(b.id));
      addNotification('Account Reset & Exported', 'Your data was exported and cleared.', 'WARNING');
      setTimeout(() => logout(), 1500);
    } else if (confirm.action === 'DELETE_ACCOUNT') {
      expenses.forEach(e => deleteExpense(e.id));
      budgets.forEach(b => deleteBudget(b.id));
      addNotification('Account Deleted', 'Your account has been deleted.', 'ALERT');
      logout();
    }
    setConfirm(null);
  };

  const navItems: { id: SettingsSection; label: string; icon: React.FC<any>; danger?: boolean }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'sessions', label: 'Active Sessions', icon: Monitor },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'data-export', label: 'Data Export', icon: Download },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
  ];

  return (
    <div className="flex gap-8 animate-fade-in pb-12 min-h-screen">
      {/* ── Left Nav ─────────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0">
        <div className="sticky top-20 space-y-1">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-3 mb-3">Settings</h2>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                  activeSection === item.id
                    ? item.danger
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : item.danger
                    ? 'text-rose-400 hover:bg-rose-500/10'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Content Area ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* ── Profile ──────────────────────────────────────────────────── */}
        {activeSection === 'profile' && (
          <SectionCard title="Personal Information" description="Update your display name, email, and contact details.">
            {/* Avatar Upload */}
            <div className="flex items-center gap-5 pb-4 border-b border-white/8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profileName.charAt(0)
                )}
              </div>
              <div>
                <button onClick={() => fileRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 text-xs font-semibold text-zinc-300 border border-white/10 transition-all">
                  Upload Avatar
                </button>
                <p className="text-[10px] text-zinc-500 mt-1">JPG, PNG or GIF · Max 2 MB</p>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name">
                <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Full Name" />
              </Field>
              <Field label="Email Address">
                <Input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} placeholder="email@example.com" />
              </Field>
              <Field label="Phone Number">
                <Input type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="+91 00000 00000" />
              </Field>
              <Field label="Currency">
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors">
                  {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Timezone">
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500">
                  {['Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Australia/Sydney'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Language">
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500">
                  {['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese'].map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
            </div>
            <div className="flex justify-end pt-2">
              <SaveButton saving={saving} saved={saved} onClick={() => handleSave('Profile')} />
            </div>
          </SectionCard>
        )}

        {/* ── Security ─────────────────────────────────────────────────── */}
        {activeSection === 'security' && (
          <>
            <SectionCard title="Change Password" description="Use a strong password of at least 12 characters.">
              <div className="space-y-3 max-w-sm">
                <Field label="Current Password">
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••••••" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>
                <Field label="New Password">
                  <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min 12 characters" />
                  {/* Password strength indicator */}
                  {newPw && (
                    <div className="flex gap-1 mt-1">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${newPw.length >= i * 3 ? (newPw.length >= 12 ? 'bg-emerald-500' : newPw.length >= 8 ? 'bg-amber-500' : 'bg-rose-500') : 'bg-white/10'}`} />
                      ))}
                    </div>
                  )}
                </Field>
                <Field label="Confirm New Password">
                  <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
                  {confirmPw && newPw !== confirmPw && <p className="text-[10px] text-rose-400 mt-0.5">Passwords do not match</p>}
                </Field>
                <SaveButton saving={saving} saved={saved} onClick={handleUpdatePassword} label="Update Password" />
              </div>
            </SectionCard>

            <SectionCard title="Two-Factor Authentication" description="Add an extra layer of security to your account.">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{twoFAEnabled ? '2FA Enabled' : '2FA Disabled'}</p>
                  <p className="text-xs text-zinc-400">{twoFAEnabled ? 'Your account is protected with TOTP.' : 'Enable authenticator app-based 2FA.'}</p>
                </div>
                <Toggle value={twoFAEnabled} onChange={(v) => {
                  setTwoFAEnabled(v);
                  addNotification('2FA Status Changed', v ? 'Two-Factor Authentication enabled.' : 'Two-Factor Authentication disabled.', v ? 'SUCCESS' : 'WARNING');
                }} />
              </div>
              {twoFAEnabled && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  2FA is active. Recovery codes saved securely.
                </div>
              )}
            </SectionCard>

            <SectionCard title="Login History" description="Recent authentication events on your account.">
              <div className="space-y-2">
                {[
                  { event: 'Successful Login', browser: 'Chrome 125, Windows 11', time: '2 mins ago', success: true },
                  { event: 'Successful Login', browser: 'Safari 17, iOS 17', time: '3 hours ago', success: true },
                  { event: 'Failed Login Attempt', browser: 'Unknown Browser', time: 'Yesterday 11:42 PM', success: false },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/8 text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${log.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <div>
                        <p className="font-semibold text-white">{log.event}</p>
                        <p className="text-zinc-500">{log.browser}</p>
                      </div>
                    </div>
                    <span className="text-zinc-500">{log.time}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </>
        )}

        {/* ── Appearance ───────────────────────────────────────────────── */}
        {activeSection === 'appearance' && (
          <>
            <SectionCard title="Theme" description="Choose how SmartExpense looks on your device.">
              <div className="grid grid-cols-3 gap-3">
                {(['dark', 'light', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTheme(t);
                      addNotification('Theme Changed', `Theme updated to ${t} mode.`, 'INFO');
                    }}
                    className={`p-4 rounded-2xl border text-xs font-semibold capitalize transition-all space-y-2 ${
                      theme === t ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400' : 'bg-white/[0.03] border-white/8 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className={`h-12 rounded-xl ${t === 'dark' ? 'bg-zinc-900 border border-zinc-700' : t === 'light' ? 'bg-white border border-zinc-200' : 'bg-gradient-to-r from-zinc-900 to-white border border-zinc-400'}`} />
                    {t}
                    {theme === t && <Check size={12} className="mx-auto text-indigo-400" />}
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Accent Color" description="Pick the primary brand color for the interface.">
              <div className="flex flex-wrap gap-3">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setAccentColor(c.value);
                      addNotification('Accent Color Updated', `Primary color set to ${c.name}.`, 'INFO');
                    }}
                    className="flex flex-col items-center gap-1.5"
                    title={c.name}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl transition-all ${accentColor === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#09090B] scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c.value }}
                    />
                    <span className="text-[10px] text-zinc-400">{c.name}</span>
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Interface Preferences">
              <div className="space-y-4">
                {[
                  { label: 'Compact Mode', sub: 'Reduce padding and element size', value: compactMode, onChange: setCompactMode },
                  { label: 'Smooth Animations', sub: 'Enable micro-animation effects', value: animations, onChange: setAnimations },
                ].map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">{pref.label}</p>
                      <p className="text-[11px] text-zinc-500">{pref.sub}</p>
                    </div>
                    <Toggle value={pref.value} onChange={pref.onChange} />
                  </div>
                ))}
                <div className="py-2">
                  <p className="text-xs font-semibold text-white mb-2">Font Size</p>
                  <div className="flex gap-2">
                    {(['sm', 'md', 'lg'] as const).map((f) => (
                      <button key={f} onClick={() => setFontSize(f)} className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${fontSize === f ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/8 text-zinc-400 hover:text-white'}`}>
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <SaveButton saving={saving} saved={saved} onClick={() => handleSave('Appearance')} />
              </div>
            </SectionCard>
          </>
        )}

        {/* ── Notifications ────────────────────────────────────────────── */}
        {activeSection === 'notifications' && (
          <SectionCard title="Notification Preferences" description="Choose how and when SmartExpense notifies you.">
            <div className="space-y-1">
              {[
                { label: 'Email Notifications', sub: 'Receive alerts via email', value: notifEmail, onChange: setNotifEmail },
                { label: 'Push Notifications', sub: 'Browser push alerts', value: notifPush, onChange: setNotifPush },
                { label: 'SMS Alerts', sub: 'Critical alerts via SMS', value: notifSMS, onChange: setNotifSMS },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <p className="text-xs font-semibold text-white">{n.label}</p>
                    <p className="text-[11px] text-zinc-500">{n.sub}</p>
                  </div>
                  <Toggle value={n.value} onChange={n.onChange} />
                </div>
              ))}
            </div>

            <div className="pt-2 space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider pb-2">Alert Types</p>
              {[
                { label: 'Weekly Financial Summary', value: notifWeeklySummary, onChange: setNotifWeeklySummary },
                { label: 'Monthly Reports Ready', value: notifMonthlyReport, onChange: setNotifMonthlyReport },
                { label: 'Budget Threshold Alerts', value: notifBudgetAlerts, onChange: setNotifBudgetAlerts },
                { label: 'AI Copilot Suggestions', value: notifAiSuggestions, onChange: setNotifAiSuggestions },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between py-2.5 border-b border-white/5">
                  <span className="text-xs text-zinc-300">{n.label}</span>
                  <Toggle value={n.value} onChange={n.onChange} />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <SaveButton saving={saving} saved={saved} onClick={() => handleSave('Notification Settings')} />
            </div>
          </SectionCard>
        )}

        {/* ── Preferences ──────────────────────────────────────────────── */}
        {activeSection === 'preferences' && (
          <SectionCard title="Application Preferences" description="Customize your default behavior and display format.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Default Currency">
                <select value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500">
                  {['USD', 'EUR', 'GBP', 'INR', 'JPY'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Default Category">
                <select value={defaultCategory} onChange={(e) => setDefaultCategory(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500">
                  {['Food & Dining','Shopping','Transportation','Housing','Health','Entertainment'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Week Starts On">
                <select value={weekStartsOn} onChange={(e) => setWeekStartsOn(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500">
                  {['Monday','Sunday','Saturday'].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Date Format">
                <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500">
                  {['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD'].map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Number Format">
                <select value={numberFormat} onChange={(e) => setNumberFormat(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500">
                  {['1,234.56','1.234,56','1 234,56'].map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
            </div>
            <div className="flex justify-end">
              <SaveButton saving={saving} saved={saved} onClick={() => handleSave('Preferences')} />
            </div>
          </SectionCard>
        )}

        {/* ── Active Sessions ──────────────────────────────────────────── */}
        {activeSection === 'sessions' && (
          <SectionCard title="Active Sessions" description="Devices currently logged into your account.">
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/8 hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${s.current ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/8 text-zinc-400'}`}>
                      {s.browser.includes('Chrome') ? <Globe size={18} /> : s.browser.includes('Safari') ? <Smartphone size={18} /> : <Monitor size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-white">{s.browser} · {s.os}</p>
                        {s.current && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Current</span>}
                      </div>
                      <p className="text-[11px] text-zinc-500">{s.location} · {s.ip}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="text-[11px] text-zinc-400 flex items-center gap-1"><Clock size={10} /> {s.lastActive}</p>
                    </div>
                    {!s.current && (
                      <button onClick={() => revokeSession(s.id)} className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all" title="Revoke session">
                        <LogOut size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setSessions((prev) => prev.filter((s) => s.current));
                addNotification('All Other Sessions Terminated', 'You have been logged out from all other devices.', 'SUCCESS');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all"
            >
              <LogOut size={14} />
              Logout All Other Devices
            </button>
          </SectionCard>
        )}

        {/* ── API Keys ─────────────────────────────────────────────────── */}
        {activeSection === 'api-keys' && (
          <SectionCard title="API Keys" description="Manage programmatic access keys for SmartExpense integrations.">
            <button onClick={generateNewKey} className="flex items-center gap-2 px-4 py-2 rounded-xl primary-gradient-bg text-white text-xs font-semibold shadow-lg primary-gradient-glow mb-4">
              <Plus size={14} />
              Generate New Key
            </button>

            <div className="space-y-3">
              {apiKeys.map((k) => (
                <div key={k.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">{k.name}</p>
                      <p className="text-[11px] text-zinc-500">Created {k.created} · Last used {k.lastUsed}</p>
                    </div>
                    <button onClick={() => deleteKey(k.id)} className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 border border-white/5">
                    <code className="flex-1 text-[11px] text-emerald-400 font-mono">{k.key}</code>
                    <button
                      onClick={() => copyKey(k.id, k.key)}
                      className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                    >
                      {copiedKey === k.id ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                    <span>{k.requests.toLocaleString()} requests</span>
                    <span className="flex items-center gap-1"><Shield size={10} /> Standard rate limit</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Privacy ──────────────────────────────────────────────────── */}
        {activeSection === 'privacy' && (
          <SectionCard title="Privacy Settings" description="Control how your data is used and shared.">
            <div className="space-y-1">
              {[
                { key: 'analytics' as const, label: 'Analytics & Usage Data', sub: 'Allow SmartExpense to collect anonymous usage data to improve the product.' },
                { key: 'marketing' as const, label: 'Marketing Communications', sub: 'Receive product updates, features, and promotional offers.' },
                { key: 'aiTraining' as const, label: 'AI Model Training', sub: 'Allow anonymized transaction patterns to improve AI recommendations.' },
                { key: 'integrations' as const, label: 'Third-Party Integrations', sub: 'Enable connected bank accounts and financial service APIs.' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <p className="text-xs font-semibold text-white">{item.label}</p>
                    <p className="text-[11px] text-zinc-500 max-w-xs">{item.sub}</p>
                  </div>
                  <Toggle
                    value={privacySettings[item.key]}
                    onChange={(v) => setPrivacySettings(prev => ({ ...prev, [item.key]: v }))}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <SaveButton saving={saving} saved={saved} onClick={() => handleSave('Privacy Settings')} />
            </div>
          </SectionCard>
        )}

        {/* ── Data Export ──────────────────────────────────────────────── */}
        {activeSection === 'data-export' && (
          <SectionCard title="Export Your Data" description="Download a complete copy of all your financial data.">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { format: 'CSV' as const, desc: 'Spreadsheet compatible', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                { format: 'JSON' as const, desc: 'Machine readable', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
                { format: 'PDF' as const, desc: 'Print ready report', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
                { format: 'Excel' as const, desc: 'XLSX workbook', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
              ].map((f) => (
                <button
                  key={f.format}
                  onClick={() => exportData(f.format)}
                  className={`p-5 rounded-2xl border ${f.color} space-y-2 text-left hover:scale-[1.02] transition-transform`}
                >
                  <FileText size={20} />
                  <p className="font-bold text-sm text-white">{f.format}</p>
                  <p className="text-[11px] opacity-70">{f.desc}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/8 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Request Full Account Archive</p>
                <p className="text-[11px] text-zinc-500">All transactions, budgets, reports, AI history · ZIP delivery within 24h</p>
              </div>
              <button
                onClick={() => addNotification('Archive Requested', 'Full account ZIP archive requested. Link will be sent to your email within 24h.', 'SUCCESS')}
                className="px-4 py-2 rounded-xl primary-gradient-bg text-white text-xs font-semibold shadow primary-gradient-glow hover:opacity-95 transition-all"
              >
                Request Archive
              </button>
            </div>
          </SectionCard>
        )}

        {/* ── Danger Zone ──────────────────────────────────────────────── */}
        {activeSection === 'danger' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-rose-500/8 border border-rose-500/20 flex items-center gap-3">
              <AlertTriangle size={18} className="text-rose-400 shrink-0" />
              <p className="text-xs text-rose-300 leading-relaxed">
                <strong>Warning:</strong> Actions in this section are irreversible. Please read carefully before proceeding.
              </p>
            </div>

            {[
              {
                title: 'Reset Application Data',
                desc: 'Delete all transactions, budgets, and reports. Your account remains active.',
                btn: 'Reset All Data',
                action: 'RESET_DATA',
              },
              {
                title: 'Export All Data & Delete',
                desc: 'Download everything, then permanently delete all your data from SmartExpense servers.',
                btn: 'Export & Delete',
                action: 'EXPORT_DELETE',
              },
              {
                title: 'Delete Account',
                desc: 'Permanently delete your SmartExpense account and all associated data. This cannot be undone.',
                btn: 'Delete Account',
                action: 'DELETE_ACCOUNT',
              },
            ].map((item) => (
              <div key={item.action} className="p-5 rounded-2xl glass-card border border-rose-500/10 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => setConfirm({ action: item.action, msg: item.desc, danger: true })}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all whitespace-nowrap"
                >
                  {item.btn}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirm && (
        <ConfirmDialog
          title="Confirm Action"
          message={`Are you sure? ${confirm.msg}`}
          danger={confirm.danger}
          onCancel={() => setConfirm(null)}
          onConfirm={handleDangerConfirm}
        />
      )}
    </div>
  );
};
