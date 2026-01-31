import React, { useState } from 'react';
import { Page, Block, BlockTitle, List, ListInput, Button } from 'konsta/react';

/**
 * AuthResetPage allows the user to request a password reset. This is a
 * placeholder; integrate with your Supabase password reset flow in a
 * real application.
 */
export default function AuthResetPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!email) return;
    // In a real app, call supabase.auth.resetPasswordForEmail here
    setSent(true);
  };
  return (
    <Page>
      <Block strong inset className="mt-4">
        <BlockTitle large>Reset Password</BlockTitle>
        {!sent && (
          <List strong inset>
            <ListInput
              label="Email"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button large className="mt-4" onClick={handleSend}>Send reset link</Button>
          </List>
        )}
        {sent && (
          <div className="mt-4 text-center">
            If an account exists for {email}, you will receive an email with reset instructions.
          </div>
        )}
      </Block>
    </Page>
  );
}