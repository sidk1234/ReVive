// supabase/functions/revive/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type OpenAIChatReq = {
  mode: "image" | "text";
  itemName?: string;
  imageBase64?: string;
  zip?: string;
  useWebSearch?: boolean;
  selectedCandidate?: string;
  candidateOnly?: boolean;
};

const DAILY_GUEST_LIMIT = 5;

function json(status: number, body: unknown, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      ...extraHeaders,
    },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function getSupabaseAnon() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

async function getUserFromAuthHeader(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.toLowerCase().startsWith("bearer ")) return null;
  const token = auth.slice("bearer ".length);

  const supabase = getSupabaseAnon();
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data.user ?? null;
}

async function bumpGuestQuotaOrThrow(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  const xff = req.headers.get("x-forwarded-for") ?? "";
  const fp = await sha256Hex(`${ua}||${xff}`);

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.rpc("bump_anon_usage", { p_fp_hash: fp });
  if (error) return { ok: false as const, reason: "quota_rpc_failed", detail: error.message };

  const used = Number(data ?? 0);
  const remaining = Math.max(0, DAILY_GUEST_LIMIT - used);

  if (used > DAILY_GUEST_LIMIT) {
    return { ok: false as const, reason: "quota_exceeded", used, remaining: 0, limit: DAILY_GUEST_LIMIT };
  }
  return { ok: true as const, used, remaining, limit: DAILY_GUEST_LIMIT };
}

function buildAnalysisPrompt({
  zip,
  itemDescription,
  selectedCandidate,
}: {
  zip?: string;
  itemDescription?: string;
  selectedCandidate?: string;
}) {
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
You must NOT say: typically, usually, may be, might be, check local rules, varies by location.
You must NOT hedge or speculate.

CONSISTENCY RULE (FRONT / BACK SCANS)
If the same item is scanned from different angles, treat it as the same product and converge to one stable answer.

IDENTIFICATION RULES
- Identify the exact product using visible branding/labels if possible
- Do NOT invent brand names
- If no exact name is visible, provide a concise generic item name

MATERIAL RULES
- Determine the primary material from visual cues or labels
- Do NOT default to plastic for bottles
- Use "unknown" ONLY if the material truly cannot be determined

RESPONSE FORMAT (STRICT)
Plain text only. NO JSON. NO markdown. NO URLs.

OUTPUT FORMAT (EXACT - DO NOT MODIFY)
NOTES: <item-specific prep or "No special prep.">
ITEM: <exact product name or concise generic name>
MATERIAL: <material>
RECYCLABLE: <yes/no>
BIN: <specific local bin or disposal instruction>
`;

  if (selectedCandidate && selectedCandidate.trim().length > 0) {
    prompt += `
User selected item: ${selectedCandidate.trim()}
Treat the selected item as the only target for analysis.
`;
  }

  if (itemDescription && itemDescription.trim().length > 0) {
    prompt += `
Text-only input rules:
* No image is provided. Use the text description as the source of truth.
* Do NOT mention that no image was provided.
* Do NOT invent brands or details not in the description.
* If the text is NOT a physical item description, return:
  NOTES: Invalid request
  ITEM: unknown
  MATERIAL: unknown
  RECYCLABLE: no
  BIN: Not applicable

Item description: ${itemDescription.trim()}
`;
  }

  if (zip && zip.trim()) {
    prompt += `
Use ZIP code ${zip.trim()} to tailor guidance. The answer must be based on local program rules for that ZIP.`;
  } else {
    prompt += `
No location provided; answer for typical US curbside recycling.`;
  }
  return prompt;
}

function buildCandidatePrompt() {
  return `List the distinct physical items visible in the photo. Return 3-6 short labels.
Each item must be on its own line starting with a dash. Do NOT include explanations.`;
}

function extractOutputText(payload: any): string {
  if (!payload) return "";
  if (typeof payload.output_text === "string" && payload.output_text.trim()) return payload.output_text.trim();
  if (Array.isArray(payload.output)) {
    for (const out of payload.output) {
      if (Array.isArray(out?.content)) {
        for (const piece of out.content) {
          if (piece?.type === "output_text" && piece?.text) {
            return String(piece.text).trim();
          }
        }
      }
    }
  }
  return "";
}

async function callOpenAIText(payload: OpenAIChatReq) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return json(500, { error: "Missing OPENAI_API_KEY secret" });

  const itemName = (payload.itemName ?? "").trim();
  if (!itemName) return json(400, { error: "Missing itemName" });

  const zip = (payload.zip ?? "").trim();
  const system = buildAnalysisPrompt({ zip, itemDescription: itemName });
  const user = "Return the recyclability decision in the required format.";

  const body = {
    model: "gpt-4o-mini-search-preview",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.2,
  };

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });

  const text = await resp.text();
  if (!resp.ok) return json(resp.status, { error: "OpenAI error", detail: text });
  return new Response(text, { headers: { "content-type": "application/json" } });
}

async function callOpenAIImage({
  imageBase64,
  prompt,
  useWebSearch,
}: {
  imageBase64: string;
  prompt: string;
  useWebSearch: boolean;
}) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return json(500, { error: "Missing OPENAI_API_KEY secret" });

  const body: Record<string, unknown> = {
    model: "gpt-4o-mini",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          { type: "input_image", image_url: imageBase64 },
        ],
      },
    ],
  };

  if (useWebSearch) {
    body.tools = [{ type: "web_search" }];
    body.tool_choice = "auto";
  }

  const resp = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) return json(resp.status, { error: "OpenAI error", detail: data });
  return json(200, { raw: data });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "authorization, content-type",
        "access-control-allow-methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const user = await getUserFromAuthHeader(req);
  let quota: { used: number; remaining: number; limit: number } | null = null;

  if (!user) {
    const q = await bumpGuestQuotaOrThrow(req);
    if (!q.ok) return json(429, { error: "Guest quota exceeded", ...q });
    quota = { used: q.used, remaining: q.remaining, limit: q.limit };
  }

  let payload: OpenAIChatReq;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const extraHeaders: Record<string, string> = {};
  if (quota) {
    extraHeaders["x-revive-guest-used"] = String(quota.used);
    extraHeaders["x-revive-guest-remaining"] = String(quota.remaining);
    extraHeaders["x-revive-guest-limit"] = String(quota.limit);
  }

  if (payload.mode === "text") {
    const res = await callOpenAIText(payload);
    res.headers.set("access-control-allow-origin", "*");
    Object.entries(extraHeaders).forEach(([key, value]) => res.headers.set(key, value));
    return res;
  }

  if (!payload.imageBase64) {
    return json(400, { error: "Missing imageBase64" }, extraHeaders);
  }

  const zip = (payload.zip ?? "").trim();

  if (payload.candidateOnly) {
    const candidatePrompt = buildCandidatePrompt();
    const response = await callOpenAIImage({
      imageBase64: payload.imageBase64,
      prompt: candidatePrompt,
      useWebSearch: false,
    });
    const data = await response.json().catch(() => ({}));
    const text = extractOutputText(data?.raw);
    const candidates = text
      .split(/\r?\n/)
      .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
      .filter((line) => line.length > 0)
      .slice(0, 8);
    return json(200, { text, candidates }, extraHeaders);
  }

  const analysisPrompt = buildAnalysisPrompt({
    zip,
    selectedCandidate: payload.selectedCandidate,
  });
  const response = await callOpenAIImage({
    imageBase64: payload.imageBase64,
    prompt: analysisPrompt,
    useWebSearch: Boolean(payload.useWebSearch && zip),
  });
  const data = await response.json().catch(() => ({}));
  const text = extractOutputText(data?.raw);
  return json(200, { text }, extraHeaders);
});
