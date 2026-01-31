import React from 'react';
import { Block, Card, Button, Icon } from 'konsta/react';

export default function GuestQuotaBanner({
  remaining = 0,
  onUpgrade,
}) {
  return (
    <Block className="mt-4">
      <Card
        inset
        className="
          bg-yellow-50 dark:bg-yellow-900/40
          border border-yellow-200 dark:border-yellow-800
          rounded-xl
        "
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="
              flex items-center justify-center
              w-10 h-10
              rounded-full
              bg-yellow-100 dark:bg-yellow-800
              text-yellow-700 dark:text-yellow-300
            "
          >
            <Icon icon="lock" className="text-lg" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className="text-sm font-semibold">
              Guest usage limit reached
            </div>

            <div className="text-xs opacity-80 mt-1 leading-snug">
              You have <strong>{remaining}</strong> free captures remaining.
              Create an account to unlock unlimited scans and history.
            </div>

            {/* CTA */}
            <Button
              small
              className="mt-3"
              onClick={onUpgrade}
            >
              Upgrade Account
            </Button>
          </div>
        </div>
      </Card>
    </Block>
  );
}