import { supabase } from "../../lib/supabaseClient";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function getFunctionUrl(functionName) {
  const base = requiredEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
  return `${base}/functions/v1/${functionName}`;
}

function buildHeaders(accessToken) {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return {
    "Content-Type": "application/json",
    ...(anon ? { apikey: anon } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export async function fetchAnonQuota() {
  const response = await fetch(getFunctionUrl("anon-quota"), {
    method: "GET",
    headers: buildHeaders(),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || "Unable to load guest quota.");
  }
  return response.json();
}

export async function lookupZipByCoords({ lat, lon }) {
  const response = await fetch(getFunctionUrl("zip-lookup"), {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ lat, lon }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || "Unable to look up ZIP from location.");
  }
  return response.json();
}

export async function callRevive({
  mode,
  itemName,
  imageBase64,
  zip,
  useWebSearch = true,
  accessToken,
  selectedCandidate,
  candidateOnly = false,
}) {
  const response = await fetch(getFunctionUrl("revive"), {
    method: "POST",
    headers: buildHeaders(accessToken),
    body: JSON.stringify({
      mode,
      itemName: itemName || undefined,
      imageBase64: imageBase64 || undefined,
      zip: zip || undefined,
      useWebSearch,
      selectedCandidate: selectedCandidate || undefined,
      candidateOnly,
    }),
  });

  const quota = {
    used: Number(response.headers.get("x-revive-guest-used") || 0),
    remaining: Number(response.headers.get("x-revive-guest-remaining") || 0),
    limit: Number(response.headers.get("x-revive-guest-limit") || 5),
  };

  const payload = await response.json().catch(async () => {
    const text = await response.text().catch(() => "");
    return { error: text || "Unexpected response." };
  });

  if (!response.ok) {
    const error = new Error(payload?.error || "ReVive request failed.");
    error.status = response.status;
    error.payload = payload;
    error.quota = quota;
    throw error;
  }

  const text =
    payload?.text ||
    payload?.choices?.[0]?.message?.content ||
    payload?.output_text ||
    "";

  return { text, payload, quota };
}

export async function callDeleteAccount(accessToken) {
  const response = await fetch(getFunctionUrl("delete-account"), {
    method: "POST",
    headers: buildHeaders(accessToken),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || "Unable to delete account.");
  }
  return response.json();
}

export async function fetchPublicLeaderboard(limit = 50) {
  // Preferred signature based on prompt.
  const attempts = [{ limit }, { p_limit: limit }, { _limit: limit }, {}];

  for (const args of attempts) {
    const { data, error } = await supabase.rpc("get_public_leaderboard", args);
    if (!error) {
      return Array.isArray(data) ? data : [];
    }
  }
  throw new Error("Public leaderboard RPC is unavailable.");
}

export async function fetchUserImpactTotals(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("impact_entries")
    .select("points,recyclable,scan_count")
    .eq("user_id", userId);
  if (error) throw error;
  const rows = Array.isArray(data) ? data : [];
  return rows.reduce(
    (acc, row) => {
      const scans = Number(row?.scan_count ?? 1);
      acc.totalScans += scans;
      acc.points += Number(row?.points ?? 0);
      if (row?.recyclable) acc.recyclableCount += 1;
      return acc;
    },
    { totalScans: 0, points: 0, recyclableCount: 0 }
  );
}

export async function upsertImpactEntry(entry, userId) {
  if (!entry || !userId) return;
  const dayKey = String(entry.createdAt || new Date().toISOString()).slice(0, 10);
  const itemKey = `${entry.item || "unknown"}|${entry.material || "unknown"}|${entry.bin || "unknown"}`
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  const payload = {
    user_id: userId,
    item_key: itemKey,
    day_key: dayKey,
    item: entry.item || "unknown",
    material: entry.material || "unknown",
    recyclable: entry.recyclable === true,
    bin: entry.bin || "trash",
    notes: entry.notes || "",
    scanned_at: entry.createdAt || new Date().toISOString(),
    points: entry.source === "photo" && entry.recyclable ? 1 : 0,
    scan_count: Number(entry.scanCount || 1),
    source: entry.source || "photo",
  };

  const { error } = await supabase.from("impact_entries").upsert(payload, {
    onConflict: "user_id,item_key,day_key",
  });
  if (error) throw error;
}
