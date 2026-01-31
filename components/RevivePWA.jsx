import React, { useState, useEffect } from 'react';
import { KonstaProvider } from 'konsta/react';
import { ThemeProvider } from '../pwa/contexts/ThemeContext';
import { AuthProvider } from '../pwa/contexts/AuthContext';
import InstallInstructions from '../pwa/components/InstallInstructions';

export default function RevivePWA({ children, isRoot = false }) {
  const [showInstall, setShowInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [f7Ready, setF7Ready] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(false);

  useEffect(() => {
    // Check if installed
    if (typeof window !== 'undefined') {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
      
      // Check if user previously dismissed install prompt
      const dismissed = sessionStorage.getItem('revive-install-dismissed') === 'true';
      setInstallDismissed(dismissed);
      
      // Only show install if not standalone and not previously dismissed
      setShowInstall(!standalone && !dismissed);

      // Check online status
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Initialize after mount
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

  // Show install instructions if not installed and not dismissed
  // Only show on /app root, not on sub-routes
  const shouldShowInstall = showInstall && !isStandalone && f7Ready && !installDismissed && isRoot;
  
  if (shouldShowInstall) {
    return (
      <KonstaProvider theme="ios" safeAreas>
        <ThemeProvider>
          <AuthProvider>
            <InstallInstructions onContinue={() => {
              // Update state immediately
              setShowInstall(false);
              setInstallDismissed(true);
              // Remember dismissal for this session
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('revive-install-dismissed', 'true');
              }
              // Navigate to capture page
              if (typeof window !== 'undefined') {
                window.location.href = '/app/capture';
              }
            }} />
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
