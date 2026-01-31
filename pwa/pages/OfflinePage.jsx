import React from 'react';
import { Page } from 'framework7-react';
import { Card, CardContent, Button } from 'konsta/react';

/**
 * OfflinePage is displayed when the service worker detects that
 * network connectivity is unavailable. Users cannot use ReVive
 * without connectivity because the intelligence and database live
 * on the server. A message and logo are shown with a button to
 * retry once the connection is restored.
 */
export default function OfflinePage() {
  function reload() {
    window.location.reload();
  }
  return (
    <Page>
      <div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
        {/* Use the PWA logo stored under /app/assets so it resolves correctly under Next.js */}
        <img src="/app/assets/logo.png" alt="ReVive logo" className="w-20 h-20" />
        <h2 className="text-xl font-semibold">Offline</h2>
        <p className="text-center">You need to be connected to the internet to use ReVive.</p>
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4">
            <Button large onClick={reload} tonal>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}