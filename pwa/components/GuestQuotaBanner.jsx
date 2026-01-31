import React from 'react';
import { Card, CardHeader, CardContent, Button } from 'konsta/react';

/**
 * GuestQuotaBanner displays remaining free scans for anonymous users.
 * When the quota is exhausted the banner prompts the guest to sign
 * in for additional usage. When `remaining` is null the banner is
 * hidden entirely.
 */
export default function GuestQuotaBanner({ remaining, onSignIn }) {
  if (remaining === null) return null;

  const exhausted = remaining <= 0;
  return (
    <div className="p-4">
      <Card nested strong inset>
        <CardHeader>Guest mode</CardHeader>
        <CardContent className="space-y-2">
          {exhausted ? (
            <p>You have reached your guest scanning limit for today.</p>
          ) : (
            <p>You have {remaining} guest scan{remaining !== 1 ? 's' : ''} left today.</p>
          )}
          <Button large onClick={onSignIn} tonal={exhausted}>
            Sign in for more
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}