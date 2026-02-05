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
import Framework7 from "framework7/lite";
import Framework7React, { App as F7App, View as F7View } from "framework7-react";
import {
  Badge,
  Block,
  BlockTitle,
  Button,
  Card,
  Dialog,
  DialogButton,
  List,
  ListInput,
  ListItem,
  Navbar,
  Page,
  Preloader,
  Segmented,
  SegmentedButton,
  Sheet,
  Tabbar,
  TabbarLink,
  Toast,
  Toggle,
  Toolbar,
  ToolbarPane,
} from "../../kitchen-sink/konsta-src/react/konsta-react";
import {
  CameraFill,
  GearAltFill,
  LeafArrowCirclepath,
  ListNumberRtl,
  LocationFill,
  PersonCropCircleFill,
  Sparkles,
} from "framework7-icons/react";
import { formatDistanceToNowStrict } from "date-fns";
import { supabase } from "../../lib/supabaseClient";
import { parseRecyclingResponse } from "./parseRecyclingResponse";
import {
  callDeleteAccount,
  callRevive,
  fetchAnonQuota,
  fetchPublicLeaderboard,
  fetchUserImpactTotals,
  lookupZipByCoords,
  upsertImpactEntry,
} from "./reviveApi";
import { useLocalStorageState } from "./useLocalStorageState";
import { useSupabaseSession } from "./supabasePwa";
import {
  clampZip,
  computeHistoryTotals,
  findDuplicateIndex,
  makeHistoryEntry,
  mergeHistoryEntry,
  normalizeLeaderboardRows,
} from "./reviveModel";
import { detectPlatform, isStandaloneDisplay } from "./revivePlatform";

Framework7.use(Framework7React);

const TAB_KEYS = {
  settings: "settings",
  account: "account",
  capture: "capture",
  impact: "impact",
  leaderboard: "leaderboard",
};

const TAB_PATHS = {
  [TAB_KEYS.settings]: "/settings/",
  [TAB_KEYS.account]: "/account/",
  [TAB_KEYS.capture]: "/capture/",
  [TAB_KEYS.impact]: "/impact/",
  [TAB_KEYS.leaderboard]: "/leaderboard/",
};

const PATH_TO_TAB = {
  "/settings": TAB_KEYS.settings,
  "/account": TAB_KEYS.account,
  "/capture": TAB_KEYS.capture,
  "/impact": TAB_KEYS.impact,
  "/leaderboard": TAB_KEYS.leaderboard,
  "/scan": TAB_KEYS.capture,
};

const DEFAULT_TAB = TAB_KEYS.capture;
const PwaContext = createContext(null);
const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

function readTabFromPath(pathname) {
  if (!pathname) return DEFAULT_TAB;
  const normalized = String(pathname).replace(/\/+$/, "");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length === 0 || parts[0] !== "app") return DEFAULT_TAB;
  const key = `/${parts[1] || "capture"}`;
  return PATH_TO_TAB[key] || DEFAULT_TAB;
}

function toBase64DataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function nowIso() {
  return new Date().toISOString();
}

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    setIsOnline(window.navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);
  return isOnline;
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

function usePlatform() {
  const [platform, setPlatform] = useState({
    isIOS: false,
    isAndroid: false,
    theme: "ios",
    browser: "unknown",
  });

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  return platform;
}

function usePwa() {
  const ctx = useContext(PwaContext);
  if (!ctx) {
    throw new Error("PwaContext missing");
  }
  return ctx;
}

function haptic(enabled) {
  if (!enabled || typeof window === "undefined") return;
  if (window.navigator?.vibrate) {
    window.navigator.vibrate(18);
  }
}

function InstallGate({ platform, onContinue }) {
  return (
    <div className="revive-gate-wrap">
      <Page className="revive-gate-page">
        <Block className="pt-8 pb-0">
          <div className="revive-logo-badge">
            <img src="/app/icons/icon-192.png" alt="ReVive logo" className="h-14 w-14 rounded-2xl" />
            <div>
              <div className="text-lg font-semibold">Install ReVive</div>
              <div className="text-sm opacity-70">For the best native-feeling experience</div>
            </div>
          </div>
        </Block>

        <BlockTitle>How To Install</BlockTitle>
        <Block>
          <Card className="revive-card">
            <List strong inset>
              {platform.isIOS ? (
                <>
                  <ListItem title="1) Tap Share icon" />
                  <ListItem title="2) Scroll and tap Add to Home Screen" />
                  <ListItem title="3) Confirm Add" />
                  <ListItem title="4) Open from Home Screen for best experience" />
                </>
              ) : (
                <>
                  <ListItem title="1) Tap the 3-dot menu" />
                  <ListItem title='2) Tap "Install app" or "Add to home screen"' />
                  <ListItem title="3) Confirm" />
                </>
              )}
            </List>
            <div className="p-4">
              <Button large className="w-full" onClick={onContinue}>
                Continue in browser
              </Button>
            </div>
          </Card>
        </Block>
      </Page>
    </div>
  );
}

function OfflineScreen() {
  return (
    <div className="revive-gate-wrap">
      <Page className="revive-gate-page">
        <Block className="pt-20">
          <Card className="revive-card">
            <div className="p-6 text-center">
              <img
                src="/app/icons/icon-192.png"
                alt="ReVive logo"
                className="mx-auto mb-4 h-16 w-16 rounded-2xl"
              />
              <div className="text-xl font-semibold">Offline</div>
              <p className="mt-2 text-sm opacity-80">
                You need to be connected to the web to use ReVive.
              </p>
            </div>
          </Card>
        </Block>
      </Page>
    </div>
  );
}

export function ReVivePWA({ initialTab = "capture" }) {
  const normalizedInitialTab =
    initialTab === "scan" ? TAB_KEYS.capture : initialTab in TAB_PATHS ? initialTab : DEFAULT_TAB;

  const viewRef = useRef(null);
  const isOnline = useOnlineStatus();
  const platform = usePlatform();
  const systemDark = useSystemDarkMode();
  const { session, user, loading: authLoading } = useSupabaseSession();

  const [activeTab, setActiveTab] = useState(normalizedInitialTab);
  const [themeMode, setThemeMode] = useLocalStorageState("revive.themeMode", "system");
  const [installSkipped, setInstallSkipped] = useState(false);
  const [historyEntries, setHistoryEntries] = useLocalStorageState("revive.history.v3", []);
  const [defaultZip, setDefaultZip] = useLocalStorageState("revive.defaultZip", "");
  const [allowWebSearch, setAllowWebSearch] = useLocalStorageState("revive.allowWebSearch", true);
  const [autoSyncImpact, setAutoSyncImpact] = useLocalStorageState("revive.autoSyncImpact", true);
  const [showCaptureInstructions, setShowCaptureInstructions] = useLocalStorageState(
    "revive.captureInstructions",
    true
  );
  const [enableHaptics, setEnableHaptics] = useLocalStorageState("revive.enableHaptics", true);
  const [reduceMotion, setReduceMotion] = useLocalStorageState("revive.reduceMotion", false);
  const [guestQuota, setGuestQuota] = useState({ used: 0, remaining: 5, limit: 5 });
  const [toast, setToast] = useState({ opened: false, text: "" });
  const [entrySheet, setEntrySheet] = useState(null);
  const [isStandalone, setIsStandalone] = useState(true);

  const effectiveDark = themeMode === "system" ? systemDark : themeMode === "dark";
  const canUseGuest = !session?.access_token && guestQuota.remaining > 0;
  const totals = useMemo(() => computeHistoryTotals(historyEntries), [historyEntries]);

  const pushToast = useCallback((text) => {
    if (!text) return;
    setToast({ opened: true, text: String(text) });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const syncStandalone = () => setIsStandalone(isStandaloneDisplay());
    syncStandalone();
    const media = window.matchMedia("(display-mode: standalone)");
    media.addEventListener("change", syncStandalone);
    return () => media.removeEventListener("change", syncStandalone);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", effectiveDark);
  }, [effectiveDark]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const syncTab = () => setActiveTab(readTabFromPath(window.location.pathname));
    syncTab();
    window.addEventListener("popstate", syncTab);
    return () => window.removeEventListener("popstate", syncTab);
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/app/sw.js").catch(() => {});
  }, []);

  useEffect(() => {
    if (session?.access_token) return;
    fetchAnonQuota()
      .then((data) =>
        setGuestQuota({
          used: Number(data?.used ?? 0),
          remaining: Number(data?.remaining ?? 0),
          limit: Number(data?.limit ?? 5),
        })
      )
      .catch(() => {});
  }, [session?.access_token]);

  const appContext = {
    session,
    user,
    authLoading,
    activeTab,
    pushToast,
    guestQuota,
    setGuestQuota,
    historyEntries,
    setHistoryEntries,
    totals,
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
    entrySheet,
    setEntrySheet,
    canUseGuest,
    platform,
    themeMode,
    setThemeMode,
    effectiveDark,
  };

  const routes = useMemo(
    () => [
      { path: "/", redirect: TAB_PATHS[normalizedInitialTab] },
      { path: TAB_PATHS[TAB_KEYS.capture], component: CaptureRoute },
      { path: TAB_PATHS[TAB_KEYS.impact], component: ImpactRoute },
      { path: TAB_PATHS[TAB_KEYS.leaderboard], component: LeaderboardRoute },
      { path: TAB_PATHS[TAB_KEYS.account], component: AccountRoute },
      { path: TAB_PATHS[TAB_KEYS.settings], component: SettingsRoute },
    ],
    [normalizedInitialTab]
  );

  const showInstallGate = !isStandalone && !installSkipped;

  const navigateTab = (tab) => {
    const target = TAB_PATHS[tab] || TAB_PATHS[TAB_KEYS.capture];
    setActiveTab(tab);
    const view = viewRef.current?.f7View?.();
    if (view?.router) {
      view.router.navigate(target, { animate: true, browserHistory: true });
      return;
    }
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", `/app${target}`);
    }
  };

  if (!isOnline) return <OfflineScreen />;
  if (showInstallGate) {
    return <InstallGate platform={platform} onContinue={() => setInstallSkipped(true)} />;
  }

  return (
    <div className={`revive-pwa-root ${effectiveDark ? "dark" : ""}`}>
      <F7App
        theme={platform.theme}
        routes={routes}
        iosPageLoadDelay={0}
        browserHistory
        browserHistoryRoot="/app"
      >
        <PwaContext.Provider value={appContext}>
          <F7View
            ref={viewRef}
            className="revive-view"
            main
            router
            routes={routes}
            browserHistory
            browserHistoryRoot="/app"
            browserHistorySeparator=""
            browserHistoryInitialMatch
            iosSwipeBack={platform.theme === "ios"}
            mdSwipeBack={platform.theme === "material"}
            url={TAB_PATHS[normalizedInitialTab]}
          />

          <Toolbar className="revive-tabbar-shell left-0 bottom-0 fixed w-full z-50">
            <Tabbar labels icons className="revive-tabbar left-0 bottom-0 fixed w-full">
              <ToolbarPane>
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
                  icon={<LeafArrowCirclepath className="h-6 w-6" />}
                  label="Impact"
                />
                <TabbarLink
                  active={activeTab === TAB_KEYS.leaderboard}
                  onClick={() => navigateTab(TAB_KEYS.leaderboard)}
                  icon={<ListNumberRtl className="h-6 w-6" />}
                  label="Ranks"
                />
              </ToolbarPane>
            </Tabbar>
          </Toolbar>

          <Sheet
            opened={Boolean(entrySheet)}
            onSheetClosed={() => setEntrySheet(null)}
            className="h-auto rounded-t-3xl"
            backdrop
            push
          >
            {entrySheet ? <ImpactEntrySheet entry={entrySheet} onClose={() => setEntrySheet(null)} /> : null}
          </Sheet>

          <Toast
            opened={toast.opened}
            text={toast.text}
            onToastClosed={() => setToast({ opened: false, text: "" })}
          />
        </PwaContext.Provider>
      </F7App>
    </div>
  );
}

export default ReVivePWA;

function normalizeCandidates(payload, fallbackText) {
  if (Array.isArray(payload?.candidates)) {
    return payload.candidates
      .map((value, index) => ({
        id: `candidate_${index}`,
        label: String(value?.label || value?.name || value || "").trim(),
      }))
      .filter((row) => row.label);
  }

  const text = String(fallbackText || "");
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\-\*\d\.\)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 6);
  return lines.map((line, index) => ({ id: `candidate_${index}`, label: line }));
}

function applyQuotaUpdate(next, setGuestQuota) {
  if (!next) return;
  setGuestQuota({
    used: Number(next.used ?? 0),
    remaining: Number(next.remaining ?? 0),
    limit: Number(next.limit ?? 5),
  });
}

function parseReviveText(text, payload) {
  if (payload?.item && payload?.material) {
    return {
      item: String(payload.item),
      material: String(payload.material),
      recyclable: Boolean(payload.recyclable),
      bin: String(payload.bin || "trash"),
      notes: String(payload.notes || payload.instructions || "No special prep."),
    };
  }
  return parseRecyclingResponse(String(text || ""));
}

function RouteHeader({ title, subtitle, right }) {
  const { authLoading, session, guestQuota } = usePwa();
  return (
    <Navbar
      large
      transparent
      title={title}
      subtitle={subtitle}
      className="revive-navbar"
      right={
        right ?? (
          <div className="pr-2">
            {authLoading ? (
              <Preloader size="w-4 h-4" />
            ) : session?.access_token ? (
              <Badge colorsIos={{ bg: "bg-emerald-700/30 text-emerald-100" }}>Signed In</Badge>
            ) : (
              <Badge colorsIos={{ bg: "bg-slate-700/40 text-slate-100" }}>
                {guestQuota.remaining} left
              </Badge>
            )}
          </div>
        )
      }
    />
  );
}

function CaptureRoute() {
  const {
    session,
    pushToast,
    guestQuota,
    setGuestQuota,
    historyEntries,
    setHistoryEntries,
    defaultZip,
    setDefaultZip,
    allowWebSearch,
    autoSyncImpact,
    showCaptureInstructions,
    enableHaptics,
    setEntrySheet,
    canUseGuest,
  } = usePwa();

  const [mode, setMode] = useState("photo");
  const [manualText, setManualText] = useState("");
  const [isTextEntryActive, setIsTextEntryActive] = useState(false);
  const [captured, setCaptured] = useState(null);
  const [sourceImage, setSourceImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [noItemDialog, setNoItemDialog] = useState(false);
  const [scoreNotice, setScoreNotice] = useState("");
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState("");
  const [showNoItemOverlay, setShowNoItemOverlay] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const streamRef = useRef(null);
  const longPressRef = useRef(null);
  const historyList = Array.isArray(historyEntries) ? historyEntries : [];

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const tf = await import("@tensorflow/tfjs");
        await import("@tensorflow/tfjs-backend-webgl");
        await tf.setBackend("webgl");
        await tf.ready();
        const coco = await import("@tensorflow-models/coco-ssd");
        if (!active) return;
        const model = await coco.load();
        if (!active) return;
        setModelReady(true);
        modelRef.current = model;
      } catch (error) {
        if (!active) return;
        setModelError("Local vision model failed to load.");
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const modelRef = useRef(null);

  useEffect(() => {
    if (mode !== "photo" || captured) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [mode, captured, pushToast]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const accessToken = session?.access_token;
  const guestBlocked = !accessToken && !canUseGuest;

  const resetCapture = () => {
    setCaptured(null);
    setSourceImage(null);
    setDetections([]);
    setSelectedIndex(null);
    setResult(null);
    setScoreNotice("");
    setShowNoItemOverlay(false);
  };

  const captureFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCaptured({ dataUrl, width: canvas.width, height: canvas.height });
    const img = new Image();
    img.onload = () => {
      setSourceImage(img);
    };
    img.src = dataUrl;
  };

  const handleFilePick = async (file) => {
    if (!file) return;
    const dataUrl = await toBase64DataUrl(file);
    const img = new Image();
    img.onload = () => {
      setCaptured({ dataUrl, width: img.width, height: img.height });
      setSourceImage(img);
    };
    img.src = dataUrl;
  };

  const runDetection = async () => {
    if (!sourceImage || !modelRef.current) return;
    setDetecting(true);
    setDetections([]);
    setSelectedIndex(null);
    setShowNoItemOverlay(false);
    try {
      const predictions = await modelRef.current.detect(sourceImage);
      const filtered = predictions
        .filter((item) => item.score >= 0.45)
        .map((item, index) => ({
          id: `det_${index}`,
          label: item.class,
          bbox: {
            x: item.bbox[0],
            y: item.bbox[1],
            width: item.bbox[2],
            height: item.bbox[3],
          },
        }));
      if (!filtered.length) {
        setShowNoItemOverlay(true);
        setNoItemDialog(true);
      }
      setDetections(filtered);
    } catch {
      pushToast("Could not detect items locally.");
    } finally {
      setDetecting(false);
    }
  };

  useEffect(() => {
    if (captured && sourceImage && modelReady) {
      runDetection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captured, sourceImage, modelReady]);

  const mapToImageCoords = (point) => {
    if (!captured || !containerSize.width || !containerSize.height) return null;
    const iw = captured.width;
    const ih = captured.height;
    const vw = containerSize.width;
    const vh = containerSize.height;
    const scale = Math.max(vw / iw, vh / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const offsetX = (vw - dw) / 2;
    const offsetY = (vh - dh) / 2;
    const ix = (point.x - offsetX) / scale;
    const iy = (point.y - offsetY) / scale;
    if (ix < 0 || iy < 0 || ix > iw || iy > ih) return null;
    return { x: ix, y: iy, scale, offsetX, offsetY };
  };

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

  const handleSelectAt = (event) => {
    if (!captured || !detections.length) return;
    const rect = containerRef.current.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const mapped = mapToImageCoords(point);
    if (!mapped) {
      setSelectedIndex(null);
      return;
    }
    const hitIndex = detections.findIndex((det) => {
      const { x, y } = mapped;
      return (
        x >= det.bbox.x &&
        x <= det.bbox.x + det.bbox.width &&
        y >= det.bbox.y &&
        y <= det.bbox.y + det.bbox.height
      );
    });
    if (hitIndex >= 0) {
      setSelectedIndex((prev) => (prev === hitIndex ? null : hitIndex));
    } else {
      setSelectedIndex(null);
    }
  };

  const createSelectionCrop = async () => {
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
    return canvas.toDataURL("image/jpeg", 0.92);
  };

  const requestLocation = async () => {
    if (typeof window === "undefined" || !window.navigator?.geolocation) {
      setLocationError("Geolocation is unavailable on this device.");
      return;
    }
    setLocationBusy(true);
    setLocationError("");
    try {
      const position = await new Promise((resolve, reject) => {
        window.navigator.geolocation.getCurrentPosition(resolve, reject, {
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
        setLocationError("Unable to determine a ZIP for your current location.");
        return;
      }
      setDefaultZip(nextZip);
      pushToast(`ZIP updated to ${nextZip}.`);
    } catch {
      setLocationError("Unable to access your location.");
    } finally {
      setLocationBusy(false);
    }
  };

  const commitHistory = useCallback(
    async ({ parsed, rawText, source, selected }) => {
      const currentHistory = Array.isArray(historyEntries) ? historyEntries : [];
      const entry = makeHistoryEntry({
        parsed,
        rawText,
        source,
        zip: clampZip(defaultZip),
        selectedCandidate: selected,
        imagePreview: null,
        createdAt: nowIso(),
      });
      const duplicateIndex = findDuplicateIndex(currentHistory, entry);
      if (duplicateIndex >= 0) {
        const updated = mergeHistoryEntry(currentHistory[duplicateIndex], entry);
        const next = [...currentHistory];
        next.splice(duplicateIndex, 1);
        next.unshift(updated);
        setHistoryEntries(next);
        setScoreNotice("Thanks for recycling - this won't add to your score.");
        if (session?.user?.id && autoSyncImpact) {
          await upsertImpactEntry(updated, session.user.id).catch(() => {});
        }
        return updated;
      }
      setHistoryEntries([entry, ...currentHistory]);
      if (source === "text") {
        setScoreNotice("Thanks for recycling - text entries won't add to your score.");
      } else {
        setScoreNotice("");
      }
      if (session?.user?.id && autoSyncImpact) {
        await upsertImpactEntry(entry, session.user.id).catch(() => {});
      }
      return entry;
    },
    [autoSyncImpact, defaultZip, historyEntries, session?.user?.id, setHistoryEntries]
  );

  const analyze = async () => {
    if (guestBlocked) {
      pushToast("Guest quota reached. Sign in to continue.");
      return;
    }
    if (mode === "text" && !manualText.trim()) {
      pushToast("Type an item first.");
      return;
    }
    if (mode === "photo" && !captured) {
      pushToast("Take a photo first.");
      return;
    }
    if (mode === "photo" && selectedIndex == null) {
      pushToast("Tap the item to select it.");
      return;
    }

    setAnalyzing(true);
    setResult(null);
    try {
      haptic(enableHaptics);
      const imageBase64 = mode === "photo" ? await createSelectionCrop() : null;
      const response = await callRevive({
        mode: mode === "photo" ? "image" : "text",
        itemName: mode === "text" ? manualText.trim() : detections[selectedIndex]?.label,
        imageBase64,
        zip: clampZip(defaultZip),
        useWebSearch: Boolean(allowWebSearch),
        accessToken,
        selectedCandidate: mode === "photo" ? detections[selectedIndex]?.label : undefined,
      });
      applyQuotaUpdate(response.quota, setGuestQuota);
      const parsed = parseReviveText(response.text, response.payload);
      if (!parsed?.item || !parsed?.material) {
        pushToast("Could not parse result. Please try again.");
        return;
      }
      setResult(parsed);
      const stored = await commitHistory({
        parsed,
        rawText: response.text,
        source: mode,
        selected: selectedCandidate,
      });
      if (stored) {
        pushToast("Saved to impact history.");
      }
    } catch (error) {
      const quota = error?.quota || error?.payload;
      applyQuotaUpdate(quota, setGuestQuota);
      if (error?.status === 429) {
        pushToast("Daily guest quota reached. Sign in to continue.");
      } else {
        pushToast(error?.message || "Analysis failed.");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Page className="revive-route-page p-0">
      <div ref={containerRef} className="relative h-full w-full overflow-hidden">
        {!captured ? (
          <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted />
        ) : (
          <img
            src={captured.dataUrl}
            alt="Captured"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {captured && detections.length ? (
          <div className="absolute inset-0">
            {displayBoxes.map((det, index) => {
              const isSelected = selectedIndex === index;
              return (
                <div
                  key={det.id}
                  className={`absolute rounded-3xl transition-all ${isSelected ? "ring-2 ring-emerald-400/70" : ""}`}
                  style={{
                    left: det.style.left,
                    top: det.style.top,
                    width: det.style.width,
                    height: det.style.height,
                    border: "2px solid rgba(116, 198, 255, 0.55)",
                    boxShadow: "0 0 24px rgba(116, 198, 255, 0.45)",
                    background: isSelected ? "rgba(70, 190, 140, 0.28)" : "transparent",
                  }}
                />
              );
            })}
          </div>
        ) : null}

        {showNoItemOverlay ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="rounded-2xl bg-white/10 px-6 py-4 text-center backdrop-blur-xl">
              <div className="text-lg font-semibold text-white">No object found</div>
              <div className="mt-1 text-sm text-white/80">Please try again</div>
            </div>
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute inset-x-0 top-6 flex items-center justify-between px-4">
          <Button
            small
            rounded
            className="pointer-events-auto"
            onClick={() => (captured ? resetCapture() : null)}
          >
            ✕
          </Button>
          <Button
            small
            rounded
            className="pointer-events-auto"
            onClick={requestLocation}
            disabled={locationBusy}
          >
            <LocationFill className="h-4 w-4" />
          </Button>
        </div>

        {showCaptureInstructions ? (
          <div className="absolute bottom-44 left-1/2 w-72 -translate-x-1/2 rounded-full bg-white/15 px-4 py-2 text-center text-xs text-white/80 backdrop-blur">
            Tap the shutter to take a photo. Hold it to type an item.
          </div>
        ) : null}

        {result ? (
          <div className="absolute inset-x-0 top-24 flex flex-col items-center gap-3 px-6">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold"
              style={{
                background: result.recyclable ? "rgba(32, 210, 120, 0.85)" : "rgba(230, 74, 93, 0.85)",
                boxShadow: "0 18px 36px rgba(0,0,0,0.25)",
              }}
            >
              {result.recyclable ? "✓" : "✕"}
            </div>
            <div className="w-80 rounded-2xl bg-white/12 px-4 py-3 text-sm text-white/90 backdrop-blur-xl">
              <div className="font-semibold">{result.notes || "No special prep."}</div>
              <div className="mt-2 text-xs uppercase text-white/60">Item</div>
              <div className="text-sm">{result.item}</div>
              <div className="mt-2 text-xs uppercase text-white/60">Material</div>
              <div className="text-sm">{result.material}</div>
              <div className="mt-2 text-xs uppercase text-white/60">Bin</div>
              <div className="text-sm">{result.bin}</div>
            </div>
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-28 flex flex-col items-center gap-3 px-4">
          {captured ? (
            <div className="flex flex-col items-center gap-2">
              {!detections.length ? (
                <div className="rounded-full bg-white/15 px-3 py-1 text-xs text-white/70">
                  Detecting items…
                </div>
              ) : selectedIndex == null ? (
                <div className="rounded-full bg-white/15 px-3 py-1 text-xs text-white/70">
                  Tap the item to select it
                </div>
              ) : null}
              <Button
                large
                className="pointer-events-auto w-64"
                onClick={analyze}
                disabled={analyzing || selectedIndex == null}
              >
                {analyzing ? "Analyzing..." : "Analyze selection"}
              </Button>
            </div>
          ) : null}

          {isTextEntryActive ? (
            <div className="pointer-events-auto flex w-80 items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-xl">
              <input
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
                placeholder="Type an item (e.g., plastic bottle)"
                value={manualText}
                onChange={(event) => setManualText(event.target.value)}
              />
              <Button
                small
                onClick={() => {
                  setIsTextEntryActive(false);
                }}
              >
                Done
              </Button>
              <Button
                small
                onClick={async () => {
                  setMode("text");
                  await analyze();
                  setIsTextEntryActive(false);
                }}
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-10 flex items-center justify-center gap-10 px-8">
          <Button
            small
            rounded
            className="pointer-events-auto"
            onClick={() => fileInputRef.current?.click()}
          >
            📷
          </Button>
          <div
            className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/90 text-2xl shadow-xl"
            onPointerDown={() => {
              longPressRef.current = setTimeout(() => {
                setIsTextEntryActive(true);
                setMode("text");
              }, 450);
            }}
            onPointerUp={() => {
              if (longPressRef.current) {
                clearTimeout(longPressRef.current);
                longPressRef.current = null;
                setMode("photo");
                captureFrame();
              }
            }}
          >
            ♻
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => handleFilePick(event.target.files?.[0] || null)}
        />
      </div>

      <Dialog
        opened={noItemDialog}
        onBackdropClick={() => setNoItemDialog(false)}
        title="No object found"
        content="Please try again."
        buttons={
          <DialogButton strong onClick={() => setNoItemDialog(false)}>
            OK
          </DialogButton>
        }
      />
    </Page>
  );
}

function ImpactRoute() {
  const { historyEntries, totals, setEntrySheet, session, pushToast } = usePwa();
  const historyList = Array.isArray(historyEntries) ? historyEntries : [];
  const [remoteTotals, setRemoteTotals] = useState(null);
  const [loadingRemote, setLoadingRemote] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      setRemoteTotals(null);
      return;
    }
    let cancelled = false;
    setLoadingRemote(true);
    fetchUserImpactTotals(session.user.id)
      .then((data) => {
        if (!cancelled) setRemoteTotals(data);
      })
      .catch(() => {
        if (!cancelled) setRemoteTotals(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingRemote(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const displayed = remoteTotals || totals;

  return (
    <Page className="pb-32 revive-route-page">
      <RouteHeader title="Impact" subtitle="Track your recycling progress." />

      <Block className="space-y-3">
        <Card className="revive-card">
          <div className="grid grid-cols-3 gap-2 p-4">
            <MetricCard label="Scans" value={String(displayed.totalScans || 0)} />
            <MetricCard label="Recyclable" value={String(displayed.recyclableCount || 0)} />
            <MetricCard label="Points" value={String(displayed.points || 0)} />
          </div>
          {loadingRemote ? (
            <div className="px-4 pb-4 text-sm opacity-75">Loading synced totals...</div>
          ) : null}
        </Card>

        {!historyList.length ? (
          <Card className="revive-card">
            <div className="p-6 text-center">
              <div className="text-lg font-semibold">No impact yet</div>
              <div className="mt-1 text-sm opacity-75">
                Scan an item from the Capture tab and it will appear here.
              </div>
            </div>
          </Card>
        ) : (
          <Card className="revive-card">
            <List strong inset>
              {historyList.map((entry) => (
                <ListItem
                  key={entry.id}
                  title={entry.item || "Unknown item"}
                  subtitle={`${entry.material || "unknown"} • ${entry.bin || "trash"}`}
                  text={`${entry.notes || "No special prep."}\n${formatDistanceToNowStrict(
                    new Date(entry.createdAt)
                  )} ago`}
                  after={
                    <Badge
                      colorsIos={{
                        bg: entry.recyclable
                          ? "bg-emerald-700/30 text-emerald-100"
                          : "bg-rose-700/30 text-rose-100",
                      }}
                    >
                      {entry.recyclable ? "Yes" : "No"}
                    </Badge>
                  }
                  onClick={() => setEntrySheet(entry)}
                />
              ))}
            </List>
            <div className="p-4 pt-0">
              <Button
                tonal
                className="w-full"
                onClick={() => pushToast("Tap any entry for full details.")}
              >
                View Tips
              </Button>
            </div>
          </Card>
        )}
      </Block>
    </Page>
  );
}

function LeaderboardRoute() {
  const { session } = usePwa();
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
    <Page className="pb-32 revive-route-page">
      <RouteHeader title="Ranks" subtitle="Public leaderboard." />
      <Block className="space-y-3">
        <Card className="revive-card">
          <div className="p-4 text-sm opacity-80">
            Leaderboard is public. Display name and aggregate stats are visible to all users.
          </div>
        </Card>

        <Card className="revive-card">
          {loading ? (
            <div className="p-6 text-center">
              <Preloader size="w-6 h-6" />
            </div>
          ) : error ? (
            <div className="p-4 text-sm opacity-80">{error}</div>
          ) : (
            <List strong inset>
              {rows.map((row, index) => (
                <ListItem
                  key={row.id}
                  title={`${index + 1}. ${row.displayName}`}
                  subtitle={`${row.recyclableCount} recyclable • ${row.totalScans} scans`}
                  after={<Badge>{row.totalPoints}</Badge>}
                />
              ))}
            </List>
          )}
        </Card>
      </Block>
    </Page>
  );
}

function AccountRoute() {
  const { session, user, historyEntries, setHistoryEntries, pushToast, guestQuota } = usePwa();
  const historyList = Array.isArray(historyEntries) ? historyEntries : [];
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  const signInWithEmail = async () => {
    setPending(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      pushToast("Signed in.");
    } catch (error) {
      pushToast(error?.message || "Unable to sign in.");
    } finally {
      setPending(false);
    }
  };

  const signUpWithEmail = async () => {
    setPending(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      pushToast("Check your email to confirm your account.");
    } catch (error) {
      pushToast(error?.message || "Unable to sign up.");
    } finally {
      setPending(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${site}/app/account` },
      });
    } catch (error) {
      pushToast(error?.message || "Google sign-in failed.");
    }
  };

  const forgotPassword = async () => {
    if (!email.trim()) {
      pushToast("Enter your email first.");
      return;
    }
    setPending(true);
    try {
      const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${site}/reset-password`,
      });
      if (error) throw error;
      pushToast("Password reset email sent.");
    } catch (error) {
      pushToast(error?.message || "Could not send reset email.");
    } finally {
      setPending(false);
    }
  };

  const signOut = async () => {
    setPending(true);
    try {
      await supabase.auth.signOut();
      pushToast("Signed out.");
    } finally {
      setPending(false);
    }
  };

  const deleteAccount = async () => {
    setPending(true);
    try {
      await callDeleteAccount(session?.access_token);
      await supabase.auth.signOut();
      pushToast("Account deleted.");
      setDeleteOpen(false);
    } catch (error) {
      pushToast(error?.message || "Unable to delete account.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Page className="pb-32 revive-route-page">
      <RouteHeader title="Account" subtitle={session?.user?.email || "Sign in to sync."} />
      <Block className="space-y-3">
        <Card className="revive-card">
          {session?.access_token ? (
            <div className="p-4">
              <div className="text-sm opacity-75">{user?.email || session.user?.email}</div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button onClick={signOut} disabled={pending}>
                  Sign Out
                </Button>
                <Button tonal onClick={() => setDeleteOpen(true)} disabled={pending}>
                  Delete Account
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <Segmented strong>
                <SegmentedButton active={mode === "signin"} onClick={() => setMode("signin")}>
                  Sign In
                </SegmentedButton>
                <SegmentedButton active={mode === "signup"} onClick={() => setMode("signup")}>
                  Sign Up
                </SegmentedButton>
              </Segmented>
              <List strong inset className="mt-3">
                <ListInput
                  label="Email"
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onInput={(event) => setEmail(event.target.value)}
                />
                <ListInput
                  label="Password"
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  onInput={(event) => setPassword(event.target.value)}
                />
              </List>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button onClick={mode === "signin" ? signInWithEmail : signUpWithEmail} disabled={pending}>
                  {mode === "signin" ? "Sign In" : "Create Account"}
                </Button>
                <Button tonal onClick={signInWithGoogle} disabled={pending}>
                  Continue With Google
                </Button>
              </div>
              <Button small clear className="mt-2" onClick={forgotPassword} disabled={pending}>
                Forgot password?
              </Button>
              <div className="mt-2 text-xs opacity-75">
                Guest quota: {guestQuota.remaining}/{guestQuota.limit} remaining.
              </div>
            </div>
          )}
        </Card>

        <Card className="revive-card">
          <div className="p-4">
            <div className="text-sm font-semibold">Local Activity</div>
            <div className="mt-1 text-xs opacity-75">{historyList.length} saved entries</div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button tonal onClick={() => setClearOpen(true)} disabled={!historyList.length}>
                Clear History
              </Button>
              <Button
                tonal
                onClick={() => {
                  const blob = new Blob([JSON.stringify(historyList, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "revive-history.json";
                  link.click();
                  URL.revokeObjectURL(url);
                  pushToast("History exported.");
                }}
                disabled={!historyList.length}
              >
                Export
              </Button>
            </div>
          </div>
        </Card>
      </Block>

      <Dialog
        opened={clearOpen}
        onBackdropClick={() => setClearOpen(false)}
        title="Clear history?"
        content="This removes local scan history from this browser."
        buttons={
          <>
            <DialogButton onClick={() => setClearOpen(false)}>Cancel</DialogButton>
            <DialogButton
              strong
              onClick={() => {
                setHistoryEntries([]);
                setClearOpen(false);
                pushToast("History cleared.");
              }}
            >
              Clear
            </DialogButton>
          </>
        }
      />

      <Dialog
        opened={deleteOpen}
        onBackdropClick={() => setDeleteOpen(false)}
        title="Delete account?"
        content="This permanently deletes your account and associated data."
        buttons={
          <>
            <DialogButton onClick={() => setDeleteOpen(false)}>Cancel</DialogButton>
            <DialogButton strong onClick={deleteAccount}>
              Delete
            </DialogButton>
          </>
        }
      />
    </Page>
  );
}

function SettingsRoute() {
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
  } = usePwa();

  return (
    <Page className="pb-32 revive-route-page">
      <RouteHeader title="Settings" subtitle="Light / Dark / System" />
      <Block className="space-y-3">
        <Card className="revive-card">
          <div className="p-4">
            <BlockTitle className="mt-0">Theme</BlockTitle>
            <Segmented strong className="mt-2">
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
          </div>
        </Card>

        <Card className="revive-card">
          <List strong inset>
            <ListInput
              label="Default ZIP"
              type="text"
              value={defaultZip}
              inputMode="numeric"
              placeholder="US ZIP"
              onInput={(event) => setDefaultZip(clampZip(event.target.value))}
            />
            <ListItem
              title="Allow web search"
              subtitle="Use local web lookups for ZIP-specific guidance."
              after={<Toggle checked={allowWebSearch} onChange={(event) => setAllowWebSearch(event.target.checked)} />}
            />
            <ListItem
              title="Auto-sync impact"
              subtitle="Sync local activity for signed-in accounts."
              after={<Toggle checked={autoSyncImpact} onChange={(event) => setAutoSyncImpact(event.target.checked)} />}
            />
            <ListItem
              title="Show capture instructions"
              after={
                <Toggle
                  checked={showCaptureInstructions}
                  onChange={(event) => setShowCaptureInstructions(event.target.checked)}
                />
              }
            />
            <ListItem
              title="Haptic feedback"
              after={<Toggle checked={enableHaptics} onChange={(event) => setEnableHaptics(event.target.checked)} />}
            />
            <ListItem
              title="Reduce motion"
              after={<Toggle checked={reduceMotion} onChange={(event) => setReduceMotion(event.target.checked)} />}
            />
          </List>
        </Card>
      </Block>
    </Page>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-[11px] uppercase tracking-wide opacity-70">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function ImpactEntrySheet({ entry, onClose }) {
  return (
    <div className="p-4 pb-10">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-lg font-semibold">{entry.item || "Activity"}</div>
        <Button tonal onClick={onClose}>
          Close
        </Button>
      </div>
      <List strong inset>
        <ListItem title="Material" after={entry.material || "unknown"} />
        <ListItem title="Recyclable" after={entry.recyclable ? "Yes" : "No"} />
        <ListItem title="Bin" after={entry.bin || "trash"} />
        <ListItem title="Source" after={entry.source === "text" ? "Manual" : "Photo"} />
        <ListItem
          title="Scanned"
          after={formatDistanceToNowStrict(new Date(entry.createdAt), { addSuffix: true })}
        />
        <ListItem title="Notes" subtitle={entry.notes || "No special prep."} />
      </List>
    </div>
  );
}
