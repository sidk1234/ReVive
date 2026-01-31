import React, { useState, useEffect } from 'react';
import { Page } from 'framework7-react';
import {
  Navbar,
  List,
  ListItem,
  Input,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Spinner,
} from 'konsta/react';
import { supabase } from '../supabaseClient.js';
import AppTabbar from '../components/AppTabbar.jsx';

/**
 * AccountPage handles authentication. Users can sign in with Google
 * or email/password, sign up with email, reset their password, and
 * delete their account entirely. When logged in the page shows
 * account details and sign‑out/delete controls.
 */
export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    // Load initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function loginWithGoogle() {
    setProcessing(true);
    const redirectTo = `${window.location.origin}/app/auth/callback`;
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    setProcessing(false);
  }

  async function signInWithEmail() {
    setProcessing(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    setProcessing(false);
  }

  async function signUpWithEmail() {
    setProcessing(true);
    setMessage('');
    const redirectTo = `${window.location.origin}/app/auth/confirm`;
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
    if (error) setMessage(error.message);
    else setMessage('Check your email to confirm your account.');
    setProcessing(false);
  }

  async function resetPassword() {
    setProcessing(true);
    setMessage('');
    const redirectTo = `${window.location.origin}/app/auth/reset`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) setMessage(error.message);
    else setMessage('Password reset link sent to your email.');
    setProcessing(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function deleteAccount() {
    if (!session) return;
    setProcessing(true);
    setMessage('');
    try {
      const res = await fetch('/app/functions/v1/delete-account', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error || 'Failed to delete account');
      } else {
        // Immediately sign out after deletion
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to delete account');
    } finally {
      setProcessing(false);
    }
  }

  const loggedIn = !!session;

  return (
    <Page>
      <Navbar large title="Account" />
      <div className="p-4 space-y-4">
        {loading ? (
          <Spinner />
        ) : loggedIn ? (
          <Card>
            <CardHeader>Signed in as {session.user.email}</CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={signOut} large tone="light" disabled={processing}>
                Sign Out
              </Button>
              <Button
                onClick={deleteAccount}
                large
                tonal
                disabled={processing}
                className="bg-red-600 text-white"
              >
                Delete Account
              </Button>
              {message && <p className="text-sm text-red-600">{message}</p>}
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>Sign in or create account</CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={loginWithGoogle} large disabled={processing}>
                  {processing ? 'Redirecting…' : 'Continue with Google'}
                </Button>
                <div className="border-t border-divider my-4"></div>
                <List strong inset>
                  <ListItem title="Email">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      clearButton
                    />
                  </ListItem>
                  <ListItem title="Password">
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      clearButton
                    />
                  </ListItem>
                </List>
                <div className="flex space-x-2">
                  <Button onClick={signInWithEmail} large disabled={processing} className="flex-1">
                    Sign In
                  </Button>
                  <Button onClick={signUpWithEmail} large tonal disabled={processing} className="flex-1">
                    Sign Up
                  </Button>
                </div>
                <Button onClick={resetPassword} small outline disabled={processing}>
                  Forgot password?
                </Button>
                {message && <p className="text-sm text-red-600">{message}</p>}
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <AppTabbar activeTab="account" />
    </Page>
  );
}