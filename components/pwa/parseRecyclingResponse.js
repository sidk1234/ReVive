// Ported from ReViveApp (Swift) CameraViewModel.parseResponse() + sanitizeOutput()

export function parseRecyclingResponse(rawText) {
  const cleaned = sanitizeOutput(rawText || "");

  // 1) Straight JSON
  try {
    return JSON.parse(cleaned);
  } catch {
    // continue
  }

  // 2) JSON inside larger text
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      // continue
    }
  }

  // 3) Fallback key-value parsing
  const obj = {};
  for (const line of cleaned.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const val = line.slice(idx + 1).trim();
    if (!key || !val) continue;
    obj[key] = val;
  }

  // Map known keys
  const recyclable = parseBool(obj.recyclable ?? obj["is recyclable"]);
  return {
    item: obj.item ?? obj.product ?? "unknown",
    material: obj.material ?? "",
    recyclable: recyclable ?? false,
    bin: normalizeBin(obj.bin ?? "trash"),
    instructions: obj.instructions ?? "",
    reason: obj.reason ?? obj.why ?? "",
    local_program: obj.local_program ?? obj.program ?? "",
    confidence: clamp01(parseFloat(obj.confidence ?? "0")),
  };
}

function sanitizeOutput(text) {
  let t = (text || "").trim();

  // Strip markdown code fences
  t = t.replace(/```json\s*/gi, "").replace(/```/g, "");

  // Remove citations like [1], [2]
  t = t.replace(/\[\d+\]/g, "");

  // Remove raw URLs
  t = t.replace(/https?:\/\/\S+/g, "");

  // Remove lines like "Sources:" or "References:" if present
  t = t
    .split("\n")
    .filter(
      (l) =>
        !/^\s*(sources|references)\s*:/i.test(l.trim()) &&
        l.trim().length > 0
    )
    .join("\n");

  return t.trim();
}

function parseBool(v) {
  if (typeof v === "boolean") return v;
  if (typeof v !== "string") return null;
  const s = v.trim().toLowerCase();
  if (["true", "yes", "y", "1"].includes(s)) return true;
  if (["false", "no", "n", "0"].includes(s)) return false;
  return null;
}

function normalizeBin(v) {
  const s = String(v || "").trim().toLowerCase();
  if (s.includes("compost")) return "compost";
  if (s.includes("special") || s.includes("drop")) return "special_dropoff";
  if (s.includes("recycl")) return "recycling";
  return "trash";
}

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
