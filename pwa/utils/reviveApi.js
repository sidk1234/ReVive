/**
 * API client for the revive edge function
 */
export async function callReviveAPI({
  mode = 'image',
  prompt,
  itemName,
  imageBase64,
  useWebSearch = false,
  accessToken = null,
  maxOutputTokens = 400,
}) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const payload = {
      mode,
      prompt: prompt || itemName,
      itemName,
      imageBase64,
      useWebSearch,
      maxOutputTokens,
    };

    const response = await fetch(`${supabaseUrl}/functions/v1/revive`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('Revive API error:', error);
    throw error;
  }
}

/**
 * Parse the AI response into structured data
 */
export function parseAIResponse(text) {
  if (!text) return null;

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const result = {
    notes: '',
    item: '',
    material: '',
    recyclable: false,
    bin: '',
  };

  for (const line of lines) {
    if (line.startsWith('NOTES:')) {
      result.notes = line.replace(/^NOTES:\s*/i, '').trim();
    } else if (line.startsWith('ITEM:')) {
      result.item = line.replace(/^ITEM:\s*/i, '').trim();
    } else if (line.startsWith('MATERIAL:')) {
      result.material = line.replace(/^MATERIAL:\s*/i, '').trim();
    } else if (line.startsWith('RECYCLABLE:')) {
      const value = line.replace(/^RECYCLABLE:\s*/i, '').trim().toLowerCase();
      result.recyclable = value === 'yes' || value === 'true';
    } else if (line.startsWith('BIN:')) {
      result.bin = line.replace(/^BIN:\s*/i, '').trim();
    }
  }

  // Validate we have essential fields
  if (!result.item || !result.material) {
    return null;
  }

  return result;
}

/**
 * Convert image file to base64 data URL
 */
export function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

