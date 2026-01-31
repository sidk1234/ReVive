import React, { useEffect } from 'react';
import { Page, Block, BlockTitle, Preloader } from 'konsta/react';
import { useRouter } from 'next/router';

/**
 * AuthCallbackPage handles OAuth redirect. In this simplified version
 * it just shows a loading indicator and redirects the user back to the
 * capture page after a short delay. Replace with your Supabase
 * callback handling logic.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/app/capture');
    }, 1000);
    return () => clearTimeout(timer);
  }, [router]);
  return (
    <Page>
      <Block strong inset className="mt-4 flex flex-col items-center justify-center">
        <BlockTitle>Signing you in…</BlockTitle>
        <Preloader size="w-8 h-8" />
      </Block>
    </Page>
  );
}