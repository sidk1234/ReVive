import React, { useEffect } from 'react';
import { Page } from 'framework7-react';
import { useF7Router } from 'framework7-react';
import { supabase } from '../supabaseClient.js';

/**
 * AuthCallbackPage handles the OAuth redirect. When redirected
 * back from Google, Supabase provides a `code` and `state` as URL
 * query parameters. This page exchanges the code for a session and
 * then navigates to the capture page.
 */
export default function AuthCallbackPage() {
  const router = useF7Router();

  useEffect(() => {
    async function handleCallback() {
      try {
        // Supabase will parse the code and state parameters from
        // window.location.search automatically.
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          console.error('Error exchanging code for session', error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        // Always navigate to the capture page after handling the callback.
        router.navigate('/capture');
      }
    }
    handleCallback();
  }, []);

  return (
    <Page>
      <div className="flex flex-col items-center justify-center h-full p-4">
        <h2 className="text-xl font-semibold mb-2">Signing you in…</h2>
        <p>Please wait while we complete your sign‑in.</p>
      </div>
    </Page>
  );
}