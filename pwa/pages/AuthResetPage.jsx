import React, { useState, useEffect } from 'react';
import { Page, Navbar, Block, BlockTitle, List, ListInput, Button, Card, CardHeader, CardContent } from 'konsta/react';
import { useAppRouter } from '../hooks/useAppRouter';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

export default function AuthResetPage() {
  const router = useAppRouter();
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState(null);
  const [isResetMode, setIsResetMode] = useState(false);

  useEffect(() => {
    // Check if we have a hash in the URL (password reset token)
    const hash = window.location.hash;
    if (hash.includes('access_token') || hash.includes('type=recovery')) {
      setIsResetMode(true);
    }
  }, []);

  const handleSendReset = async () => {
    if (!email) return;

    try {
      setError(null);
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    }
  };

  const handleResetPassword = async () => {
    if (!password || password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setResetting(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      // Success - redirect to account page
      router.navigate('/account');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  return (
    <Page>
      <Navbar title="Reset Password" />
      
      <Block strong inset className="mt-4">
        <BlockTitle large>Reset Password</BlockTitle>

        {!isResetMode ? (
          <>
            {!sent ? (
              <List strong inset>
                <ListInput
                  label="Email"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                <Button large onClick={handleSendReset} className="mt-4">
                  Send reset link
                </Button>
              </List>
            ) : (
              <Card>
                <CardHeader>Email sent</CardHeader>
                <CardContent>
                  <p>
                    If an account exists for {email}, you will receive an email with reset instructions.
                  </p>
                  <Button outline onClick={() => router.navigate('/account')} className="mt-4">
                    Back to Account
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <List strong inset>
            <ListInput
              label="New Password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <ListInput
              label="Confirm Password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            <Button
              large
              onClick={handleResetPassword}
              disabled={resetting || !password || !confirmPassword}
              className="mt-4"
            >
              {resetting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </List>
        )}
      </Block>
    </Page>
  );
}
