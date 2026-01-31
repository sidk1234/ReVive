import React from 'react';
import { Page } from 'framework7-react';

/**
 * AuthResetPage displays after the user clicks a password reset link.
 * In a full implementation you would prompt the user to enter a
 * new password and call `supabase.auth.updateUser()` with the
 * provided password. For simplicity we instruct the user to return
 * to the app and reset their password via the login form.
 */
export default function AuthResetPage() {
  return (
    <Page>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Password Reset</h1>
        <p>
          Your password reset link is valid. Please return to the ReVive app
          and sign in with your existing email address. You will be prompted
          to enter a new password.
        </p>
      </div>
    </Page>
  );
}