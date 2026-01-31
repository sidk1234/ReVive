import React, { useState, useEffect } from 'react';
import { Page, useF7Router } from 'framework7-react';
import {
  Navbar,
  Segmented,
  SegmentedItem,
  List,
  ListItem,
  Button,
  Card,
  CardHeader,
  CardContent,
  Spinner,
  Input,
} from 'konsta/react';
import { supabase } from '../supabaseClient.js';
import AppTabbar from '../components/AppTabbar.jsx';
import GuestQuotaBanner from '../components/GuestQuotaBanner.jsx';

/**
 * CapturePage is the heart of the application. It allows users to
 * upload a photo or type an item name, then sends the data to
 * Supabase to determine how the item should be recycled. When
 * anonymously logged in the user can perform five scans per day.
 */
export default function CapturePage() {
  const router = useF7Router();
  const [mode, setMode] = useState('photo'); // 'photo' or 'text'
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [quotaRemaining, setQuotaRemaining] = useState(null);

  // Fetch guest quota on mount. In a real implementation this would
  // call your `anon-quota` edge function via supabase.functions.invoke().
  useEffect(() => {
    async function fetchQuota() {
      try {
        // If the user is signed in we don't show a quota.
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setQuotaRemaining(null);
          return;
        }
        // For now assume the guest has 5 scans per day. You can call
        // your edge function here to get the real remaining count.
        setQuotaRemaining(5);
      } catch (err) {
        console.error(err);
        setQuotaRemaining(null);
      }
    }
    fetchQuota();
  }, []);

  // Handle file input change.
  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
    }
  }

  // Handle analyze action.
  async function analyze() {
    if (quotaRemaining !== null && quotaRemaining <= 0) {
      router.navigate('/account');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (mode === 'photo' && file) {
        // Read file as base64. In a full implementation you would
        // transmit the raw binary and let the backend handle parsing.
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result.split(',')[1];
          try {
            const res = await fetch('/app/functions/v1/revive', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                mode: 'image',
                imageBase64: base64,
                useWebSearch: true,
              }),
            });
            const data = await res.json();
            setResult(data);
            // Decrement guest quota locally
            if (quotaRemaining !== null) {
              setQuotaRemaining((r) => (r != null ? Math.max(r - 1, 0) : null));
            }
          } catch (err) {
            console.error(err);
            setResult({ error: 'Analysis failed' });
          } finally {
            setLoading(false);
          }
        };
        reader.readAsDataURL(file);
      } else if (mode === 'text' && text.trim()) {
        try {
          const res = await fetch('/app/functions/v1/revive', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              mode: 'text',
              itemName: text.trim(),
              useWebSearch: true,
            }),
          });
          const data = await res.json();
          setResult(data);
          if (quotaRemaining !== null) {
            setQuotaRemaining((r) => (r != null ? Math.max(r - 1, 0) : null));
          }
        } catch (err) {
          console.error(err);
          setResult({ error: 'Analysis failed' });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <Page>
      <Navbar large title="Capture" />
      {/* Guest quota banner appears only for anonymous users */}
      <GuestQuotaBanner
        remaining={quotaRemaining}
        onSignIn={() => router.navigate('/account')}
      />
      <div className="p-4 space-y-4">
        {/* Mode selector */}
        <Segmented strong className="mb-4">
          <SegmentedItem
            active={mode === 'photo'}
            onClick={() => setMode('photo')}
          >
            Photo
          </SegmentedItem>
          <SegmentedItem
            active={mode === 'text'}
            onClick={() => setMode('text')}
          >
            Text
          </SegmentedItem>
        </Segmented>
        {/* Photo mode */}
        {mode === 'photo' && (
          <>
            <List inset strong>
              <ListItem title="Select image">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                />
              </ListItem>
            </List>
            {file && (
              <div className="flex items-center justify-center">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Selected"
                  className="max-w-full h-auto rounded-xl"
                />
              </div>
            )}
          </>
        )}
        {/* Text mode */}
        {mode === 'text' && (
          <List inset strong>
            <ListItem title="Item name">
              <Input
                type="text"
                placeholder="e.g. plastic bottle"
                value={text}
                onChange={(e) => setText(e.target.value)}
                clearButton
              />
            </ListItem>
          </List>
        )}
        {/* Analyze button */}
        <Button
          large
          disabled={loading || (mode === 'photo' ? !file : !text.trim())}
          onClick={analyze}
        >
          {loading ? <Spinner /> : 'Analyze'}
        </Button>
        {/* Result card */}
        {result && (
          <Card nested className="mt-4">
            <CardHeader>Result</CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Tabbar at the bottom */}
      <AppTabbar activeTab="capture" />
    </Page>
  );
}