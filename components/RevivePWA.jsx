import React, { useState, useEffect } from 'react';
import { KonstaProvider } from 'konsta/react';
import { ThemeProvider } from '../pwa/contexts/ThemeContext';
import { AuthProvider } from '../pwa/contexts/AuthContext';
import InstallInstructions from '../pwa/components/InstallInstructions';

export default function RevivePWA({ children }) {
  const [showInstall, setShowInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [f7Ready, setF7Ready] = useState(false);

  useEffect(() => {
    // Check if installed
    if (typeof window !== 'undefined') {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
      setShowInstall(!standalone);

      // Check online status
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Initialize Framework7 after mount
      setF7Ready(true);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);


  // Show offline page if offline
  if (!isOnline) {
    return (
      <KonstaProvider theme="ios" safeAreas>
        <ThemeProvider>
          <AuthProvider>
            <div id="app" />
          </AuthProvider>
        </ThemeProvider>
      </KonstaProvider>
    );
  }

  // Show install instructions if not installed
  if (showInstall && !isStandalone && f7Ready) {
    return (
      <KonstaProvider theme="ios" safeAreas>
        <ThemeProvider>
          <AuthProvider>
            <InstallInstructions onContinue={() => setShowInstall(false)} />
          </AuthProvider>
        </ThemeProvider>
      </KonstaProvider>
    );
  }

  // Main PWA - use Next.js routing with Konsta UI
  // Framework7 is used only for transitions/animations, not routing
  return (
    <KonstaProvider theme="ios" safeAreas>
      <ThemeProvider>
        <AuthProvider>
          <div id="app" className="h-screen w-screen overflow-hidden">
            {children}
          </div>
        </AuthProvider>
      </ThemeProvider>
    </KonstaProvider>
  );
}
