import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type OpenAIResponseItem = {
  type?: string;
  role?: string;
  content?: { type?: string; text?: string }[];
};

type ChatChoice = {
  message?: { content?: string };
};

const allowedOrigins = (Deno.env.get("CORS_ORIGINS") ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const baseCorsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Vary": "Origin",
};

function resolveCorsHeaders(origin: string | null) {
  if (!origin) {
    return { ...baseCorsHeaders };
  }
  if (allowedOrigins.includes(origin)) {
    return { ...baseCorsHeaders, "Access-Control-Allow-Origin": origin };
  }
  return { ...baseCorsHeaders };
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
  origin: string | null = null,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...resolveCorsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
}

function parseOutputText(data: { output?: OpenAIResponseItem[] }) {
  const output = data.output ?? [];
  const texts = output
    .flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text ?? "")
    .filter((text) => text.length > 0);
  return texts.join("\n");
}

function parseChatText(data: { choices?: ChatChoice[] }) {
  const texts = (data.choices ?? [])
    .map((choice) => choice.message?.content ?? "")
    .filter((text) => text.length > 0);
  return texts.join("\n");
}

const maxImageBytes = Number(Deno.env.get("MAX_IMAGE_BYTES") ?? "2500000");
const allowWebSearch = Deno.env.get("ALLOW_WEB_SEARCH") === "true";
const authCacheTtlMs = Number(Deno.env.get("AUTH_CACHE_TTL_MS") ?? "60000");
const rateLimitWindowMs = Number(Deno.env.get("RATE_LIMIT_WINDOW_MS") ?? "60000");
const rateLimitMax = Number(Deno.env.get("RATE_LIMIT_MAX") ?? "60");

const authCache = new Map<string, { userId: string; expiresAt: number }>();
const rateLimitCache = new Map<string, { windowStart: number; count: number }>();

function estimateBase64Bytes(base64: string) {
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function extractBase64(dataUrl: string) {
  const marker = "base64,";
  const index = dataUrl.indexOf(marker);
  if (index === -1) return null;
  return dataUrl.slice(index + marker.length).trim();
}

async function requireAuth(
  req: Request,
  origin: string | null,
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  if (!supabaseUrl || !anonKey) {
    return jsonResponse({ error: "Missing Supabase config." }, 500, origin);
  }

  const cached = authCache.get(authHeader);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return { userId: cached.userId };
  }

  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: authHeader,
      apikey: anonKey,
    },
  });

  if (!res.ok) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }

  let data: { id?: string };
  try {
    data = await res.json();
  } catch {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }
  if (!data.id) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }

  authCache.set(authHeader, {
    userId: data.id,
    expiresAt: now + authCacheTtlMs,
  });
  if (authCache.size > 2000) {
    authCache.clear();
  }

  return { userId: data.id };
}

function checkRateLimit(key: string, origin: string | null) {
  if (rateLimitMax <= 0) return null;
  const now = Date.now();
  const cached = rateLimitCache.get(key);
  if (!cached || now - cached.windowStart > rateLimitWindowMs) {
    rateLimitCache.set(key, { windowStart: now, count: 1 });
    return null;
  }

  cached.count += 1;
  rateLimitCache.set(key, cached);
  if (cached.count > rateLimitMax) {
    return jsonResponse({ error: "Rate limit exceeded." }, 429, origin);
  }
  return null;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  if (origin && !allowedOrigins.includes(origin)) {
    return jsonResponse({ error: "Origin not allowed." }, 403, origin);
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: resolveCorsHeaders(origin) });
  }

  if (req.method === "POST") {
    // Determine userId. If an Authorization header is present use requireAuth, otherwise treat as guest.
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      const authResult = await requireAuth(req, origin);
      if (authResult instanceof Response) {
        return authResult;
      }
      userId = authResult.userId;
      const rateLimitError = checkRateLimit(userId, origin);
      if (rateLimitError) return rateLimitError;
    } else {
      // guest user (not authenticated). You may enforce guest quotas here via a separate RPC.
      userId = null;
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY") ?? "";
    if (!apiKey) {
      return jsonResponse({ error: "Missing OPENAI_API_KEY." }, 500, origin);
    }

    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body." }, 400, origin);
    }

    // Determine mode and prompt / itemName
    const mode = payload.mode ?? (payload.imageBase64 || payload.image ? "image" : "text");
    const promptText = payload.prompt ?? payload.itemName ?? "";
    if (!promptText) {
      return jsonResponse({ error: "Missing prompt or item name." }, 400, origin);
    }

    if (mode === "image") {
      // Accept either imageBase64 (from ReVive PWA) or legacy image field
      const imageData = payload.imageBase64 ?? payload.image;
      if (!imageData) {
        return jsonResponse({ error: "Missing image." }, 400, origin);
      }
      const base64 = extractBase64(imageData);
      if (!base64) {
        return jsonResponse({ error: "Invalid image format." }, 400, origin);
      }
      if (estimateBase64Bytes(base64) > maxImageBytes) {
        return jsonResponse({ error: "Image too large." }, 413, origin);
      }
      // Note: optional context image is ignored in this simplified version
      const body = {
        model: "gpt-4o-mini",
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: promptText },
              { type: "input_image", image_url: imageData },
            ],
          },
        ],
        max_output_tokens: payload.maxOutputTokens ?? 400,
        tools: allowWebSearch && payload.useWebSearch
          ? [{ type: "web_search" }]
          : undefined,
      };
      const res = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("OpenAI response error", data);
        return jsonResponse({ error: "Upstream error." }, res.status, origin);
      }
      const text = parseOutputText(data);
      if (!text) {
        return jsonResponse({ error: "No text returned." }, 502, origin);
      }
      return jsonResponse({ text }, 200, origin);
    }

    // text mode (default). Use gpt-4o-mini-search-preview via chat completions
    const body = {
      model: "gpt-4o-mini-search-preview",
      messages: [{ role: "user", content: promptText }],
      max_tokens: payload.maxOutputTokens ?? 400,
    };
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("OpenAI chat error", data);
      return jsonResponse({ error: "Upstream error." }, res.status, origin);
    }
    const text = parseChatText(data);
    if (!text) {
      return jsonResponse({ error: "No text returned." }, 502, origin);
    }
    return jsonResponse({ text }, 200, origin);
  }

  // All other requests return 404
  return jsonResponse({ error: "Not found." }, 404, origin);
});
