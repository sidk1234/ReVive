import React, { useEffect } from 'react';
import { Page, Block, Preloader } from 'konsta/react';
import { useAppRouter } from '../hooks/useAppRouter';
import { supabase } from '../supabaseClient';

export default function AuthCallbackPage() {
  const router = useAppRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth callback error:', error);
          router.navigate('/account');
          return;
        }

        if (data.session) {
          // Successfully authenticated
          router.navigate('/capture');
        } else {
          router.navigate('/account');
        }
      } catch (error) {
        console.error('Auth callback exception:', error);
        router.navigate('/account');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <Page>
      <Block strong inset className="flex flex-col items-center justify-center min-h-screen">
        <Preloader size="w-12 h-12" />
        <p className="mt-4 text-opacity-60">Signing you in…</p>
      </Block>
    </Page>
  );
}
