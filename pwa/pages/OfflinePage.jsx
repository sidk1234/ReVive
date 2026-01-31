import React from 'react';
import { Page, Block, BlockTitle, Card, CardHeader, CardContent } from 'konsta/react';

export default function OfflinePage() {
  return (
    <Page>
      <Block strong inset className="flex flex-col items-center justify-center min-h-screen">
        <img
          src="/favicon-192.png"
          alt="ReVive"
          className="w-32 h-32 mb-6 rounded-2xl"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <BlockTitle large>You&apos;re Offline</BlockTitle>
        <Card className="mt-4">
          <CardHeader>Connection Required</CardHeader>
          <CardContent>
            <p className="text-center">
              You need to be connected to the web to use ReVive.
            </p>
            <p className="text-center text-sm text-opacity-60 mt-2">
              Please check your connection and try again.
            </p>
          </CardContent>
        </Card>
      </Block>
    </Page>
  );
}
