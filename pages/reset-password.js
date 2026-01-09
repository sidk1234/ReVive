import { useEffect, useState } from 'react';
import Layout from '../Layout';
import { supabase } from '@/lib/supabaseClient';
import { supabaseApi } from '@/api/supabaseApi';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', message: '' });

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        setReady(true);
      }
    });

    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: '', message: '' });

    if (!password || !confirmPassword) {
      setStatus({ loading: false, error: 'Enter and confirm your new password.', message: '' });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ loading: false, error: 'Passwords do not match.', message: '' });
      return;
    }

    const result = await supabaseApi.auth.updatePassword(password);
    if (result?.error) {
      setStatus({
        loading: false,
        error: result.error.message || 'Unable to update password.',
        message: '',
      });
      return;
    }

    setStatus({ loading: false, error: '', message: 'Password updated. You can sign in now.' });
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_rgba(2,6,16,0.7)] backdrop-blur-xl">
          <h1 className="text-3xl font-semibold text-white mb-3">Reset your password</h1>
          <p className="text-sm text-white/70 mb-6">
            {ready
              ? 'Enter a new password below to complete your reset.'
              : 'Check your email for the reset link, then return here.'}
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm text-white/70">New password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none"
                placeholder="Enter a new password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none"
                placeholder="Re-enter your password"
              />
            </div>

            {status.error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {status.error}
              </div>
            ) : null}

            {status.message ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {status.message}
              </div>
            ) : null}

            <LiquidGlassButton size="lg" className="w-full" type="submit" disabled={status.loading}>
              {status.loading ? 'Updating...' : 'Update password'}
            </LiquidGlassButton>
          </form>
        </div>
      </div>
    </Layout>
  );
}
