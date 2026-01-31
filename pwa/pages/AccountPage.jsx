import React, { useState } from 'react';
import { Page, Block, BlockTitle, Button, List, ListItem } from 'konsta/react';

/**
 * AccountPage shows the user's profile and authentication actions. For this
 * simplified demo we mock the authentication state locally. Replace this
 * with your Supabase authentication logic in a real app.
 */
export default function AccountPage() {
  const [user, setUser] = useState(null);

  const handleSignIn = () => {
    // Mock sign in: replace with supabase.auth.signInWithOAuth in real app
    setUser({ fullName: 'Demo User', email: 'demo@example.com' });
  };

  const handleSignOut = () => {
    setUser(null);
  };

  return (
    <Page>
      <Block strong inset className="mt-4">
        <BlockTitle large>Account</BlockTitle>
        {!user && (
          <div className="space-y-4">
            <Button large onClick={handleSignIn}>Sign In with Google</Button>
            <Button outline large onClick={handleSignIn}>Sign In with Email</Button>
          </div>
        )}
        {user && (
          <>
            <List strong inset>
              <ListItem title="Name" after={user.fullName} />
              <ListItem title="Email" after={user.email} />
            </List>
            <Button large onClick={handleSignOut} className="mt-4">Sign Out</Button>
          </>
        )}
      </Block>
    </Page>
  );
}