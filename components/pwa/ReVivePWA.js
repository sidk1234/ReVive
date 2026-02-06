import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  App,
  Block,
  Button,
  Card,
  Page,
  Segmented,
  SegmentedButton,
  Sheet,
  Tabbar,
  TabbarLink,
  ToolbarPane,
  Toast,
  Toggle,
} from "konsta/react";
import {
  Arrow2Circlepath,
  Arrow3Trianglepath,
  ArrowRightSquare,
  CameraFill,
  Checkmark,
  CheckmarkSealFill,
  ChevronRight,
  ClockFill,
  GearAltFill,
  LocationFill,
  LogoApple,
  LogoGoogle,
  PaperplaneFill,
  PersonCropCircleFill,
  PhotoOnRectangle,
  Sparkles,
  Xmark,
} from "framework7-icons/react";
import { Globe2, Leaf, TreePine, Trees } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import {
  callRevive,
  fetchPublicLeaderboard,
  lookupZipByCoords,
  upsertImpactEntry,
} from "./reviveApi";
import {
  clampZip,
  computeHistoryTotals,
  findDuplicateIndex,
  makeHistoryEntry,
  mergeHistoryEntry,
  normalizeLeaderboardRows,
} from "./reviveModel";
import { parseRecyclingResponse } from "./parseRecyclingResponse";
import { useLocalStorageState } from "./useLocalStorageState";
import { useSupabaseSession } from "./supabasePwa";

const TAB_KEYS = {
  settings: "settings",
  account: "account",
  capture: "capture",
  impact: "impact",
  ranks: "ranks",
};

const TAB_PATHS = {
  [TAB_KEYS.settings]: "/settings",
  [TAB_KEYS.account]: "/account",
  [TAB_KEYS.capture]: "/capture",
  [TAB_KEYS.impact]: "/impact",
  [TAB_KEYS.ranks]: "/ranks",
};

const BADGES = [
  { title: "Sprout", threshold: 1, detail: "Recycle 1 item", icon: Leaf },
  { title: "Seedling", threshold: 5, detail: "Recycle 5 items", icon: Leaf },
  { title: "Sapling", threshold: 15, detail: "Recycle 15 items", icon: TreePine },
  { title: "Grove", threshold: 30, detail: "Recycle 30 items", icon: Trees },
  {
    title: "Forest",
    threshold: 60,
    detail: "Recycle 60 items",
    icon: Trees,
  },
  {
    title: "Earthkeeper",
    threshold: 120,
    detail: "Recycle 120 items",
    icon: Globe2,
  },
];

const THEME_OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const PAGE_COLORS = {
  bgIos: "bg-transparent",
  bgMaterial: "bg-transparent",
};

const PwaContext = createContext(null);

function usePwa() {
  const ctx = useContext(PwaContext);
  if (!ctx) {
    throw new Error("PwaContext missing");
  }
  return ctx;
}

function useSystemDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setIsDark(Boolean(media.matches));
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  return isDark;
}

function readTabFromPath(pathname, fallback = TAB_KEYS.capture) {
  if (!pathname) return fallback;
  const parts = String(pathname).replace(/\/+$/, "").split("/").filter(Boolean);
  if (!parts.length) return fallback;
  if (parts[0] !== "app") return fallback;
  const key = parts[1] || "capture";
  if (key === "settings") return TAB_KEYS.settings;
  if (key === "account") return TAB_KEYS.account;
  if (key === "impact") return TAB_KEYS.impact;
  if (key === "ranks" || key === "leaderboard") return TAB_KEYS.ranks;
  if (key === "capture" || key === "scan") return TAB_KEYS.capture;
  return fallback;
}

function formatBinLabel(value) {
  const token = String(value || "").toLowerCase();
  if (token.includes("compost")) return "Compost";
  if (token.includes("special") || token.includes("drop")) return "Special drop-off";
  if (token.includes("recycl")) return "Recycling";
  return "Trash";
}

function parseReviveText(text, payload) {
  if (payload?.item && payload?.material) {
    return {
      item: String(payload.item || "unknown"),
      material: String(payload.material || "unknown"),
      recyclable: Boolean(payload.recyclable),
      bin: formatBinLabel(payload.bin || "trash"),
      notes: String(payload.notes || payload.instructions || "No special prep."),
    };
  }
  const parsed = parseRecyclingResponse(String(text || ""));
  return {
    item: String(parsed?.item || "unknown"),
    material: String(parsed?.material || "unknown"),
    recyclable: Boolean(parsed?.recyclable),
    bin: formatBinLabel(parsed?.bin || "trash"),
    notes: String(parsed?.instructions || parsed?.reason || "No special prep."),
  };
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function ReVivePWA({ initialTab = "capture" }) {
  const normalizedInitial = initialTab === "scan" ? TAB_KEYS.capture : initialTab;
  const initial = useMemo(() => {
    if (typeof window === "undefined") return normalizedInitial;
    return readTabFromPath(window.location.pathname, normalizedInitial);
  }, [normalizedInitial]);

  const { session, user, loading: authLoading } = useSupabaseSession();
  const signedIn = Boolean(session?.user?.id);
  const isAdmin = Boolean(
    user?.app_metadata?.role === "admin" || user?.user_metadata?.role === "admin"
  );

  const [activeTab, setActiveTab] = useState(initial);
  const [themeMode, setThemeMode] = useLocalStorageState("revive.themeMode", "system");
  const [defaultZip, setDefaultZip] = useLocalStorageState("revive.defaultZip", "");
  const [allowWebSearch, setAllowWebSearch] = useLocalStorageState(
    "revive.allowWebSearch",
    true
  );
  const [autoSyncImpact, setAutoSyncImpact] = useLocalStorageState(
    "revive.autoSyncImpact",
    true
  );
  const [showCaptureInstructions, setShowCaptureInstructions] = useLocalStorageState(
    "revive.captureInstructions",
    true
  );
  const [enableHaptics, setEnableHaptics] = useLocalStorageState(
    "revive.enableHaptics",
    true
  );
  const [reduceMotion, setReduceMotion] = useLocalStorageState(
    "revive.reduceMotion",
    false
  );
  const [historyEntries, setHistoryEntries] = useLocalStorageState("revive.history.v5", []);
  const [entrySheet, setEntrySheet] = useState(null);
  const [toast, setToast] = useState({ opened: false, text: "" });
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const systemDark = useSystemDarkMode();
  const effectiveDark = themeMode === "system" ? systemDark : themeMode === "dark";
  const themeClass = effectiveDark ? "revive-theme-dark" : "revive-theme-light";

  const totals = useMemo(() => computeHistoryTotals(historyEntries), [historyEntries]);

  const pushToast = useCallback((text) => {
    if (!text) return;
    setToast({ opened: true, text: String(text) });
  }, []);

  const navigateTab = useCallback((tab) => {
    const next = TAB_PATHS[tab] || TAB_PATHS[TAB_KEYS.capture];
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", `/app${next}`);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const syncTab = () => setActiveTab(readTabFromPath(window.location.pathname, normalizedInitial));
    syncTab();
    window.addEventListener("popstate", syncTab);
    return () => window.removeEventListener("popstate", syncTab);
  }, [normalizedInitial]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("revive-theme-dark", effectiveDark);
    document.documentElement.classList.toggle("revive-theme-light", !effectiveDark);
    document.documentElement.classList.toggle("dark", effectiveDark);
  }, [effectiveDark]);

  useEffect(() => {
    if (!signedIn) return;
    const prefs = user?.user_metadata?.preferences;
    if (!prefs) return;
    if (prefs.default_zip && !defaultZip) setDefaultZip(prefs.default_zip);
    if (prefs.appearance) setThemeMode(prefs.appearance);
    if (typeof prefs.enable_haptics === "boolean") setEnableHaptics(prefs.enable_haptics);
    if (typeof prefs.show_capture_instructions === "boolean")
      setShowCaptureInstructions(prefs.show_capture_instructions);
    if (typeof prefs.auto_sync_impact === "boolean") setAutoSyncImpact(prefs.auto_sync_impact);
    if (typeof prefs.allow_web_search === "boolean") setAllowWebSearch(prefs.allow_web_search);
    if (typeof prefs.reduce_motion === "boolean") setReduceMotion(prefs.reduce_motion);
  }, [
    signedIn,
    user?.user_metadata?.preferences,
    defaultZip,
    setAllowWebSearch,
    setAutoSyncImpact,
    setDefaultZip,
    setEnableHaptics,
    setReduceMotion,
    setShowCaptureInstructions,
    setThemeMode,
  ]);

  useEffect(() => {
    if (!signedIn) return;
    const prefs = {
      default_zip: defaultZip || "",
      appearance: themeMode,
      enable_haptics: enableHaptics,
      show_capture_instructions: showCaptureInstructions,
      auto_sync_impact: autoSyncImpact,
      allow_web_search: allowWebSearch,
      reduce_motion: reduceMotion,
    };
    const payload = { preferences: prefs };
    supabase.auth
      .updateUser({ data: payload })
      .catch(() => {
        // best-effort sync
      });
  }, [
    signedIn,
    defaultZip,
    themeMode,
    enableHaptics,
    showCaptureInstructions,
    autoSyncImpact,
    allowWebSearch,
    reduceMotion,
  ]);

  const commitHistory = useCallback(
    async ({ parsed, rawText, source, imagePreview }) => {
      const entries = Array.isArray(historyEntries) ? historyEntries : [];
      const entry = makeHistoryEntry({
        parsed,
        rawText,
        source,
        zip: defaultZip,
        imagePreview,
        createdAt: new Date().toISOString(),
      });
      const duplicateIndex = findDuplicateIndex(entries, entry);
      if (duplicateIndex >= 0) {
        const merged = mergeHistoryEntry(entries[duplicateIndex], entry);
        const next = [...entries];
        next.splice(duplicateIndex, 1);
        next.unshift(merged);
        setHistoryEntries(next);
        if (signedIn && autoSyncImpact) {
          await upsertImpactEntry(merged, session.user.id).catch(() => {});
        }
        return { entry: merged, duplicate: true };
      }
      setHistoryEntries([entry, ...entries]);
      if (signedIn && autoSyncImpact) {
        await upsertImpactEntry(entry, session.user.id).catch(() => {});
      }
      return { entry, duplicate: false };
    },
    [
      historyEntries,
      defaultZip,
      setHistoryEntries,
      signedIn,
      autoSyncImpact,
      session?.user?.id,
    ]
  );

  const syncImpactNow = useCallback(async () => {
    if (!signedIn || !session?.user?.id) return;
    const entries = Array.isArray(historyEntries) ? historyEntries : [];
    for (const entry of entries) {
      await upsertImpactEntry(entry, session.user.id).catch(() => {});
    }
    pushToast("Impact synced.");
  }, [historyEntries, pushToast, session?.user?.id, signedIn]);

  useEffect(() => {
    if (!signedIn || !autoSyncImpact || !session?.user?.id) return;
    const entries = Array.isArray(historyEntries) ? historyEntries : [];
    entries.forEach((entry) => {
      upsertImpactEntry(entry, session.user.id).catch(() => {});
    });
  }, [signedIn, autoSyncImpact, session?.user?.id]);

  const signInWithProvider = useCallback(
    async (provider) => {
      if (authBusy) return;
      setAuthBusy(true);
      setAuthError("");
      try {
        const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: `${site}/app/account` },
        });
      } catch (error) {
        setAuthError(error?.message || "Unable to sign in.");
      } finally {
        setAuthBusy(false);
      }
    },
    [authBusy]
  );

  const signOut = useCallback(async () => {
    setAuthError("");
    try {
      await supabase.auth.signOut();
    } catch (error) {
      setAuthError(error?.message || "Unable to sign out.");
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      session,
      user,
      signedIn,
      isAdmin,
      authLoading,
      authBusy,
      authError,
      setAuthError,
      signInWithProvider,
      signOut,
      activeTab,
      navigateTab,
      defaultZip,
      setDefaultZip,
      allowWebSearch,
      setAllowWebSearch,
      autoSyncImpact,
      setAutoSyncImpact,
      showCaptureInstructions,
      setShowCaptureInstructions,
      enableHaptics,
      setEnableHaptics,
      reduceMotion,
      setReduceMotion,
      themeMode,
      setThemeMode,
      historyEntries,
      totals,
      commitHistory,
      syncImpactNow,
      entrySheet,
      setEntrySheet,
      pushToast,
    }),
    [
      session,
      user,
      signedIn,
      isAdmin,
      authLoading,
      authBusy,
      authError,
      setAuthError,
      signInWithProvider,
      signOut,
      activeTab,
      navigateTab,
      defaultZip,
      setDefaultZip,
      allowWebSearch,
      setAllowWebSearch,
      autoSyncImpact,
      setAutoSyncImpact,
      showCaptureInstructions,
      setShowCaptureInstructions,
      enableHaptics,
      setEnableHaptics,
      reduceMotion,
      setReduceMotion,
      themeMode,
      setThemeMode,
      historyEntries,
      totals,
      commitHistory,
      syncImpactNow,
      entrySheet,
      setEntrySheet,
      pushToast,
    ]
  );

  return (
    <App
      theme="ios"
      dark={effectiveDark}
      safeAreas={false}
      className={`revive-pwa-root ${themeClass}`}
    >
      <PwaContext.Provider value={contextValue}>
        {activeTab === TAB_KEYS.capture ? <CapturePage /> : null}
        {activeTab === TAB_KEYS.impact ? <ImpactPage /> : null}
        {activeTab === TAB_KEYS.settings ? <SettingsPage /> : null}
        {activeTab === TAB_KEYS.account ? <AccountPage /> : null}
        {activeTab === TAB_KEYS.ranks ? <LeaderboardPage /> : null}

        <Tabbar
          labels
          icons
          top={false}
          className="revive-tabbar"
          bgClassName="revive-tabbar-bg"
        >
          <ToolbarPane className="revive-tabbar-pane">
            <TabbarLink
              active={activeTab === TAB_KEYS.settings}
              onClick={() => navigateTab(TAB_KEYS.settings)}
              icon={<GearAltFill className="h-6 w-6" />}
              label="Settings"
            />
            <TabbarLink
              active={activeTab === TAB_KEYS.account}
              onClick={() => navigateTab(TAB_KEYS.account)}
              icon={<PersonCropCircleFill className="h-6 w-6" />}
              label="Account"
            />
            <TabbarLink
              active={activeTab === TAB_KEYS.capture}
              onClick={() => navigateTab(TAB_KEYS.capture)}
              icon={<CameraFill className="h-6 w-6" />}
              label="Capture"
            />
            <TabbarLink
              active={activeTab === TAB_KEYS.impact}
              onClick={() => navigateTab(TAB_KEYS.impact)}
              icon={<Leaf className="h-6 w-6" />}
              label="Impact"
            />
            <TabbarLink
              active={activeTab === TAB_KEYS.ranks}
              onClick={() => navigateTab(TAB_KEYS.ranks)}
              icon={<TrophyIcon className="h-6 w-6" />}
              label="Ranks"
            />
          </ToolbarPane>
        </Tabbar>

        <Sheet
          opened={Boolean(entrySheet)}
          onSheetClosed={() => contextValue.setEntrySheet(null)}
          className="revive-sheet"
          backdrop
          push
        >
          {entrySheet ? <ImpactDetailSheet entry={entrySheet} /> : null}
        </Sheet>

        <Toast
          opened={toast.opened}
          text={toast.text}
          onToastClosed={() => setToast({ opened: false, text: "" })}
        />
      </PwaContext.Provider>
    </App>
  );
}

export default ReVivePWA;

function CapturePage() {
  const {
    session,
    signedIn,
    defaultZip,
    setDefaultZip,
    allowWebSearch,
    enableHaptics,
    reduceMotion,
    showCaptureInstructions,
    commitHistory,
    pushToast,
  } = usePwa();

  const [captured, setCaptured] = useState(null);
  const [sourceImage, setSourceImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [edgeOverlay, setEdgeOverlay] = useState(null);
  const [fillOverlay, setFillOverlay] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [analysisError, setAnalysisError] = useState("");
  const [scoreNotice, setScoreNotice] = useState("");
  const [showNoItem, setShowNoItem] = useState(false);
  const [noItemOpacity, setNoItemOpacity] = useState(0);
  const [zipCode, setZipCode] = useState(defaultZip || "");
  const [locationExpanded, setLocationExpanded] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [manualText, setManualText] = useState("");
  const [isTextEntryActive, setIsTextEntryActive] = useState(false);
  const [lastAnalysisSource, setLastAnalysisSource] = useState("photo");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const streamRef = useRef(null);
  const longPressRef = useRef(null);
  const detectorRef = useRef(null);
  const detectorLoadingRef = useRef(false);

  useEffect(() => {
    if (!zipCode && defaultZip) setZipCode(defaultZip);
  }, [defaultZip, zipCode]);

  const handleZipChange = useCallback(
    (value) => {
      const clamped = clampZip(value);
      setZipCode(clamped);
      setDefaultZip(clamped);
      if (clamped) setLocationError("");
    },
    [setDefaultZip]
  );

  useEffect(() => {
    if (captured) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
    let cancelled = false;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        pushToast("Camera access is required to scan items.");
      }
    };
    start();
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [captured, pushToast]);

  const loadDetector = useCallback(async () => {
    if (detectorRef.current || detectorLoadingRef.current) {
      return detectorRef.current;
    }
    detectorLoadingRef.current = true;
    try {
      const tf = await import("@tensorflow/tfjs");
      await import("@tensorflow/tfjs-backend-webgl");
      await tf.setBackend("webgl");
      await tf.ready();
      const coco = await import("@tensorflow-models/coco-ssd");
      const model = await coco.load();
      detectorRef.current = model;
      return model;
    } catch {
      detectorRef.current = null;
      return null;
    } finally {
      detectorLoadingRef.current = false;
    }
  }, []);

  const computeEdgeOverlay = useCallback((image, focusBox) => {
    const base = Math.min(image.width, image.height);
    const size = Math.max(128, Math.min(256, Math.round(base / 3)));
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    const crop = focusBox || { x: 0, y: 0, width: image.width, height: image.height };
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      size,
      size
    );
    const { data } = ctx.getImageData(0, 0, size, size);
    const gray = new Float32Array(size * size);
    for (let i = 0, p = 0; i < gray.length; i += 1, p += 4) {
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    }
    const edges = new Float32Array(size * size);
    let sum = 0;
    let sumSq = 0;
    let count = 0;
    for (let y = 1; y < size - 1; y += 1) {
      for (let x = 1; x < size - 1; x += 1) {
        const idx = y * size + x;
        const gx =
          -gray[idx - size - 1] -
          2 * gray[idx - 1] -
          gray[idx + size - 1] +
          gray[idx - size + 1] +
          2 * gray[idx + 1] +
          gray[idx + size + 1];
        const gy =
          gray[idx - size - 1] +
          2 * gray[idx - size] +
          gray[idx - size + 1] -
          gray[idx + size - 1] -
          2 * gray[idx + size] -
          gray[idx + size + 1];
        const mag = Math.sqrt(gx * gx + gy * gy);
        edges[idx] = mag;
        sum += mag;
        sumSq += mag * mag;
        count += 1;
      }
    }
    const mean = sum / Math.max(count, 1);
    const variance = Math.max(0, sumSq / Math.max(count, 1) - mean * mean);
    const std = Math.sqrt(variance);
    const threshold = Math.max(mean + std * 1.25, 18);
    const edgeMask = new Uint8Array(size * size);
    for (let y = 1; y < size - 1; y += 1) {
      for (let x = 1; x < size - 1; x += 1) {
        const idx = y * size + x;
        if (edges[idx] > threshold) edgeMask[idx] = 1;
      }
    }
    const dilated = new Uint8Array(size * size);
    for (let y = 2; y < size - 2; y += 1) {
      for (let x = 2; x < size - 2; x += 1) {
        const idx = y * size + x;
        if (!edgeMask[idx]) continue;
        for (let dy = -2; dy <= 2; dy += 1) {
          for (let dx = -2; dx <= 2; dx += 1) {
            dilated[idx + dy * size + dx] = 1;
          }
        }
      }
    }
    let minX = size;
    let minY = size;
    let maxX = 0;
    let maxY = 0;
    let edgeCount = 0;
    const edgeData = ctx.createImageData(size, size);
    for (let y = 1; y < size - 1; y += 1) {
      for (let x = 1; x < size - 1; x += 1) {
        const idx = y * size + x;
        if (dilated[idx]) {
          edgeCount += 1;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
          const p = idx * 4;
          edgeData.data[p] = 120;
          edgeData.data[p + 1] = 200;
          edgeData.data[p + 2] = 255;
          edgeData.data[p + 3] = 255;
        }
      }
    }
    if (edgeCount < size * size * 0.002) {
      return null;
    }
    const visited = new Uint8Array(size * size);
    const stack = [];
    for (let x = 0; x < size; x += 1) {
      const topIdx = x;
      const bottomIdx = (size - 1) * size + x;
      if (!dilated[topIdx]) {
        visited[topIdx] = 1;
        stack.push(topIdx);
      }
      if (!dilated[bottomIdx]) {
        visited[bottomIdx] = 1;
        stack.push(bottomIdx);
      }
    }
    for (let y = 0; y < size; y += 1) {
      const leftIdx = y * size;
      const rightIdx = y * size + (size - 1);
      if (!dilated[leftIdx]) {
        visited[leftIdx] = 1;
        stack.push(leftIdx);
      }
      if (!dilated[rightIdx]) {
        visited[rightIdx] = 1;
        stack.push(rightIdx);
      }
    }
    const neighbors = [
      -size,
      size,
      -1,
      1,
      -size - 1,
      -size + 1,
      size - 1,
      size + 1,
    ];
    while (stack.length) {
      const idx = stack.pop();
      for (let i = 0; i < neighbors.length; i += 1) {
        const n = idx + neighbors[i];
        if (n < 0 || n >= size * size) continue;
        if (visited[n] || dilated[n]) continue;
        visited[n] = 1;
        stack.push(n);
      }
    }
    const fillData = ctx.createImageData(size, size);
    let fillCount = 0;
    let fillMinX = size;
    let fillMinY = size;
    let fillMaxX = 0;
    let fillMaxY = 0;
    for (let y = 1; y < size - 1; y += 1) {
      for (let x = 1; x < size - 1; x += 1) {
        const idx = y * size + x;
        if (!dilated[idx] && !visited[idx]) {
          fillCount += 1;
          if (x < fillMinX) fillMinX = x;
          if (y < fillMinY) fillMinY = y;
          if (x > fillMaxX) fillMaxX = x;
          if (y > fillMaxY) fillMaxY = y;
          const p = idx * 4;
          fillData.data[p] = 145;
          fillData.data[p + 1] = 95;
          fillData.data[p + 2] = 255;
          fillData.data[p + 3] = 120;
        }
      }
    }
    if (fillCount < size * size * 0.002) {
      fillMinX = minX;
      fillMinY = minY;
      fillMaxX = maxX;
      fillMaxY = maxY;
    }
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (x < minX || x > maxX || y < minY || y > maxY) {
          const idx = (y * size + x) * 4;
          edgeData.data[idx + 3] = 0;
        }
      }
    }
    const edgeCanvas = document.createElement("canvas");
    edgeCanvas.width = size;
    edgeCanvas.height = size;
    const edgeCtx = edgeCanvas.getContext("2d");
    if (!edgeCtx) return null;
    edgeCtx.putImageData(edgeData, 0, 0);
    const fillCanvas = document.createElement("canvas");
    fillCanvas.width = size;
    fillCanvas.height = size;
    const fillCtx = fillCanvas.getContext("2d");
    if (!fillCtx) return null;
    fillCtx.putImageData(fillData, 0, 0);
    const edgeFull = document.createElement("canvas");
    edgeFull.width = image.width;
    edgeFull.height = image.height;
    const edgeFullCtx = edgeFull.getContext("2d");
    if (!edgeFullCtx) return null;
    edgeFullCtx.imageSmoothingEnabled = true;
    edgeFullCtx.drawImage(edgeCanvas, crop.x, crop.y, crop.width, crop.height);
    const fillFull = document.createElement("canvas");
    fillFull.width = image.width;
    fillFull.height = image.height;
    const fillFullCtx = fillFull.getContext("2d");
    if (!fillFullCtx) return null;
    fillFullCtx.imageSmoothingEnabled = true;
    fillFullCtx.drawImage(fillCanvas, crop.x, crop.y, crop.width, crop.height);
    const overlay = edgeFull.toDataURL("image/png");
    const fillOverlay = fillFull.toDataURL("image/png");
    const scaleX = crop.width / size;
    const scaleY = crop.height / size;
    let boxX = crop.x + fillMinX * scaleX;
    let boxY = crop.y + fillMinY * scaleY;
    let boxW = (fillMaxX - fillMinX) * scaleX;
    let boxH = (fillMaxY - fillMinY) * scaleY;
    const padX = boxW * 0.08;
    const padY = boxH * 0.08;
    boxX = Math.max(0, boxX - padX);
    boxY = Math.max(0, boxY - padY);
    boxW = Math.min(image.width - boxX, boxW + padX * 2);
    boxH = Math.min(image.height - boxY, boxH + padY * 2);
    return {
      overlay,
      fillOverlay,
      bbox: {
        x: boxX,
        y: boxY,
        width: boxW,
        height: boxH,
      },
    };
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const updateFallback = () => {
      setContainerSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateFallback();
    const el = containerRef.current;
    let observer;
    if (el && "ResizeObserver" in window) {
      observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const { width, height } = entry.contentRect;
        if (width && height) {
          setContainerSize({ width, height });
        }
      });
      observer.observe(el);
    }
    window.addEventListener("resize", updateFallback);
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", updateFallback);
    };
  }, []);

  const resetCapture = useCallback(() => {
    setCaptured(null);
    setSourceImage(null);
    setDetections([]);
    setEdgeOverlay(null);
    setFillOverlay(null);
    setSelectedIndex(null);
    setResult(null);
    setAnalysisError("");
    setScoreNotice("");
    setAnalyzing(false);
  }, []);

  const triggerNoItemOverlay = useCallback(() => {
    setShowNoItem(true);
    setNoItemOpacity(1);
    window.setTimeout(() => setNoItemOpacity(0), 1000);
    window.setTimeout(() => {
      setShowNoItem(false);
      setNoItemOpacity(0);
    }, 1500);
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current) return;
    if (enableHaptics && navigator?.vibrate) {
      navigator.vibrate(18);
    }
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCaptured({ dataUrl, width: canvas.width, height: canvas.height });
    setResult(null);
    setAnalysisError("");
    const img = new Image();
    img.onload = () => setSourceImage(img);
    img.src = dataUrl;
  }, [enableHaptics]);

  const handleFilePick = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const img = new Image();
      img.onload = () => {
        setCaptured({ dataUrl, width: img.width, height: img.height });
        setSourceImage(img);
        setResult(null);
        setAnalysisError("");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const runDetection = useCallback(async () => {
    if (!sourceImage) {
      triggerNoItemOverlay();
      resetCapture();
      return;
    }
    setDetections([]);
    setEdgeOverlay(null);
    setFillOverlay(null);
    setSelectedIndex(null);
    let focusBox = null;
    const model = await loadDetector();
    if (model) {
      try {
        const predictions = await model.detect(sourceImage);
        const sorted = predictions
          .filter((item) => item.score >= 0.45)
          .sort((a, b) => b.score - a.score);
        const top = sorted[0];
        if (top?.bbox) {
          const [x, y, width, height] = top.bbox;
          const safeX = Math.max(0, x);
          const safeY = Math.max(0, y);
          const safeW = Math.min(sourceImage.width - safeX, width);
          const safeH = Math.min(sourceImage.height - safeY, height);
          focusBox = { x: safeX, y: safeY, width: safeW, height: safeH };
        }
      } catch {
        focusBox = null;
      }
    }
    const edgeResult = computeEdgeOverlay(sourceImage, focusBox);
    if (!edgeResult) {
      triggerNoItemOverlay();
      resetCapture();
      return;
    }
    setEdgeOverlay(edgeResult.overlay);
    setFillOverlay(edgeResult.fillOverlay);
    setDetections([
      {
        id: "det_0",
        bbox: edgeResult.bbox,
      },
    ]);
  }, [computeEdgeOverlay, loadDetector, resetCapture, sourceImage, triggerNoItemOverlay]);

  useEffect(() => {
    if (captured && sourceImage) {
      runDetection();
    }
  }, [captured, sourceImage, runDetection]);

  const displayBoxes = useMemo(() => {
    if (!captured) return [];
    const iw = captured.width;
    const ih = captured.height;
    const vw = containerSize.width;
    const vh = containerSize.height;
    if (!vw || !vh) return [];
    const scale = Math.max(vw / iw, vh / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const offsetX = (vw - dw) / 2;
    const offsetY = (vh - dh) / 2;
    return detections.map((det) => ({
      ...det,
      style: {
        left: det.bbox.x * scale + offsetX,
        top: det.bbox.y * scale + offsetY,
        width: det.bbox.width * scale,
        height: det.bbox.height * scale,
      },
    }));
  }, [captured, containerSize, detections]);

  const selectedBox = selectedIndex != null ? displayBoxes[selectedIndex] : null;
  const analyzeEnabled = selectedIndex != null;

  const handleOverlayClick = useCallback(
    (event) => {
      if (!containerRef.current || !displayBoxes.length) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const hitIndex = displayBoxes.findIndex((box) => {
        const left = Number(box.style.left) || 0;
        const top = Number(box.style.top) || 0;
        const width = Number(box.style.width) || 0;
        const height = Number(box.style.height) || 0;
        return x >= left && x <= left + width && y >= top && y <= top + height;
      });
      if (hitIndex >= 0) {
        setSelectedIndex(hitIndex);
        setResult(null);
      }
    },
    [displayBoxes]
  );

  const createSelectionCrop = useCallback(async () => {
    if (!sourceImage || selectedIndex == null) return null;
    const det = detections[selectedIndex];
    if (!det) return null;
    const canvas = document.createElement("canvas");
    canvas.width = det.bbox.width;
    canvas.height = det.bbox.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(
      sourceImage,
      det.bbox.x,
      det.bbox.y,
      det.bbox.width,
      det.bbox.height,
      0,
      0,
      det.bbox.width,
      det.bbox.height
    );
    return canvas.toDataURL("image/jpeg", 0.9);
  }, [detections, selectedIndex, sourceImage]);

  const requestLocation = useCallback(async () => {
    if (!navigator?.geolocation) {
      setLocationError("Location access unavailable.");
      return;
    }
    setLocationError("");
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 60000,
          enableHighAccuracy: true,
        });
      });
      const zipResp = await lookupZipByCoords({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
      const nextZip = clampZip(zipResp?.zip || "");
      if (!nextZip) {
        setLocationError("Couldn't determine ZIP. Enter manually.");
        return;
      }
      handleZipChange(nextZip);
    } catch (error) {
      if (error?.code === 1) {
        setLocationError("Location access is disabled. Enter ZIP manually.");
      } else if (error?.code === 2) {
        setLocationError("Location access unavailable.");
      } else if (error?.code === 3) {
        setLocationError("Couldn't determine ZIP. Enter manually.");
      } else {
        setLocationError("Location error. Enter ZIP manually.");
      }
    }
  }, [handleZipChange]);

  const analyzeSelection = useCallback(async () => {
    if (selectedIndex == null || analyzing) return;
    if (!signedIn) {
      setAnalysisError("Sign in required to analyze items.");
      return;
    }
    if (enableHaptics && navigator?.vibrate) {
      navigator.vibrate(18);
    }
    setAnalyzing(true);
    setResult(null);
    setAnalysisError("");
    setScoreNotice("");
    try {
      const imageBase64 = await createSelectionCrop();
      const response = await callRevive({
        mode: "image",
        itemName: "item",
        imageBase64,
        zip: zipCode,
        useWebSearch: allowWebSearch,
        accessToken: session?.access_token,
      });
      const parsed = parseReviveText(response.text, response.payload);
      if (!parsed?.item || !parsed?.material) {
        setAnalysisError("Could not parse result. Please try again.");
        return;
      }
      setResult(parsed);
      setLastAnalysisSource("photo");
      const { duplicate } = await commitHistory({
        parsed,
        rawText: response.text,
        source: "photo",
        imagePreview: imageBase64 || captured?.dataUrl || null,
      });
      if (duplicate) {
        setScoreNotice("Thanks for recycling - this won't add to your score.");
      }
    } catch (error) {
      setAnalysisError(error?.message || "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }, [
    allowWebSearch,
    analyzing,
    captured?.dataUrl,
    commitHistory,
    createSelectionCrop,
    enableHaptics,
    selectedIndex,
    session?.access_token,
    signedIn,
    zipCode,
  ]);

  const submitTextEntry = useCallback(async () => {
    const trimmed = manualText.trim();
    if (!trimmed || analyzing) return;
    if (!signedIn) {
      setAnalysisError("Sign in required to analyze items.");
      return;
    }
    if (enableHaptics && navigator?.vibrate) {
      navigator.vibrate(18);
    }
    setAnalyzing(true);
    setResult(null);
    setAnalysisError("");
    setScoreNotice("");
    try {
      const response = await callRevive({
        mode: "text",
        itemName: trimmed,
        zip: zipCode,
        useWebSearch: allowWebSearch,
        accessToken: session?.access_token,
      });
      const parsed = parseReviveText(response.text, response.payload);
      if (!parsed?.item || !parsed?.material) {
        setAnalysisError("Could not parse result. Please try again.");
        return;
      }
      setResult(parsed);
      setLastAnalysisSource("text");
      const { duplicate } = await commitHistory({
        parsed,
        rawText: response.text,
        source: "text",
        imagePreview: null,
      });
      if (duplicate) {
        setScoreNotice("Thanks for recycling - this won't add to your score.");
      } else {
        setScoreNotice("Thanks for recycling - text entries won't add to your score.");
      }
      setIsTextEntryActive(false);
    } catch (error) {
      setAnalysisError(error?.message || "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }, [
    allowWebSearch,
    analyzing,
    commitHistory,
    enableHaptics,
    manualText,
    session?.access_token,
    signedIn,
    zipCode,
  ]);

  const handleShutterPointerDown = useCallback(() => {
    longPressRef.current = window.setTimeout(() => {
      setIsTextEntryActive(true);
    }, 450);
  }, []);

  const handleShutterPointerUp = useCallback(() => {
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
      if (!isTextEntryActive) {
        captureFrame();
      }
    }
  }, [captureFrame, isTextEntryActive]);

  const handleShutterPointerCancel = useCallback(() => {
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }, []);

  const shouldShowLocationEntry = locationExpanded;

  return (
    <Page className="revive-route-page revive-capture-page" colors={PAGE_COLORS}>
      <div ref={containerRef} className="revive-capture-stage">
        {!captured ? (
          <video
            ref={videoRef}
            className="revive-capture-media"
            playsInline
            muted
            autoPlay
          />
        ) : (
          <img src={captured.dataUrl} alt="Captured" className="revive-capture-media" />
        )}

        {captured && edgeOverlay ? (
          <img
            src={edgeOverlay}
            alt=""
            className={`revive-edge-overlay ${selectedIndex != null ? "is-selected" : ""}`}
            onClick={handleOverlayClick}
          />
        ) : null}

        {captured && fillOverlay && selectedIndex != null ? (
          <img src={fillOverlay} alt="" className="revive-fill-overlay" />
        ) : null}

        {captured && displayBoxes.length ? (
          <div className="revive-detection-layer">
            {displayBoxes.map((det, index) => {
              const isSelected = selectedIndex === index;
              return (
                <button
                  key={det.id}
                  type="button"
                  className={`revive-detection-box ${isSelected ? "is-selected" : ""}`}
                  style={det.style}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedIndex(index);
                    setResult(null);
                  }}
                />
              );
            })}
          </div>
        ) : null}

        {selectedBox ? null : null}

        {selectedBox && analyzing ? (
          <div
            className="revive-arc-spinner"
            style={{
              left: selectedBox.style.left + selectedBox.style.width / 2,
              top: selectedBox.style.top + selectedBox.style.height / 2,
            }}
          />
        ) : null}

        <div className="revive-top-right">
          <Button
            className="revive-icon-button"
            onClick={(event) => {
              event.stopPropagation();
              requestLocation();
              setLocationExpanded((prev) => !prev);
            }}
          >
            <LocationFill className="h-5 w-5" />
          </Button>
        </div>

        {captured ? (
          <div className="revive-top-left">
            <Button
              className="revive-icon-button"
              onClick={(event) => {
                event.stopPropagation();
                resetCapture();
              }}
            >
              <Xmark className="h-5 w-5" />
            </Button>
          </div>
        ) : null}

        {!captured ? (
          <div className="revive-bottom-stack" onClick={(event) => event.stopPropagation()}>
            {showCaptureInstructions ? (
              <div className="revive-pill revive-instruction-pill">
                Tap the shutter to take a photo. Hold it to type an item.
              </div>
            ) : null}
            {shouldShowLocationEntry ? (
              <ZipEntryRow
                value={zipCode}
                onChange={handleZipChange}
                onLocate={requestLocation}
                error={locationError}
              />
            ) : null}
            <LayoutGroup id="capture-control">
              <AnimatePresence initial={false} mode="wait">
                {isTextEntryActive ? (
                  <motion.div
                    key="text-entry"
                    className="revive-control-panel"
                    layoutId="capture-control"
                    layout
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  >
                    <TextEntryBar
                      value={manualText}
                      onChange={setManualText}
                      onSubmit={submitTextEntry}
                      onClose={() => setIsTextEntryActive(false)}
                      disabled={analyzing}
                      autoFocus
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="shutter"
                    className="revive-control-panel"
                    layoutId="capture-control"
                    layout
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  >
                    <div className="revive-shutter-row">
                      <Button
                        className="revive-icon-button revive-gallery-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <PhotoOnRectangle className="h-5 w-5" />
                      </Button>
                      <Button
                        className={`revive-shutter-button ${reduceMotion ? "" : "revive-shutter-pulse"}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (reduceMotion) captureFrame();
                        }}
                        onPointerDown={handleShutterPointerDown}
                        onPointerUp={handleShutterPointerUp}
                        onPointerLeave={handleShutterPointerCancel}
                        onPointerCancel={handleShutterPointerCancel}
                      >
                        <Arrow3Trianglepath className="revive-shutter-icon" />
                      </Button>
                      <div className="revive-shutter-spacer" aria-hidden="true" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </LayoutGroup>
          </div>
        ) : (
          <div className="revive-bottom-stack" onClick={(event) => event.stopPropagation()}>
            {selectedIndex == null && detections.length ? (
              <div className="revive-pill revive-hint-pill">Tap the item to select it</div>
            ) : null}
            {shouldShowLocationEntry ? (
              <ZipEntryRow
                value={zipCode}
                onChange={handleZipChange}
                onLocate={requestLocation}
                error={locationError}
              />
            ) : null}
            <Button
              className={`revive-analyze-button ${analyzeEnabled ? "is-enabled" : "is-disabled"}`}
              disabled={!analyzeEnabled}
              onClick={(event) => {
                event.stopPropagation();
                if (!analyzeEnabled) return;
                analyzeSelection();
              }}
            >
              <Sparkles className="revive-analyze-icon" />
              <span
                className={
                  analyzeEnabled ? "revive-analyze-text" : "revive-analyze-text-disabled"
                }
              >
                Analyze selection
              </span>
            </Button>
          </div>
        )}

        {showNoItem ? (
          <div className="revive-modal-backdrop" style={{ opacity: noItemOpacity }}>
            <div className="revive-modal-card">
              <div className="revive-modal-title">No object found</div>
              <div className="revive-modal-subtitle">Please try again</div>
            </div>
          </div>
        ) : null}

        {(analyzing || result || analysisError) && (
          <div className="revive-ai-overlay">
            {analyzing ? <StatusSpinner /> : null}
            {analysisError ? <ErrorCard message={analysisError} /> : null}
            {result ? (
              <>
                <ResultStatus recyclable={result.recyclable} />
                <NotesBar
                  notes={result.notes || "Result"}
                  onClose={() => setResult(null)}
                />
                {scoreNotice ? <ScoreNotice message={scoreNotice} /> : null}
                <InfoCard result={result} />
              </>
            ) : null}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => handleFilePick(event.target.files?.[0] || null)}
        />
      </div>
    </Page>
  );
}

function StatusSpinner() {
  return (
    <div className="revive-status-spinner">
      <div className="revive-status-spinner-ring" />
      <div className="revive-status-spinner-arc" />
    </div>
  );
}

function ResultStatus({ recyclable }) {
  return (
    <div
      className={`revive-result-status ${recyclable ? "is-recyclable" : "is-trash"}`}
    >
      {recyclable ? (
        <Checkmark className="revive-result-icon" />
      ) : (
        <Xmark className="revive-result-icon" />
      )}
    </div>
  );
}

function NotesBar({ notes, onClose }) {
  return (
    <div className="revive-notes-bar">
      <div className="revive-notes-text">{notes}</div>
      <Button className="revive-notes-close" onClick={onClose}>
        <Xmark className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ScoreNotice({ message }) {
  return <div className="revive-score-notice">{message}</div>;
}

function ErrorCard({ message }) {
  return <div className="revive-error-card">{message}</div>;
}

function InfoCard({ result }) {
  return (
    <Card className="revive-result-card" contentWrap={false}>
      <div className="revive-result-row">
        <div className="revive-result-label">ITEM</div>
        <div className="revive-result-value">{result.item}</div>
      </div>
      <div className="revive-result-row">
        <div className="revive-result-label">MATERIAL</div>
        <div className="revive-result-value">{result.material}</div>
      </div>
      <div className="revive-result-row">
        <div className="revive-result-label">RECYCLABLE</div>
        <div className="revive-result-value">{result.recyclable ? "Yes" : "No"}</div>
      </div>
      <div className="revive-result-row">
        <div className="revive-result-label">BIN</div>
        <div className="revive-result-value">{result.bin}</div>
      </div>
    </Card>
  );
}

function ZipEntryRow({ value, onChange, onLocate, error }) {
  return (
    <div className="revive-zip-row">
      <div className="revive-zip-input">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="ZIP code"
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </div>
      <Button className="revive-icon-button" onClick={onLocate}>
        <LocationFill className="h-4 w-4" />
      </Button>
      {error ? <div className="revive-zip-error">{error}</div> : null}
    </div>
  );
}

function TextEntryBar({ value, onChange, onSubmit, onClose, disabled, autoFocus }) {
  const canSubmit = value.trim().length > 0 && !disabled;
  return (
    <div className="revive-text-entry">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type an item (e.g., plastic bottle)"
        autoFocus={autoFocus}
      />
      <Button className="revive-text-entry-button" onClick={onSubmit} disabled={!canSubmit}>
        <PaperplaneFill className="h-4 w-4" />
      </Button>
      <Button className="revive-text-entry-button" onClick={() => onChange("")}
        disabled={disabled}
      >
        <Xmark className="h-4 w-4" />
      </Button>
      <Button className="revive-text-entry-done" onClick={onClose}>
        Done
      </Button>
    </div>
  );
}

function ImpactPage() {
  const { historyEntries, totals, signedIn, user, navigateTab, setEntrySheet } = usePwa();
  const entries = Array.isArray(historyEntries) ? historyEntries : [];
  const scoredEntries = entries.filter((entry) => entry.source === "photo");
  const totalScans = totals.totalScans || scoredEntries.reduce((acc, row) => acc + row.scanCount, 0);
  const recyclableCount = totals.recyclableCount || scoredEntries.filter((row) => row.recyclable).length;
  const impactScore = totals.points || recyclableCount;
  const signedName = user?.user_metadata?.full_name || user?.email || "Recycler";

  return (
    <Page className="revive-route-page revive-impact-page" colors={PAGE_COLORS}>
      <div className="revive-impact-scroll">
        <div className="revive-impact-header-shell">
          <div className="revive-impact-header">
            <div className="revive-impact-title">Impact</div>
            <div className="revive-impact-subtitle">
              Track your scans, see your impact, and sync your progress.
            </div>
            <div className="revive-impact-stats">
              <Card className="revive-stat-card" contentWrap={false}>
                <div className="revive-stat-label">SCANS</div>
                <div className="revive-stat-value">{totalScans}</div>
              </Card>
              <Card className="revive-stat-card" contentWrap={false}>
                <div className="revive-stat-label">RECYCLABLE</div>
                <div className="revive-stat-value">{recyclableCount}</div>
              </Card>
              <Card className="revive-stat-card" contentWrap={false}>
                <div className="revive-stat-label">IMPACT</div>
                <div className="revive-stat-value">{impactScore}</div>
              </Card>
            </div>
            <div className="revive-impact-account">
              {signedIn ? (
                <div className="revive-signed-in">Signed in as {signedName}</div>
              ) : (
                <div className="revive-banner-card">
                  <div className="revive-banner-text">Sign in to sync your impact and score.</div>
                  <Button className="revive-banner-button" onClick={() => navigateTab(TAB_KEYS.account)}>
                    Go to Account
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="revive-impact-header-glass" />
        </div>

        <div className="revive-impact-body">
          {!entries.length ? (
            <Card className="revive-empty-card" contentWrap={false}>
              <ClockFill className="revive-empty-icon" />
              <div className="revive-empty-title">No impact yet</div>
              <div className="revive-empty-subtitle">
                Scan an item from the camera tab and it will appear here.
              </div>
            </Card>
          ) : (
            <div className="revive-impact-list">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className="revive-impact-card"
                  onClick={() => setEntrySheet(entry)}
                >
                  <div className="revive-impact-thumb">
                    {entry.imagePreview ? (
                      <img src={entry.imagePreview} alt="" />
                    ) : (
                      <div className="revive-impact-thumb-placeholder">
                        {entry.source === "text" ? "T" : "P"}
                      </div>
                    )}
                  </div>
                  <div className="revive-impact-info">
                    <div className="revive-impact-row">
                      <div className="revive-impact-item">{entry.item}</div>
                      <div
                        className={`revive-impact-status ${
                          entry.recyclable ? "is-good" : "is-bad"
                        }`}
                      >
                        {entry.recyclable ? "Recyclable" : "Not recyclable"}
                      </div>
                    </div>
                    <div className="revive-impact-subline">
                      {entry.material} • {entry.bin}
                    </div>
                    <div className="revive-impact-notes">{entry.notes}</div>
                    <div className="revive-impact-meta">
                      {formatDate(entry.createdAt)}
                      {entry.source === "text" ? <span className="revive-manual">Manual</span> : null}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}

function ImpactDetailSheet({ entry }) {
  const { setEntrySheet } = usePwa();
  return (
    <div className="revive-sheet-body">
      <div className="revive-sheet-header">
        <div className="revive-sheet-title">Activity</div>
        <Button className="revive-sheet-close" onClick={() => setEntrySheet(null)}>
          <Xmark className="h-4 w-4" />
        </Button>
      </div>
      <div className="revive-sheet-content">
        {entry.imagePreview ? (
          <img src={entry.imagePreview} alt="" className="revive-sheet-image" />
        ) : (
          <div className="revive-sheet-placeholder">
            {entry.source === "text" ? "Manual entry" : "No image available"}
          </div>
        )}
        <div className="revive-sheet-card">
          <div className="revive-sheet-item">{entry.item}</div>
          <div className="revive-sheet-subline">
            {entry.material} • {entry.bin}
          </div>
          <div className="revive-sheet-status">
            {entry.recyclable ? "Recyclable" : "Not recyclable"}
          </div>
          <div className="revive-sheet-notes">{entry.notes}</div>
          <div className="revive-sheet-date">{formatDate(entry.createdAt)}</div>
          <div className="revive-sheet-count">
            Scanned {entry.scanCount} time{entry.scanCount === 1 ? "" : "s"}
          </div>
          {entry.source === "text" ? (
            <div className="revive-sheet-manual">Manual entry - not counted toward score.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AccountPage() {
  const {
    signedIn,
    user,
    isAdmin,
    authError,
    authBusy,
    signInWithProvider,
    signOut,
    historyEntries,
    syncImpactNow,
  } = usePwa();

  const entries = Array.isArray(historyEntries) ? historyEntries : [];
  const totalScans = entries.length;
  const recyclableCount = entries.filter((entry) => entry.recyclable).length;
  const currentLevel = BADGES.reduce((acc, badge, idx) => (recyclableCount >= badge.threshold ? idx + 1 : acc), 0);

  return (
    <Page className="revive-route-page revive-account-page" colors={PAGE_COLORS}>
      <Block className="revive-page-header">
        <div className="revive-page-title">Account</div>
      </Block>

      <div className="revive-page-content">
        <Card className="revive-glass-card" contentWrap={false}>
          <div className="revive-account-header">
            <div>
              <div className="revive-account-status">{signedIn ? "Signed in" : "Guest"}</div>
              <div className="revive-account-email">
                {user?.user_metadata?.full_name || user?.email || "Sign in to sync your impact."}
              </div>
            </div>
            <div className="revive-account-metrics">
              <div className="revive-account-score">{recyclableCount}</div>
              <div className="revive-account-label">Recycled</div>
              <div className="revive-account-level">Level {currentLevel}/{BADGES.length}</div>
            </div>
          </div>

          {signedIn ? (
            <div className="revive-account-actions">
              <Button className="revive-glass-button" onClick={syncImpactNow}>
                <Arrow2Circlepath className="h-4 w-4" />
                Sync impact
              </Button>
              <Button className="revive-glass-button" onClick={signOut}>
                <ArrowRightSquare className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="revive-account-actions">
              <Button
                className="revive-glass-button"
                onClick={() => signInWithProvider("google")}
                disabled={authBusy}
              >
                <LogoGoogle className="h-4 w-4" />
                {authBusy ? "Signing in..." : "Sign in with Google"}
              </Button>
              <Button
                className="revive-glass-button"
                onClick={() => signInWithProvider("apple")}
                disabled={authBusy}
              >
                <LogoApple className="h-4 w-4" />
                Sign in with Apple
              </Button>
            </div>
          )}

          {isAdmin ? (
            <div className="revive-admin-card">
              <div>
                <div className="revive-admin-title">Admin Portal</div>
                <div className="revive-admin-subtitle">Manage users, impact, and settings.</div>
              </div>
              <ChevronRight className="h-4 w-4" />
            </div>
          ) : null}

          {authError ? <div className="revive-auth-error">{authError}</div> : null}
        </Card>

        <div className="revive-section-title">Badges</div>
        <div className="revive-badge-grid">
          {BADGES.map((badge) => {
            const Icon = badge.icon;
            const unlocked = recyclableCount >= badge.threshold;
            return (
              <Card key={badge.title} className="revive-badge-card" contentWrap={false}>
                <div className="revive-badge-header">
                  <Icon className={`revive-badge-icon ${unlocked ? "is-unlocked" : ""}`} />
                  {unlocked ? <CheckmarkSealFill className="revive-badge-check" /> : null}
                </div>
                <div className="revive-badge-title">{badge.title}</div>
                <div className="revive-badge-detail">{badge.detail}</div>
                <div className="revive-badge-progress">
                  {Math.min(recyclableCount, badge.threshold)} / {badge.threshold}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Page>
  );
}

function SettingsPage() {
  const {
    defaultZip,
    setDefaultZip,
    allowWebSearch,
    setAllowWebSearch,
    autoSyncImpact,
    setAutoSyncImpact,
    showCaptureInstructions,
    setShowCaptureInstructions,
    enableHaptics,
    setEnableHaptics,
    reduceMotion,
    setReduceMotion,
    themeMode,
    setThemeMode,
    signedIn,
  } = usePwa();
  const [locationError, setLocationError] = useState("");

  const requestLocation = useCallback(async () => {
    if (!navigator?.geolocation) {
      setLocationError("Location access unavailable.");
      return;
    }
    setLocationError("");
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 60000,
          enableHighAccuracy: true,
        });
      });
      const zipResp = await lookupZipByCoords({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
      const nextZip = clampZip(zipResp?.zip || "");
      if (!nextZip) {
        setLocationError("Couldn't determine ZIP. Enter manually.");
        return;
      }
      setDefaultZip(nextZip);
    } catch (error) {
      if (error?.code === 1) {
        setLocationError("Location access is disabled. Enter ZIP manually.");
      } else if (error?.code === 2) {
        setLocationError("Location access unavailable.");
      } else if (error?.code === 3) {
        setLocationError("Couldn't determine ZIP. Enter manually.");
      } else {
        setLocationError("Location error. Enter ZIP manually.");
      }
    }
  }, [setDefaultZip]);

  return (
    <Page className="revive-route-page revive-settings-page" colors={PAGE_COLORS}>
      <Block className="revive-page-header">
        <div className="revive-page-title">Settings</div>
      </Block>

      <div className="revive-page-content">
        <Card className="revive-glass-card" contentWrap={false}>
          <div className="revive-card-title">Location</div>
          <div className="revive-card-subtitle">Default ZIP code</div>
          <div className="revive-settings-row">
            <div className="revive-zip-input">
              <input
                value={defaultZip}
                onChange={(event) => setDefaultZip(clampZip(event.target.value))}
                placeholder="ZIP code"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <Button className="revive-icon-button" onClick={requestLocation}>
              <LocationFill className="h-4 w-4" />
            </Button>
          </div>
          {locationError ? <div className="revive-card-note">{locationError}</div> : null}
          <div className="revive-settings-toggle">
            <Toggle checked={allowWebSearch} onChange={(event) => setAllowWebSearch(event.target.checked)} />
            <span>Allow web search for local rules</span>
          </div>
        </Card>

        <Card className="revive-glass-card" contentWrap={false}>
          <div className="revive-card-title">Appearance</div>
          <Segmented strong className="revive-segmented">
            {THEME_OPTIONS.map((option) => (
              <SegmentedButton
                key={option.value}
                active={themeMode === option.value}
                onClick={() => setThemeMode(option.value)}
              >
                {option.label}
              </SegmentedButton>
            ))}
          </Segmented>
        </Card>

        <Card className="revive-glass-card" contentWrap={false}>
          <div className="revive-card-title">Capture</div>
          <div className="revive-settings-toggle">
            <Toggle checked={enableHaptics} onChange={(event) => setEnableHaptics(event.target.checked)} />
            <span>Haptic feedback</span>
          </div>
          <div className="revive-settings-toggle">
            <Toggle
              checked={showCaptureInstructions}
              onChange={(event) => setShowCaptureInstructions(event.target.checked)}
            />
            <span>Show capture instructions</span>
          </div>
          <div className="revive-settings-toggle">
            <Toggle checked={reduceMotion} onChange={(event) => setReduceMotion(event.target.checked)} />
            <span>Reduce motion</span>
          </div>
        </Card>

        <Card className="revive-glass-card" contentWrap={false}>
          <div className="revive-card-title">Sync</div>
          <div className="revive-settings-toggle">
            <Toggle checked={autoSyncImpact} onChange={(event) => setAutoSyncImpact(event.target.checked)} />
            <span>Auto-sync impact</span>
          </div>
          {!signedIn ? (
            <div className="revive-card-note">Auto-sync requires a signed-in account.</div>
          ) : null}
        </Card>

        {!signedIn ? (
          <div className="revive-card-note">Sign in to sync preferences across devices.</div>
        ) : null}
      </div>
    </Page>
  );
}

function LeaderboardPage() {
  const { signedIn, navigateTab, session, user, authError } = usePwa();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchPublicLeaderboard(50)
      .then((data) => {
        if (cancelled) return;
        setRows(normalizeLeaderboardRows(data));
      })
      .catch(() => {
        if (cancelled) return;
        setRows([]);
        setError("Leaderboard unavailable.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return (
    <Page className="revive-route-page revive-leaderboard-page" colors={PAGE_COLORS}>
      <Block className="revive-page-header">
        <div className="revive-page-title">Leaderboard</div>
        <div className="revive-page-subtitle">Top recyclers based on verified daily impact.</div>
      </Block>

      <div className="revive-page-content">
        {signedIn ? (
          <Card className="revive-glass-card" contentWrap={false}>
            <div className="revive-card-note">
              Signed in as {user?.user_metadata?.full_name || user?.email || "Recycler"}
            </div>
          </Card>
        ) : (
          <Card className="revive-glass-card" contentWrap={false}>
            <div className="revive-banner-text">Sign in to appear on the leaderboard.</div>
            <Button className="revive-banner-button" onClick={() => navigateTab(TAB_KEYS.account)}>
              Go to Account
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Card>
        )}

        {authError ? <div className="revive-card-note">{authError}</div> : null}

        {loading ? (
          <div className="revive-card-note">Loading leaderboard...</div>
        ) : error ? (
          <div className="revive-card-note">{error}</div>
        ) : rows.length === 0 ? (
          <Card className="revive-glass-card" contentWrap={false}>
            <TrophyIcon className="revive-empty-icon" />
            <div className="revive-empty-title">No leaderboard data yet</div>
            <div className="revive-empty-subtitle">
              Sign in and start scanning to appear here.
            </div>
          </Card>
        ) : (
          <div className="revive-leaderboard-list">
            {rows.map((row, index) => (
              <Card key={row.id} className="revive-leaderboard-row" contentWrap={false}>
                <div className="revive-leaderboard-rank">#{index + 1}</div>
                <div className="revive-leaderboard-info">
                  <div className="revive-leaderboard-name">{row.displayName}</div>
                  <div className="revive-leaderboard-subline">
                    {row.recyclableCount} recyclable • {row.totalScans} scans
                  </div>
                </div>
                <div className="revive-leaderboard-points">{row.totalPoints}</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

function TrophyIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4h12v3a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V4Z" />
      <path d="M8 4v2a3 3 0 0 1-3 3H4V6a2 2 0 0 1 2-2h2Z" />
      <path d="M16 4v2a3 3 0 0 0 3 3h1V6a2 2 0 0 0-2-2h-2Z" />
      <path d="M9 14h6v2a3 3 0 0 1-3 3 3 3 0 0 1-3-3v-2Z" />
      <path d="M8 21h8" />
    </svg>
  );
}
