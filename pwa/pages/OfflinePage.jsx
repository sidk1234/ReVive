import React from 'react';
import { Page, Block, BlockTitle, Button } from 'konsta/react';
import Link from 'next/link';

/**
 * OfflinePage is displayed when the PWA detects that the user is offline.
 * In a real app you would hook this up to your service worker's
 * offline detection. Here we simply display a friendly message.
 */
export default function OfflinePage() {
  return (
    <Page>
      <Block strong inset className="mt-20 text-center">
        <BlockTitle large>You&apos;re Offline</BlockTitle>
        <p className="text-gray-500 mb-4">
          You need to be connected to the internet to use ReVive. Please
          check your connection and try again.
        </p>
        <Link href="/">
          <Button large>Go Home</Button>
        </Link>
      </Block>
    </Page>
  );
}