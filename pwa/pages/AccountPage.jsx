import React, { useState } from 'react';
import {
  Page,
  Navbar,
  Block,
  BlockTitle,
  List,
  ListItem,
  Button,
  Card,
  CardHeader,
  CardContent,
  Dialog,
  DialogButton,
  Preloader,
} from 'konsta/react';
import { useAppRouter } from '../hooks/useAppRouter';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import AppTabbar from '../components/AppTabbar';

export default function AccountPage() {
  const router = useAppRouter();
  const { user, session, isAuthenticated, signInWithGoogle, signOut, signInWithEmail, signUpWithEmail } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!session?.access_token) return;

    setDeleting(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      await signOut();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Delete account error:', error);
      setAuthError('Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEmailAuth = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, fullName);
      } else {
        await signInWithEmail(email, password);
      }
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (error) {
      setAuthError(error.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const navigate = (path) => {
    router.navigate(path);
  };

  return (
    <Page>
      <Navbar title="Account" large transparent />
      
      <Block strong inset className="mt-4">
        <BlockTitle large>Account</BlockTitle>

        {isAuthenticated && user ? (
          <>
            <Card className="mb-4">
              <CardHeader>Signed in</CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-opacity-60">Name</div>
                    <div className="font-semibold">{user.full_name || user.email || 'User'}</div>
                  </div>
                  {user.email && (
                    <div>
                      <div className="text-sm text-opacity-60">Email</div>
                      <div>{user.email}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <List strong inset>
              <ListItem
                title="Sync impact"
                onClick={async () => {
                  // Trigger impact sync
                  router.navigate('/impact');
                }}
              />
              <ListItem
                title="Sign out"
                onClick={signOut}
              />
            </List>

            <div className="mt-6">
              <Button
                large
                outline
                tonal
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card className="mb-4">
              <CardHeader>Guest</CardHeader>
              <CardContent>
                <p>Sign in to sync your impact.</p>
              </CardContent>
            </Card>

            <List strong inset>
              <ListItem
                title="Sign in with Google"
                onClick={signInWithGoogle}
              />
            </List>

            <Card className="mt-4">
              <CardHeader>{isSignUp ? 'Sign Up' : 'Sign In'}</CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isSignUp && (
                    <input
                      type="text"
                      placeholder="Full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-opacity-10 border border-opacity-20"
                    />
                  )}
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-opacity-10 border border-opacity-20"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-opacity-10 border border-opacity-20"
                  />
                  {authError && (
                    <div className="text-red-500 text-sm">{authError}</div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      large
                      onClick={handleEmailAuth}
                      disabled={!email || !password || authLoading}
                    >
                      {authLoading ? <Preloader size="w-4 h-4" /> : isSignUp ? 'Sign Up' : 'Sign In'}
                    </Button>
                    <Button
                      outline
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setAuthError(null);
                      }}
                    >
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </Button>
                  </div>
                  {!isSignUp && (
                    <Button
                      clear
                      onClick={() => router.navigate('/auth/reset')}
                    >
                      Forgot password?
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </Block>

      <Dialog
        opened={showDeleteDialog}
        onBackdropClick={() => setShowDeleteDialog(false)}
        title="Delete Account"
        content="Are you sure you want to delete your account? This action cannot be undone."
        buttons={[
          <DialogButton key="cancel" onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </DialogButton>,
          <DialogButton
            key="delete"
            onClick={handleDeleteAccount}
            className="text-red-500"
            disabled={deleting}
          >
            {deleting ? <Preloader size="w-4 h-4" /> : 'Delete'}
          </DialogButton>,
        ]}
      />

      <AppTabbar activeTab="account" onNavigate={navigate} />
    </Page>
  );
}
