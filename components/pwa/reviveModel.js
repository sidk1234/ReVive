export const THEME_MODES = ["system", "light", "dark"];

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "for",
  "with",
  "without",
  "in",
  "on",
  "at",
  "to",
  "from",
  "by",
  "into",
  "over",
  "under",
  "this",
  "that",
  "these",
  "those",
  "item",
  "recyclable",
  "recycling",
]);

export function clampZip(value) {
  const digits = String(value || "").replace(/\D+/g, "");
  return digits.slice(0, 5);
}

export function normalizeSource(value) {
  return value === "text" ? "text" : "photo";
}

function normalizeMaterial(value) {
  const input = String(value || "").trim().toLowerCase();
  if (!input || input.includes("unknown")) return "unknown";
  return input.replace(/\s+/g, " ").trim();
}

function tokenize(text) {
  const clean = String(text || "").toLowerCase();
  return new Set(
    clean
      .split(/[^a-z0-9]+/i)
      .map((word) => word.trim())
      .filter(Boolean)
      .filter((word) => !STOPWORDS.has(word))
      .map((word) => {
        if (word.length > 3 && word.endsWith("s")) return word.slice(0, -1);
        return word;
      })
  );
}

function tokenSet(item, material, includeMaterial = true) {
  const tokens = tokenize(item);
  const materialToken = normalizeMaterial(material);
  if (materialToken !== "unknown") {
    tokens.delete(materialToken);
    if (includeMaterial) tokens.add(materialToken);
  }
  return tokens;
}

function similarityTokenSet(item, material) {
  const tokens = tokenSet(item, material, false);
  if (tokens.size === 0) return tokenSet(item, material, true);
  return tokens;
}

function areSimilarTokens(lhs, rhs) {
  if (!lhs.size || !rhs.size) return false;
  let intersection = 0;
  lhs.forEach((value) => {
    if (rhs.has(value)) intersection += 1;
  });
  const union = new Set([...lhs, ...rhs]).size;
  const jaccard = intersection / union;
  const minCount = Math.min(lhs.size, rhs.size);
  if (minCount <= 2) {
    return intersection >= 1 && jaccard >= 0.34;
  }
  return intersection >= Math.min(2, minCount) && jaccard >= 0.5;
}

export function findDuplicateIndex(entries, incoming) {
  const incomingTokens = similarityTokenSet(incoming.item, incoming.material);
  const incomingMaterial = normalizeMaterial(incoming.material);

  for (let index = 0; index < entries.length; index += 1) {
    const row = entries[index];
    const rowMaterial = normalizeMaterial(row.material);
    if (
      rowMaterial !== "unknown" &&
      incomingMaterial !== "unknown" &&
      rowMaterial !== incomingMaterial
    ) {
      continue;
    }
    const rowTokens = similarityTokenSet(row.item, row.material);
    if (areSimilarTokens(rowTokens, incomingTokens)) {
      return index;
    }
  }
  return -1;
}

export function getPoints(entry) {
  return entry.source === "photo" && entry.recyclable ? 1 : 0;
}

export function makeHistoryEntry({
  parsed,
  rawText,
  source,
  zip,
  imagePreview = null,
  selectedCandidate = null,
  createdAt = new Date().toISOString(),
  scanCount = 1,
}) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `h_${Date.now()}_${Math.random()}`,
    createdAt,
    item: String(parsed?.item || "unknown").trim() || "unknown",
    material: String(parsed?.material || "unknown").trim() || "unknown",
    recyclable: Boolean(parsed?.recyclable),
    bin: String(parsed?.bin || "trash").trim() || "trash",
    notes: String(parsed?.notes || parsed?.instructions || "No special prep.").trim(),
    rawText: String(rawText || ""),
    source: normalizeSource(source),
    zip: clampZip(zip),
    scanCount: Number(scanCount) > 0 ? Number(scanCount) : 1,
    imagePreview,
    selectedCandidate: selectedCandidate || "",
  };
}

export function mergeHistoryEntry(existing, incoming) {
  const shouldUpdateDetails = incoming.source === "photo" || existing.source === "text";
  return {
    ...existing,
    createdAt: incoming.createdAt,
    item: shouldUpdateDetails ? incoming.item : existing.item,
    material: shouldUpdateDetails ? incoming.material : existing.material,
    recyclable: shouldUpdateDetails ? incoming.recyclable : existing.recyclable,
    bin: shouldUpdateDetails ? incoming.bin : existing.bin,
    notes: shouldUpdateDetails ? incoming.notes : existing.notes,
    rawText: shouldUpdateDetails ? incoming.rawText : existing.rawText,
    source: existing.source === "photo" || incoming.source === "photo" ? "photo" : "text",
    zip: shouldUpdateDetails ? incoming.zip : existing.zip,
    scanCount: Math.max(1, Number(existing.scanCount || 1)) + 1,
    imagePreview:
      shouldUpdateDetails && incoming.imagePreview ? incoming.imagePreview : existing.imagePreview,
    selectedCandidate:
      shouldUpdateDetails && incoming.selectedCandidate
        ? incoming.selectedCandidate
        : existing.selectedCandidate,
  };
}

export function computeHistoryTotals(entries) {
  const rows = Array.isArray(entries) ? entries : [];
  const scored = rows.filter((row) => row.source === "photo");
  return scored.reduce(
    (acc, row) => {
      acc.totalScans += Number(row.scanCount || 1);
      if (row.recyclable) acc.recyclableCount += 1;
      acc.points += getPoints(row);
      return acc;
    },
    { totalScans: 0, recyclableCount: 0, points: 0 }
  );
}

export function normalizeLeaderboardRows(rows) {
  const list = Array.isArray(rows) ? rows : [];
  return list
    .map((row) => ({
      id:
        row.user_id ||
        row.id ||
        `${row.display_name || "anonymous"}-${row.total_points || row.points || 0}`,
      displayName: row.display_name || row.full_name || row.organization_name || "Anonymous",
      totalPoints: Number(row.total_points ?? row.points ?? 0),
      totalScans: Number(row.total_scans ?? row.scans ?? row.scan_count ?? 0),
      recyclableCount: Number(
        row.recyclable_count ?? row.recyclable_scans ?? row.recyclables ?? 0
      ),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);
}
