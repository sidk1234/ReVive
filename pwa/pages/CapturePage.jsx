import React, { useState, useEffect, useRef } from 'react';
import {
  Page,
  Navbar,
  Block,
  Button,
  List,
  ListInput,
  Preloader,
  Card,
  CardHeader,
  CardContent,
  Icon,
} from 'konsta/react';
import { Camera as IconCamera, Location as IconLocation } from 'framework7-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useAppRouter } from '../hooks/useAppRouter';
import AppTabbar from '../components/AppTabbar';
import GuestQuotaBanner from '../components/GuestQuotaBanner';
import { callReviveAPI, parseAIResponse, imageToBase64 } from '../utils/reviveApi';
import { getCurrentLocation, lookupZipFromLocation } from '../utils/zipLookup';
import { getAnonymousQuota, generateFingerprint } from '../utils/quota';

export default function CapturePage() {
  const router = useAppRouter();
  const { user, session, isAuthenticated, signInWithGoogle } = useAuth();
  const [zipCode, setZipCode] = useState('');
  const [manualZip, setManualZip] = useState('');
  const [isTextEntryActive, setIsTextEntryActive] = useState(false);
  const [itemText, setItemText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [quota, setQuota] = useState({ limit: 5, remaining: 5 });
  const [showLocationEntry, setShowLocationEntry] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load saved ZIP from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const savedZip = localStorage.getItem('revive-default-zip');
      if (savedZip) {
        setZipCode(savedZip);
        setManualZip(savedZip);
      }

      // Check quota for guests
      if (!isAuthenticated) {
        checkQuota();
      }
    }
  }, [isAuthenticated]);

  const checkQuota = async () => {
    const quotaData = await getAnonymousQuota();
    setQuota(quotaData);
  };

  const handleLocationRequest = async () => {
    try {
      const location = await getCurrentLocation();
      const zip = await lookupZipFromLocation(location.lat, location.lng);
      if (zip) {
        setZipCode(zip);
        setManualZip(zip);
        if (typeof window !== 'undefined') {
          localStorage.setItem('revive-default-zip', zip);
        }
      }
    } catch (err) {
      console.error('Location error:', err);
      setError('Could not determine location. Please enter ZIP manually.');
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await imageToBase64(file);
    setSelectedImage(base64);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleTextSubmit = async () => {
    const trimmed = itemText.trim();
    if (!trimmed || isLoading) return;

    // Check quota
    if (!isAuthenticated && quota.remaining <= 0) {
      setError('Guest quota exhausted. Please sign in to continue.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const accessToken = session?.access_token || null;
      const useWebSearch = zipCode ? true : false;
      const prompt = buildPrompt(trimmed, zipCode);

      const responseText = await callReviveAPI({
        mode: 'text',
        itemName: trimmed,
        prompt,
        useWebSearch,
        accessToken,
      });

      const parsed = parseAIResponse(responseText);
      if (parsed) {
        setResult(parsed);
        if (!isAuthenticated) {
          const fp = generateFingerprint();
          // Note: bumpAnonymousUsage would be called server-side
        }
      } else {
        setError('Could not parse response. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageAnalyze = async () => {
    if (!selectedImage || isLoading) return;

    // Check quota
    if (!isAuthenticated && quota.remaining <= 0) {
      setError('Guest quota exhausted. Please sign in to continue.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const accessToken = session?.access_token || null;
      const useWebSearch = zipCode ? true : false;
      const prompt = buildPrompt(null, zipCode);

      const responseText = await callReviveAPI({
        mode: 'image',
        imageBase64: selectedImage,
        prompt,
        useWebSearch,
        accessToken,
      });

      const parsed = parseAIResponse(responseText);
      if (parsed) {
        setResult(parsed);
        if (!isAuthenticated) {
          const fp = generateFingerprint();
          // Note: bumpAnonymousUsage would be called server-side
        }
      } else {
        setError('Could not parse response. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const buildPrompt = (itemDescription, zip) => {
    let prompt = `ROLE
You are a recycling assistant with mandatory, enforced web lookup capability.

CORE TASK
Identify the scanned item and determine whether THAT EXACT ITEM is recyclable in the user's local recycling program.

LOCATION IS IMPERATIVE (ABSOLUTE RULE)
If ANY location data is provided (ZIP, city/state, coordinates, GPS, inferred app location):
- You MUST perform a web search using that exact location
- Your search query MUST include the ZIP code or city/state text exactly
- You MUST base the decision on that specific local recycling program
- You are NOT allowed to answer generically when location exists
- You are NOT allowed to answer before completing a location-based search
- Every answer must be location-specific

HARD CONSTRAINTS (NON-NEGOTIABLE)
You must NOT say: typically, usually, may be, might be, check local rules, check local guidelines, varies by location, contact your municipality, depends on your area.
You must NOT hedge, speculate, or soften the answer.
You must NOT mention uncertainty, assumptions, fallbacks, or lack of information.

RESPONSE FORMAT (STRICT)
Plain text only. NO JSON. NO markdown. NO URLs. NO citations. NO extra lines.

OUTPUT FORMAT (EXACT — DO NOT MODIFY)
NOTES: <item-specific prep or "No special prep.">
ITEM: <exact product name or concise generic name>
MATERIAL: <material>
RECYCLABLE: <yes/no>
BIN: <specific local bin or disposal instruction>`;

    if (itemDescription) {
      prompt += `\n\nText-only input rules:
* No image is provided. Use the text description as the source of truth.
* Do NOT mention that no image was provided.
* Do NOT invent brands or details not in the description.

Item description: ${itemDescription}`;
    }

    if (zip) {
      prompt += `\n\nUse ZIP code ${zip} to tailor guidance if local rules differ.`;
    } else {
      prompt += `\n\nNo location provided; answer for typical US curbside recycling.`;
    }

    return prompt;
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
    setSelectedImage(null);
    setImagePreview(null);
    setItemText('');
    setIsTextEntryActive(false);
  };

  const navigate = (path) => {
    router.navigate(path);
  };

  return (
    <Page>
      <Navbar title="Capture" large transparent />
      
      <Block strong inset className="mt-4">
        {!isAuthenticated && (
          <GuestQuotaBanner
            remaining={quota.remaining}
            onSignIn={() => router.navigate('/account')}
          />
        )}

        {showLocationEntry && (
          <List strong inset className="mb-4">
            <ListInput
              label="ZIP code"
              type="text"
              placeholder="Enter ZIP code"
              value={manualZip}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                setManualZip(value);
                setZipCode(value);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('revive-default-zip', value);
                }
              }}
              after={
                <Button
                  small
                  clear
                  onClick={handleLocationRequest}
                  icon={<Icon ios={<IconLocation />} material={<IconLocation />} />}
                />
              }
            />
          </List>
        )}

        {!isTextEntryActive ? (
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                large
                onClick={() => fileInputRef.current?.click()}
                icon={<Icon ios={<IconCamera />} material={<IconCamera />} />}
              >
                Choose Photo
              </Button>
              <Button
                large
                outline
                onClick={() => setIsTextEntryActive(true)}
              >
                Type Item
              </Button>
            </div>

            {imagePreview && (
              <Card>
                <CardHeader>Selected Image</CardHeader>
                <CardContent>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full rounded-lg mb-4"
                  />
                  <div className="flex gap-2">
                    <Button large onClick={handleImageAnalyze} disabled={isLoading}>
                      Analyze
                    </Button>
                    <Button outline onClick={clearResult}>
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-4">
        <List strong inset>
          <ListInput
            label="Item Name"
            type="text"
                placeholder="Type an item (e.g., plastic bottle)"
                value={itemText}
                onChange={(e) => setItemText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleTextSubmit();
                  }
                }}
          />
        </List>
            <div className="flex gap-2">
              <Button large onClick={handleTextSubmit} disabled={!itemText.trim() || isLoading}>
            Analyze
          </Button>
              <Button outline onClick={() => setIsTextEntryActive(false)}>
                Cancel
              </Button>
            </div>
        </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Preloader size="w-12 h-12" />
          </div>
        )}

        {error && (
          <Card className="mt-4">
            <CardHeader>Error</CardHeader>
            <CardContent>
              <p className="text-red-500">{error}</p>
              <Button outline onClick={() => setError(null)} className="mt-2">
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        {result && !isLoading && (
          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span>Result</span>
                <Button small clear onClick={clearResult}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-opacity-60 mb-1">ITEM</div>
                  <div className="font-semibold">{result.item}</div>
                </div>
                <div>
                  <div className="text-sm text-opacity-60 mb-1">MATERIAL</div>
                  <div>{result.material}</div>
                </div>
                <div>
                  <div className="text-sm text-opacity-60 mb-1">RECYCLABLE</div>
                  <div className={result.recyclable ? 'text-green-500' : 'text-red-500'}>
                    {result.recyclable ? 'Yes' : 'No'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-opacity-60 mb-1">BIN</div>
                  <div>{result.bin}</div>
                </div>
                {result.notes && (
                  <div>
                    <div className="text-sm text-opacity-60 mb-1">NOTES</div>
                    <div>{result.notes}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </Block>

      <AppTabbar activeTab="capture" onNavigate={navigate} />
    </Page>
  );
}
