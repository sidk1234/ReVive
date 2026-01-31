import React, { useState, useEffect } from 'react';
import { Page, Block, BlockTitle, Button, BlockHeader } from 'konsta/react';
import { useRouter } from 'next/router';

/**
 * InstallInstructions shows platform-specific instructions for installing
 * the PWA. It detects if the app is already installed (standalone mode)
 * and skips the instructions if so.
 */
export default function InstallInstructions({ onContinue }) {
  const router = useRouter();
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState('unknown');

  useEffect(() => {
    // Check if app is running in standalone mode (installed)
    if (typeof window !== 'undefined') {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://');
      setIsStandalone(standalone);

      // Detect platform
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        setPlatform('ios');
      } else if (/android/i.test(userAgent)) {
        setPlatform('android');
      } else {
        setPlatform('other');
      }
    }
  }, []);

  // If installed, skip instructions
  if (isStandalone) {
    return null;
  }

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      router.push('/app/capture');
    }
  };

  return (
    <Page>
      <Block strong inset className="mt-8">
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/app/assets/logo.png"
            alt="ReVive"
            className="w-24 h-24 mb-4"
            onError={(e) => {
              // Fallback if logo doesn't exist
              e.currentTarget.style.display = 'none';
            }}
          />
          <BlockTitle large>Install ReVive</BlockTitle>
          <p className="text-opacity-60 mt-2">
            Get the best experience by installing ReVive to your home screen.
          </p>
        </div>

        {platform === 'ios' && (
          <Block strong inset className="mt-4">
            <BlockHeader>iOS Instructions</BlockHeader>
            <ol className="list-decimal list-inside space-y-3 text-sm text-opacity-80">
              <li>Tap the Share icon <span className="inline-block">📤</span> at the bottom of your screen</li>
              <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
              <li>Tap &quot;Add&quot; to confirm</li>
              <li>Open ReVive from your Home Screen for the best experience</li>
            </ol>
          </Block>
        )}

        {platform === 'android' && (
          <Block strong inset className="mt-4">
            <BlockHeader>Android Instructions</BlockHeader>
            <ol className="list-decimal list-inside space-y-3 text-sm text-opacity-80">
              <li>Tap the 3-dot menu <span className="inline-block">⋮</span> in your browser</li>
              <li>Tap &quot;Install app&quot; or &quot;Add to home screen&quot;</li>
              <li>Confirm the installation</li>
            </ol>
          </Block>
        )}

        {platform === 'other' && (
          <Block strong inset className="mt-4">
            <BlockHeader>Install Instructions</BlockHeader>
            <p className="text-sm text-opacity-80">
              Look for an install prompt in your browser, or use your browser&apos;s menu to add this app to your home screen.
            </p>
          </Block>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Button large onClick={handleContinue}>
            Continue in Browser
          </Button>
        </div>
      </Block>
    </Page>
  );
}

