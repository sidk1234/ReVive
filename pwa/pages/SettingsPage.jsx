import React, { useState, useEffect } from 'react';
import {
  Page,
  Navbar,
  Block,
  BlockTitle,
  List,
  ListItem,
  ListInput,
  Toggle,
  Segmented,
  SegmentedButton,
  Button,
} from 'konsta/react';
import { useAppRouter } from '../hooks/useAppRouter';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentLocation, lookupZipFromLocation } from '../utils/zipLookup';
import AppTabbar from '../components/AppTabbar';

export default function SettingsPage() {
  const router = useAppRouter();
  const { theme, updateTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [defaultZip, setDefaultZip] = useState('');
  const [allowWebSearch, setAllowWebSearch] = useState(true);
  const [enableHaptics, setEnableHaptics] = useState(true);
  const [showCaptureInstructions, setShowCaptureInstructions] = useState(true);
  const [autoSyncImpact, setAutoSyncImpact] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const savedZip = localStorage.getItem('revive-default-zip') || '';
      const savedWebSearch = localStorage.getItem('revive-allow-web-search');
      const savedHaptics = localStorage.getItem('revive-enable-haptics');
      const savedInstructions = localStorage.getItem('revive-show-capture-instructions');
      const savedAutoSync = localStorage.getItem('revive-auto-sync-impact');
      const savedReduceMotion = localStorage.getItem('revive-reduce-motion');

      setDefaultZip(savedZip);
      if (savedWebSearch !== null) setAllowWebSearch(savedWebSearch === 'true');
      if (savedHaptics !== null) setEnableHaptics(savedHaptics === 'true');
      if (savedInstructions !== null) setShowCaptureInstructions(savedInstructions === 'true');
      if (savedAutoSync !== null) setAutoSyncImpact(savedAutoSync === 'true');
      if (savedReduceMotion !== null) setReduceMotion(savedReduceMotion === 'true');
    }
  }, []);

  const handleZipChange = (value) => {
    const filtered = value.replace(/\D/g, '').slice(0, 5);
    setDefaultZip(filtered);
    if (typeof window !== 'undefined') {
      localStorage.setItem('revive-default-zip', filtered);
    }
  };

  const handleLocationRequest = async () => {
    try {
      const location = await getCurrentLocation();
      const zip = await lookupZipFromLocation(location.lat, location.lng);
      if (zip) {
        setDefaultZip(zip);
        if (typeof window !== 'undefined') {
          localStorage.setItem('revive-default-zip', zip);
        }
      }
    } catch (err) {
      console.error('Location error:', err);
    }
  };

  const navigate = (path) => {
    router.navigate(path);
  };

  return (
    <Page>
      <Navbar title="Settings" large transparent />
      
      <Block strong inset className="mt-4">
        <BlockTitle large>Settings</BlockTitle>

        <List strong inset>
          <ListItem
            title="Location"
            header
          />
          <ListItem
            title="Default ZIP code"
            after={
              <div className="flex items-center gap-2">
                <ListInput
                  type="text"
                  placeholder="ZIP code"
                  value={defaultZip}
                  onChange={(e) => handleZipChange(e.target.value)}
                  className="w-24"
                />
                <Button small onClick={handleLocationRequest}>
                  📍
                </Button>
              </div>
            }
          />
          <ListItem
            title="Allow web search for local rules"
            after={
              <Toggle
                checked={allowWebSearch}
                onChange={(e) => {
                  setAllowWebSearch(e.target.checked);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('revive-allow-web-search', String(e.target.checked));
                  }
                }}
              />
            }
          />
        </List>

        <List strong inset className="mt-4">
          <ListItem title="Appearance" header />
          <ListItem>
            <Segmented strong>
              <SegmentedButton
                active={theme === 'system'}
                onClick={() => updateTheme('system')}
              >
                System
              </SegmentedButton>
              <SegmentedButton
                active={theme === 'light'}
                onClick={() => updateTheme('light')}
              >
                Light
              </SegmentedButton>
              <SegmentedButton
                active={theme === 'dark'}
                onClick={() => updateTheme('dark')}
              >
                Dark
              </SegmentedButton>
            </Segmented>
          </ListItem>
        </List>

        <List strong inset className="mt-4">
          <ListItem title="Capture" header />
          <ListItem
            title="Haptic feedback"
            after={
              <Toggle
                checked={enableHaptics}
                onChange={(e) => {
                  setEnableHaptics(e.target.checked);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('revive-enable-haptics', String(e.target.checked));
                  }
                }}
              />
            }
          />
          <ListItem
            title="Show capture instructions"
            after={
              <Toggle
                checked={showCaptureInstructions}
                onChange={(e) => {
                  setShowCaptureInstructions(e.target.checked);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('revive-show-capture-instructions', String(e.target.checked));
                  }
                }}
              />
            }
          />
          <ListItem
            title="Reduce motion"
            after={
              <Toggle
                checked={reduceMotion}
                onChange={(e) => {
                  setReduceMotion(e.target.checked);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('revive-reduce-motion', String(e.target.checked));
                  }
                }}
              />
            }
          />
        </List>

        <List strong inset className="mt-4">
          <ListItem title="Sync" header />
          <ListItem
            title="Auto-sync impact"
            after={
              <Toggle
                checked={autoSyncImpact}
                onChange={(e) => {
                  setAutoSyncImpact(e.target.checked);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('revive-auto-sync-impact', String(e.target.checked));
                  }
                }}
                disabled={!isAuthenticated}
              />
            }
          />
          {!isAuthenticated && (
            <ListItem
              title=""
              subtitle="Auto-sync requires a signed-in account."
            />
          )}
        </List>

        {!isAuthenticated && (
          <div className="mt-4 text-sm text-opacity-60">
            Sign in to sync preferences across devices.
          </div>
        )}
      </Block>

      <AppTabbar activeTab="settings" onNavigate={navigate} />
    </Page>
  );
}
