import { useMemo, useState } from 'react';
import Layout from '../Layout';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import { supabaseApi } from '@/api/supabaseApi';
import { createPageUrl } from '@/utils';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function LoginPage() {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ loading: false, error: '', message: '' });

  const isSignup = mode === 'signup';
  const title = useMemo(() => (isSignup ? 'Create your account' : 'Welcome back'), [isSignup]);
  const subtitle = useMemo(
    () =>
      isSignup
        ? 'Save your impact data with a secure account. Passwords are hashed and stored by Supabase Auth.'
        : 'Sign in to continue tracking your recycling impact.',
    [isSignup],
  );

  const updateField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const passwordMatchState = useMemo(() => {
    if (!isSignup || !form.confirmPassword) {
      return 'idle';
    }
    return form.password === form.confirmPassword ? 'match' : 'mismatch';
  }, [form.confirmPassword, form.password, isSignup]);

  const routeAfterAuth = async () => {
    const user = await supabaseApi.auth.me();
    if (user && !user.onboarding_completed) {
      window.location.href = createPageUrl('Onboarding');
      return;
    }
    window.location.href = '/';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: '', message: '' });

    if (!form.email || !form.password) {
      setStatus({ loading: false, error: 'Email and password are required.', message: '' });
      return;
    }

    if (isSignup && form.password !== form.confirmPassword) {
      setStatus({ loading: false, error: 'Passwords do not match.', message: '' });
      return;
    }

    const result = isSignup
      ? await supabaseApi.auth.signUpWithEmail({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
        })
      : await supabaseApi.auth.signInWithEmail(form.email, form.password);

    if (result?.error) {
      const message = result.error.message || 'Something went wrong. Please try again.';
      setStatus({ loading: false, error: message, message: '' });
      return;
    }

    if (isSignup && !result?.data?.session) {
      setStatus({
        loading: false,
        error: '',
        message: 'Check your email to confirm your account, then sign in.',
      });
      return;
    }

    if (typeof window !== 'undefined') {
      await routeAfterAuth();
    }
  };

  return (
    <Layout>
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
          <div className="w-full max-w-5xl grid gap-10 md:grid-cols-[1.05fr_0.95fr] items-center">
            <div className="text-white space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-200">
                Secure access
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">{title}</h1>
              <p className="text-white/70 text-lg max-w-xl">{subtitle}</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white/70">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Track recycling totals across devices.
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  Sync profile details for your dashboard.
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                  Keep credentials protected with Supabase Auth.
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_rgba(2,6,16,0.7)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    {isSignup ? 'Sign up' : 'Sign in'}
                  </h2>
                  <p className="text-sm text-white/60">
                    {isSignup ? 'Already have an account?' : 'New here?'}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(isSignup ? 'signin' : 'signup');
                        setStatus({ loading: false, error: '', message: '' });
                      }}
                      className="ml-2 text-emerald-300 underline underline-offset-4"
                    >
                      {isSignup ? 'Sign in' : 'Create one'}
                    </button>
                  </p>
                </div>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                {isSignup ? (
                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Full name</label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={updateField('fullName')}
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label className="text-sm text-white/70">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={updateField('email')}
                    placeholder="you@email.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/70">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={updateField('password')}
                    placeholder={isSignup ? 'Create a password' : 'Enter your password'}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none"
                  />
                  {!isSignup ? (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-4"
                        onClick={async () => {
                          if (!form.email) {
                            setStatus({
                              loading: false,
                              error: 'Enter your email to receive a reset link.',
                              message: '',
                            });
                            return;
                          }
                          setStatus({ loading: true, error: '', message: '' });
                          const result = await supabaseApi.auth.sendPasswordReset(form.email);
                          if (result?.error) {
                            setStatus({
                              loading: false,
                              error: result.error.message || 'Unable to send reset email.',
                              message: '',
                            });
                            return;
                          }
                          setStatus({
                            loading: false,
                            error: '',
                            message: 'Password reset link sent. Check your inbox.',
                          });
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                  ) : null}
                </div>

                {isSignup ? (
                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Confirm password</label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={updateField('confirmPassword')}
                      placeholder="Re-enter your password"
                      className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none transition-colors ${
                        passwordMatchState === 'mismatch'
                          ? 'border-rose-400 focus:border-rose-400'
                          : passwordMatchState === 'match'
                            ? 'border-emerald-400 focus:border-emerald-400'
                            : 'border-white/10 focus:border-emerald-400'
                      }`}
                    />
                  </div>
                ) : null}

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

                <LiquidGlassButton
                  size="lg"
                  className="w-full"
                  disabled={status.loading}
                  type="submit"
                >
                  {status.loading ? 'Working...' : isSignup ? 'Create account' : 'Sign in'}
                </LiquidGlassButton>
              </form>

              <div className="mt-6 flex items-center gap-3 text-xs text-white/40">
                <div className="h-px flex-1 bg-white/10" />
                or continue with
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <LiquidGlassButton
                size="md"
                className="w-full mt-4"
                type="button"
                onClick={() => supabaseApi.auth.signInWithGoogle()}
              >
                Continue with Google
              </LiquidGlassButton>

              <p className="mt-6 text-xs text-white/45">
                By continuing, you agree to keep your credentials private. Supabase stores
                passwords as secure hashes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
