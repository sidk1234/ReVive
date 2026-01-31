/**
 * Anonymous quota management
 */
export async function getAnonymousQuota() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return { limit: 5, remaining: 5 };
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/anon-quota`, {
      method: 'GET',
    });

    if (!response.ok) {
      return { limit: 5, remaining: 5 };
    }

    const data = await response.json();
    return {
      limit: data.limit || 5,
      remaining: data.remaining || 5,
    };
  } catch (error) {
    console.error('Quota check error:', error);
    return { limit: 5, remaining: 5 };
  }
}

export async function bumpAnonymousUsage(fpHash) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return;
    }

    // Call the RPC to bump usage
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    await supabase.rpc('bump_anon_usage', { fp_hash: fpHash });
  } catch (error) {
    console.error('Bump quota error:', error);
  }
}

/**
 * Generate a simple fingerprint hash for anonymous users
 */
export function generateFingerprint() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return 'browser-required';
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('ReVive fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ].join('|');

  // Simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

