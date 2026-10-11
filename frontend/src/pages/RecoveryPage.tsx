import React, { useState } from 'react';
import { Button, Card } from '../components/ui';
import { request, isDemoMode } from '../services/api';

export function RecoveryPage({ reset, onBack }: { reset: boolean; onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token') ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (isDemoMode()) { setError('Password recovery is available for registered accounts. Leave demo mode to continue.'); return; }
    if (reset && !token) { setError('This reset link is missing its token. Request a new link.'); return; }
    setLoading(true);
    try {
      await request(reset ? '/auth/reset-password' : '/auth/forgot-password', {
        method: 'POST', body: JSON.stringify(reset ? { token, newPassword: password } : { email }),
      });
      setMessage(reset ? 'Password updated. You can now sign in.' : 'If that email is registered, a reset link will be sent. Check your inbox.');
      if (reset) window.history.replaceState({}, '', '/reset-password');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to complete password recovery. Please try again.');
    } finally { setLoading(false); }
  }

  return <main className="min-h-dvh flex items-center justify-center bg-[var(--sem-bg)] text-white p-4">
    <Card className="w-full max-w-md space-y-6">
      <h1 className="text-2xl font-bold">{reset ? 'Set a new password' : 'Recover your account'}</h1>
      <p className="text-sm text-slate-300">{reset ? 'Choose a new password for your workspace.' : 'Enter the email address you used to register.'}</p>
      {message ? <p role="status" className="text-sm text-emerald-300">{message}</p> :
        <form onSubmit={submit} className="space-y-4">
          <label htmlFor="recovery-field" className="block text-sm">{reset ? 'New password' : 'Email address'}</label>
          <input id="recovery-field" className="field-input" required type={reset ? 'password' : 'email'}
            autoComplete={reset ? 'new-password' : 'email'} minLength={reset ? 6 : undefined} maxLength={reset ? 72 : 150}
            value={reset ? password : email} onChange={event => reset ? setPassword(event.target.value) : setEmail(event.target.value)} />
          {error && <p role="alert" className="text-sm text-amber-300">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">{reset ? 'Update password' : 'Send reset link'}</Button>
        </form>}
      <button onClick={onBack} className="text-sm text-teal-300 hover:underline">Back to sign in</button>
    </Card>
  </main>;
}
