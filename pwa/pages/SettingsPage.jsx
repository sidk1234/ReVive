import React, { useState, useEffect } from 'react';
import { Page } from 'framework7-react';
import {
  Navbar,
  List,
  ListItem,
  ListInput,
  Toggle,
  Segmented,
  SegmentedItem,
} from 'konsta/react';
import { useF7 } from 'framework7-react';
import { supabase } from '../supabaseClient.js';
import AppTabbar from '../components/AppTabbar.jsx';
import ZipInput from '../components/ZipInput.jsx';

/**
 * SettingsPage replicates the settings screen from the native app. Users can
 * toggle appearance, enable/disable haptics and instructions, and set
 * their default ZIP code. The search setting is shown but locked on
 * because ReVive always performs web search.
 */
export default function SettingsPage() {
  const f7 = useF7();
  // Appearance mode: 'system', 'light', 'dark'. Persist to localStorage.
  const [appearance, setAppearance] = useState(
    () => localStorage.getItem('revive-appearance') || 'system',
  );
  const [showInstructions, setShowInstructions] = useState(
    () => localStorage.getItem('revive-show-instructions') !== 'false',
  );
  const [enableHaptics, setEnableHaptics] = useState(
    () => localStorage.getItem('revive-haptics') !== 'false',
  );
  const [autoSync, setAutoSync] = useState(
    () => localStorage.getItem('revive-autosync') !== 'false',
  );
  const [reduceMotion, setReduceMotion] = useState(
    () => localStorage.getItem('revive-reduce-motion') === 'true',
  );
  const [zip, setZip] = useState(
    () => localStorage.getItem('revive-zip') || '',
  );

  // Persist preferences when changed.
  useEffect(() => {
    localStorage.setItem('revive-appearance', appearance);
    // Update Konsta theme dynamically.
    document.documentElement.setAttribute('data-konsta-theme', appearance);
  }, [appearance]);
  useEffect(() => {
    localStorage.setItem('revive-show-instructions', showInstructions);
  }, [showInstructions]);
  useEffect(() => {
    localStorage.setItem('revive-haptics', enableHaptics);
  }, [enableHaptics]);
  useEffect(() => {
    localStorage.setItem('revive-autosync', autoSync);
  }, [autoSync]);
  useEffect(() => {
    localStorage.setItem('revive-reduce-motion', reduceMotion);
  }, [reduceMotion]);
  useEffect(() => {
    localStorage.setItem('revive-zip', zip);
  }, [zip]);

  // Handle location button press to auto-fill ZIP.
  async function handleLocate() {
    if (!('geolocation' in navigator)) {
      f7.dialog.alert('Location services are not available.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Attempt to fetch the current auth session. If the user is not
          // signed in this will return null and no Authorization header
          // will be attached.
          let token;
          try {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            token = session?.access_token;
          } catch (e) {
            token = undefined;
          }
          const res = await fetch('/app/functions/v1/zip-lookup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ lat: latitude, lng: longitude }),
          });
          const data = await res.json();
          if (data.zip) {
            setZip(data.zip);
          } else {
            f7.dialog.alert('Could not determine ZIP from your location.');
          }
        } catch (err) {
          console.error(err);
          f7.dialog.alert('Error fetching ZIP from location');
        }
      },
      (err) => {
        f7.dialog.alert('Location error: ' + err.message);
      },
    );
  }

  return (
    <Page>
      <Navbar large title="Settings" />
      <List strong inset className="mt-4">
        <ListItem
          title="Appearance"
          after={
            <Segmented strong>
              <SegmentedItem
                active={appearance === 'light'}
                onClick={() => setAppearance('light')}
              >
                Light
              </SegmentedItem>
              <SegmentedItem
                active={appearance === 'dark'}
                onClick={() => setAppearance('dark')}
              >
                Dark
              </SegmentedItem>
              <SegmentedItem
                active={appearance === 'system'}
                onClick={() => setAppearance('system')}
              >
                System
              </SegmentedItem>
            </Segmented>
          }
        />
        <ListItem
          title="Show instructions"
          after={
            <Toggle
              checked={showInstructions}
              onChange={(e) => setShowInstructions(e.target.checked)}
            />
          }
        />
        <ListItem
          title="Enable haptics"
          after={
            <Toggle
              checked={enableHaptics}
              onChange={(e) => setEnableHaptics(e.target.checked)}
            />
          }
        />
        <ListItem
          title="Auto-sync impact"
          after={
            <Toggle
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
            />
          }
        />
        <ListItem
          title="Reduce motion"
          after={
            <Toggle
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
            />
          }
        />
        <ListItem
          title="Use web search"
          subtitle="Always enabled for better results"
          after={<Toggle checked disabled />}
        />
      </List>
      <ZipInput zip={zip} setZip={setZip} onLocate={handleLocate} />
      {/* Tabbar at the bottom */}
      <AppTabbar activeTab="settings" />
    </Page>
  );
}