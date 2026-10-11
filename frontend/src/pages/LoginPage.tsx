import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { request, isDemoMode, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Button } from '../components/ui';
import type { AuthResponse } from '../types';

interface LoginPageProps {
  onSuccess: () => void;
  onBack?: () => void;
  onForgotPassword?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBack, onForgotPassword }) => {
  const { login } = useAuth();
  const { addNotification } = useNotifications();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const enterDemo = () => {
    const mockAuth: AuthResponse = {
      token: `demo_jwt_${Date.now()}`,
      tokenType: 'Bearer',
      refreshToken: `demo_refresh_${Date.now()}`,
      user: {
        id: 1,
        name: 'Demo Admin',
        email: 'demo@smartexpense.com',
        role: 'ADMIN',
      },
    };
    if (!window.location.search.includes('demo=1')) {
      const url = new URL(window.location.href);
      url.searchParams.set('demo', '1');
      window.history.replaceState({}, '', url.toString());
    }
    login(mockAuth);
    addNotification('Demo mode', 'Exploring with offline sample data.', 'INFO');
    onSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (isRegister && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    const path = isRegister ? '/auth/register' : '/auth/login';
    const payload = isRegister ? { name, email, password } : { email, password };

    try {
      const res = await request<AuthResponse>(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      login(res);
      addNotification('Signed in', `Welcome back, ${res.user?.name || res.name || 'User'}!`, 'SUCCESS');
      onSuccess();
    } catch (err) {
      if (isDemoMode()) {
        enterDemo();
      } else {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Unable to connect. Please try again in a moment.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex bg-[var(--sem-bg)] text-white overflow-x-hidden">
      <div className="hidden lg:flex flex-1 relative overflow-hidden border-r border-white/10 p-12 flex-col justify-between bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.2),transparent_40%),linear-gradient(160deg,#07111a,#0b1a24)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center font-extrabold">
            SE
          </div>
          <span className="font-bold text-lg">SmartExpense</span>
        </div>

        <div className="space-y-5 max-w-lg relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300/90">
            Your personal finance workspace
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Secure access to your expense workspace.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Track expenses, plan your monthly budget, and understand your spending.
            Keep your financial records together in one personal workspace.
          </p>
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <ShieldCheck size={16} />
            A secure home for your expense records
          </div>
        </div>

        <p className="text-xs text-slate-500">© 2026 Smart Expense Manager</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 glass-card p-8 rounded-3xl">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft size={14} />
              Back to home
            </button>
          )}

          <div>
            <h2 className="text-2xl font-extrabold">{isRegister ? 'Create account' : 'Welcome back'}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {isRegister ? 'Register a new workspace user' : 'Sign in to the SmartExpense dashboard'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label htmlFor="login-name" className="block text-xs font-semibold text-slate-400 mb-1">Full name</label>
                <input
                  type="text"
                  id="login-name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field-input"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  id="login-email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field-input pl-8"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input pl-8 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" loading={loading} size="lg">
              <span>{isRegister ? 'Create account' : 'Sign in'}</span>
              <ArrowRight size={14} />
            </Button>
          </form>

          {onForgotPassword && <button type="button" onClick={onForgotPassword} className="text-sm text-teal-300 hover:underline">Forgot password?</button>}

          <Button type="button" variant="secondary" className="w-full" onClick={enterDemo}>
            Explore with demo data
          </Button>

          <div className="pt-2 border-t border-white/10 text-center text-xs text-slate-400">
            <span>{isRegister ? 'Already have an account?' : "Don't have an account?"}</span>{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-teal-300 font-semibold hover:underline"
            >
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
