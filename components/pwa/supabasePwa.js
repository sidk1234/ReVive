import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export function useSupabaseSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export async function callRecyclingEdgeFunction({
  accessToken,
  prompt,
  imageDataUrl,
  contextImageDataUrl,
  mode = "image",
  maxOutputTokens = 450,
  useWebSearch = true,
}) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/rec-ai/openai`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
        : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({
      mode,
      prompt,
      image: imageDataUrl ?? null,
      contextImage: contextImageDataUrl ?? null,
      maxOutputTokens,
      useWebSearch,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Edge function error (${res.status}): ${text || res.statusText}`
    );
  }

  return res.json();
}

export async function safeSelectProfile(userId) {
  if (!userId) return { profile: null, error: null };
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, total_recycled, role")
      .eq("id", userId)
      .maybeSingle();
    return { profile: data ?? null, error };
  } catch (e) {
    return { profile: null, error: e };
  }
}

export async function safeFetchLeaderboard() {
  // Preferred: reuse existing profiles.total_recycled in revive-main-6
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, total_recycled")
      .order("total_recycled", { ascending: false })
      .limit(50);
    if (!error) return { rows: data ?? [], source: "profiles" };
  } catch {
    // ignore
  }

  // Fallback: if your backend still has the swift-era view
  try {
    const { data, error } = await supabase
      .from("impact_leaderboard")
      .select("user_id, username, total_points")
      .limit(50);
    if (!error) return { rows: data ?? [], source: "impact_leaderboard" };
  } catch {
    // ignore
  }

  return { rows: [], source: "none" };
}
