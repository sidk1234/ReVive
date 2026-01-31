import { useEffect, useMemo, useState } from "react";
import {
  App,
  Badge,
  Block,
  BlockTitle,
  Button,
  Card,
  CardContent,
  Dialog,
  Input,
  List,
  ListInput,
  ListItem,
  Navbar,
  Page,
  Preloader,
  Tabbar,
  TabbarLink,
  Toggle,
  Toolbar,
  ToolbarPane,
  Toast,
} from "konsta/react";
import {
  CameraFill,
  ChartBarFill,
  GearshapeFill,
  ListNumberRtl,
  PersonCropCircleFill,
  Search,
  TrashFill,
} from "framework7-icons/react";

import { formatDistanceToNowStrict } from "date-fns";
import { useLocalStorageState } from "./useLocalStorageState";
import { useSupabaseSession } from "./supabasePwa";
import { buildRecyclingPrompt } from "./recyclingPrompt";
import { parseRecyclingResponse } from "./parseRecyclingResponse";
import { supabase } from "../../utils/supabaseClient";

function GlassCard({ children, className = "" }) {
  return (
    <Card
      className={
        "bg-white/10 dark:bg-black/20 border border-white/15 dark:border-white/10 backdrop-blur-xl shadow-lg rounded-2xl " +
        className
      }
    >
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

function clampZip(zip) {
  const z = (zip || "").trim();
  if (!z) return "";
  // Keep digits only; allow 5 or 9.
  const digits = z.replace(/[^0-9]/g, "");
  return digits.slice(0, 9);
}

function makeId() {
  return "scan_" + Math.random().toString(36).slice(2) + "_" + Date.now().toString(36);
}

export function ReVivePWA({ initialTab = "scan" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { session, loading: authLoading } = useSupabaseSession();

  // Settings (local first; can be synced later)
  const [zipCode, setZipCode] = useLocalStorageState("revive.zip", "");
  const [locationAware, setLocationAware] = useLocalStorageState(
    "revive.locationAware",
    true
  );
  const [autoSaveHistory, setAutoSaveHistory] = useLocalStorageState(
    "revive.autoSaveHistory",
    true
  );
  const [autoSyncImpact, setAutoSyncImpact] = useLocalStorageState(
    "revive.autoSyncImpact",
    true
  );

  // History
  const [history, setHistory] = useLocalStorageState("revive.history", []);

  // UI state
  const [toast, setToast] = useState({ opened: false, text: "" });
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // PWA service worker (scoped to /app)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Avoid spamming registrations
    navigator.serviceWorker
      .register("/app/sw.js")
      .catch(() => {
        /* ignore */
      });
  }, []);

  const stats = useMemo(() => {
    const entries = Array.isArray(history) ? history : [];
    const totalScans = entries.length;
    const recyclableCount = entries.filter((e) => e?.recyclable === true).length;
    const lastScan = entries[0]?.createdAt ? new Date(entries[0].createdAt) : null;
    const points = entries.reduce((acc, e) => {
      if (e?.source === "photo" && e?.recyclable === true) return acc + 1;
      return acc;
    }, 0);
    return { totalScans, recyclableCount, lastScan, points };
  }, [history]);

  const topNavTitle = useMemo(() => {
    switch (activeTab) {
      case "scan":
        return "ReVive";
      case "impact":
        return "Impact";
      case "leaderboard":
        return "Leaderboard";
      case "account":
        return "Account";
      case "settings":
        return "Settings";
      default:
        return "ReVive";
    }
  }, [activeTab]);

  return (
    <App theme="ios" className="min-h-screen">
      <Page className="bg-black">
        <Navbar
          title={topNavTitle}
          className="bg-transparent text-white"
          right={
            <div className="flex items-center gap-2">
              {authLoading ? (
                <Preloader size="w-5 h-5" />
              ) : session ? (
                <Badge className="bg-white/15">Signed in</Badge>
              ) : (
                <Badge className="bg-white/10">Guest</Badge>
              )}
            </div>
          }
        />

        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/25 via-sky-500/15 to-fuchsia-500/15" />

          {activeTab === "scan" && (
            <ScanTab
              session={session}
              zipCode={zipCode}
              setZipCode={(z) => setZipCode(clampZip(z))}
              locationAware={locationAware}
              autoSaveHistory={autoSaveHistory}
              autoSyncImpact={autoSyncImpact}
              onSaved={(entry) => {
                setHistory((prev) => [entry, ...(Array.isArray(prev) ? prev : [])]);
                setToast({ opened: true, text: "Saved to history" });
              }}
              onToast={(text) => setToast({ opened: true, text })}
            />
          )}

          {activeTab === "impact" && (
            <ImpactTab
              session={session}
              stats={stats}
              history={history}
              onToast={(text) => setToast({ opened: true, text })}
            />
          )}

          {activeTab === "leaderboard" && (
            <LeaderboardTab
              session={session}
              onToast={(text) => setToast({ opened: true, text })}
            />
          )}

          {activeTab === "account" && (
            <AccountTab
              session={session}
              history={history}
              onDelete={(id) => {
                setHistory((prev) =>
                  (Array.isArray(prev) ? prev : []).filter((e) => e?.id !== id)
                );
                setToast({ opened: true, text: "Removed from history" });
              }}
              onClearAll={() => setConfirmClear(true)}
              onToast={(text) => setToast({ opened: true, text })}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab
              session={session}
              zipCode={zipCode}
              setZipCode={(z) => setZipCode(clampZip(z))}
              locationAware={locationAware}
              setLocationAware={setLocationAware}
              autoSaveHistory={autoSaveHistory}
              setAutoSaveHistory={setAutoSaveHistory}
              autoSyncImpact={autoSyncImpact}
              setAutoSyncImpact={setAutoSyncImpact}
              stats={stats}
              onToast={(text) => setToast({ opened: true, text })}
            />
          )}
        </div>

        <Toolbar className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-xl border-t border-white/10">
          <Tabbar labels className="w-full">
            <ToolbarPane>
              <TabbarLink
                active={activeTab === "settings"}
                onClick={() => setActiveTab("settings")}
                icon={<GearshapeFill className="w-6 h-6" />}
                label="Settings"
              />
            </ToolbarPane>
            <ToolbarPane>
              <TabbarLink
                active={activeTab === "account"}
                onClick={() => setActiveTab("account")}
                icon={<PersonCropCircleFill className="w-6 h-6" />}
                label="Account"
              />
            </ToolbarPane>
            <ToolbarPane>
              <TabbarLink
                active={activeTab === "scan"}
                onClick={() => setActiveTab("scan")}
                icon={<CameraFill className="w-6 h-6" />}
                label="Scan"
              />
            </ToolbarPane>
            <ToolbarPane>
              <TabbarLink
                active={activeTab === "impact"}
                onClick={() => setActiveTab("impact")}
                icon={<ChartBarFill className="w-6 h-6" />}
                label="Impact"
              />
            </ToolbarPane>
            <ToolbarPane>
              <TabbarLink
                active={activeTab === "leaderboard"}
                onClick={() => setActiveTab("leaderboard")}
                icon={<ListNumberRtl className="w-6 h-6" />}
                label="Top"
              />
            </ToolbarPane>
          </Tabbar>
        </Toolbar>

        <Toast
          opened={toast.opened}
          onToastClosed={() => setToast((t) => ({ ...t, opened: false }))}
          text={toast.text}
        />

        <Dialog
          opened={confirmClear}
          onBackdropClick={() => setConfirmClear(false)}
          title="Clear scan history?"
          content="This removes scan history stored on this device."
          buttons={[
            {
              text: "Cancel",
              onClick: () => setConfirmClear(false),
            },
            {
              text: "Clear",
              bold: true,
              onClick: () => {
                setConfirmClear(false);
                setHistory([]);
                setToast({ opened: true, text: "History cleared" });
              },
            },
          ]}
        />
      </Page>
    </App>
  );
}

export default ReVivePWA;

function ScanTab({
  session,
  zipCode,
  setZipCode,
  locationAware,
  autoSaveHistory,
  autoSyncImpact,
  onSaved,
  onToast,
}) {
  const [mode, setMode] = useState("photo");
  const [freeText, setFreeText] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [raw, setRaw] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function analyze() {
    const zip = locationAware ? clampZip(zipCode) : "";
    if (locationAware && zip.length > 0 && zip.length < 5) {
      onToast("ZIP should be 5 digits");
      return;
    }
    if (mode === "photo" && !file) {
      onToast("Add a photo first");
      return;
    }
    if (mode === "text" && !freeText.trim()) {
      onToast("Describe the item first");
      return;
    }

    setLoading(true);
    setResult(null);
    setRaw("");

    try {
      const prompt = buildRecyclingPrompt({
        zipCode: zip,
        freeText: mode === "text" ? freeText : "",
      });

      let imageDataUrl = null;
      if (mode === "photo") {
        imageDataUrl = await fileToDataUrl(file);
      }

      const token = session?.access_token;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Edge function name matches Swift client: /functions/v1/rec-ai/openai
      const res = await fetch(`${supabaseUrl}/functions/v1/rec-ai/openai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anon,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          mode: "recycling",
          prompt,
          image: imageDataUrl,
          contextImage: null,
          maxOutputTokens: 450,
          useWebSearch: true,
        }),
      });

      const json = await res.json().catch(() => ({}));
      const text = (json?.text || "").trim();
      setRaw(text || JSON.stringify(json));
      const parsed = parseRecyclingResponse(text);
      setResult(parsed);

      if (autoSaveHistory) {
        const entry = normalizeToHistoryEntry({
          id: makeId(),
          createdAt: new Date().toISOString(),
          zip,
          source: mode,
          freeText: mode === "text" ? freeText.trim() : "",
          parsed,
          raw: text,
        });
        onSaved(entry);
        if (autoSyncImpact && session?.user?.id) {
          // Best-effort; ignore failures.
          syncImpactEntry(session, entry).catch(() => {});
        }
      }
    } catch (e) {
      onToast(e?.message || "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-24">
      <Block className="pt-4">
        <div className="text-white">
          <div className="text-3xl font-semibold tracking-tight">Scan. Sort. Save.</div>
          <div className="mt-2 text-white/70">
            Identify an item and get a single, location-specific recycling decision.
          </div>
        </div>
      </Block>

      <Block className="mt-2">
        <GlassCard>
          <div className="flex items-center gap-2">
            <Button
              small
              outline={mode !== "photo"}
              onClick={() => setMode("photo")}
              className="flex-1"
            >
              Photo
            </Button>
            <Button
              small
              outline={mode !== "text"}
              onClick={() => setMode("text")}
              className="flex-1"
            >
              Text
            </Button>
          </div>

          <div className="mt-4">
            {mode === "photo" ? (
              <div className="space-y-3">
                <label className="block">
                  <div className="text-white/80 text-sm mb-2">Take a photo</div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-white/80 file:mr-4 file:rounded-xl file:border-0 file:bg-white/15 file:px-4 file:py-2 file:text-white hover:file:bg-white/20"
                  />
                </label>

                {previewUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="w-full max-h-72 object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-white/60">
                    <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/10">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="mt-3">Add a photo to begin</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-white/80 text-sm">Describe the item</div>
                <Input
                  type="textarea"
                  placeholder='e.g., "Starbucks paper cup with plastic lid"'
                  value={freeText}
                  onInput={(e) => setFreeText(e.target.value)}
                  className="min-h-[90px]"
                />
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <GlassCard className="bg-white/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-white font-medium">Location</div>
                  <div className="text-white/60 text-sm">
                    Used to match your local program rules.
                  </div>
                </div>
                <Toggle checked={locationAware} readOnly />
              </div>
              <div className="mt-3">
                <ListInput
                  type="text"
                  inputMode="numeric"
                  placeholder="ZIP code"
                  value={zipCode}
                  disabled={!locationAware}
                  onInput={(e) => setZipCode(e.target.value)}
                />
              </div>
            </GlassCard>

            <Button
              large
              onClick={analyze}
              disabled={loading}
              className="rounded-2xl"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Preloader size="w-5 h-5" /> Scanning…
                </div>
              ) : (
                "Analyze"
              )}
            </Button>
          </div>
        </GlassCard>
      </Block>

      {(result || raw) && (
        <Block className="mt-2">
          <GlassCard>
            <div className="text-white text-lg font-semibold">Result</div>
            {result ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-white text-xl font-semibold">
                      {result.item || "Item"}
                    </div>
                    <div className="text-white/70">
                      {result.material || ""}
                    </div>
                  </div>
                  <Badge
                    className={
                      result.recyclable === true
                        ? "bg-emerald-500/25 border border-emerald-400/30 text-emerald-100"
                        : "bg-rose-500/20 border border-rose-400/30 text-rose-100"
                    }
                  >
                    {result.recyclable === true ? "Recyclable" : "Not Recyclable"}
                  </Badge>
                </div>

                {result.bin ? (
                  <GlassCard className="bg-white/5">
                    <div className="text-white/80 text-sm">Bin</div>
                    <div className="text-white text-lg font-medium">{result.bin}</div>
                  </GlassCard>
                ) : null}

                {result.instructions ? (
                  <GlassCard className="bg-white/5">
                    <div className="text-white/80 text-sm">Instructions</div>
                    <div className="text-white/90 whitespace-pre-wrap">
                      {result.instructions}
                    </div>
                  </GlassCard>
                ) : null}

                {result.notes ? (
                  <div className="text-white/70 whitespace-pre-wrap">{result.notes}</div>
                ) : null}
              </div>
            ) : (
              <div className="mt-3 text-white/80 whitespace-pre-wrap">{raw}</div>
            )}
          </GlassCard>
        </Block>
      )}
    </div>
  );
}

function ImpactTab({ session, stats, history, onToast }) {
  const [remote, setRemote] = useState({ loading: false, data: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!session?.access_token) return;
      setRemote({ loading: true, data: null });
      try {
        // Mirrors Swift SupabaseService.fetchUserImpact
        const { data, error } = await supabase
          .from("user_impact")
          .select("current_streak,best_streak,total_scans,recyclable_scans")
          .limit(1)
          .single();
        if (error) throw error;
        if (!cancelled) setRemote({ loading: false, data });
      } catch {
        if (!cancelled) setRemote({ loading: false, data: null });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  const local = useMemo(() => {
    const entries = Array.isArray(history) ? history : [];
    const dayKeys = new Set(
      entries
        .map((e) => e?.createdAt)
        .filter(Boolean)
        .map((iso) => iso.slice(0, 10))
    );
    return { uniqueDays: dayKeys.size };
  }, [history]);

  const s = remote.data
    ? {
        totalScans: remote.data.total_scans ?? stats.totalScans,
        recyclableCount: remote.data.recyclable_scans ?? stats.recyclableCount,
        currentStreak: remote.data.current_streak,
        bestStreak: remote.data.best_streak,
        points: stats.points,
      }
    : {
        totalScans: stats.totalScans,
        recyclableCount: stats.recyclableCount,
        currentStreak: null,
        bestStreak: null,
        points: stats.points,
      };

  return (
    <div className="pb-24">
      <Block className="pt-4">
        <GlassCard>
          <div className="text-white text-xl font-semibold">Your impact</div>
          <div className="mt-1 text-white/70">
            {stats.lastScan
              ? `Last scan ${formatDistanceToNowStrict(stats.lastScan)} ago`
              : "No scans yet"}
          </div>
          {remote.loading ? (
            <div className="mt-3 flex items-center gap-2 text-white/70">
              <Preloader size="w-5 h-5" /> Loading…
            </div>
          ) : null}
        </GlassCard>
      </Block>

      <BlockTitle className="text-white/80">Highlights</BlockTitle>
      <Block className="space-y-3">
        <GlassCard>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Total scans" value={String(s.totalScans)} />
            <Metric label="Recyclable" value={String(s.recyclableCount)} />
            <Metric label="Photo points" value={String(s.points)} />
            <Metric label="Active days" value={String(local.uniqueDays)} />
          </div>
        </GlassCard>

        {session ? (
          <GlassCard className="bg-white/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-white font-medium">Sync status</div>
                <div className="text-white/60 text-sm">
                  If the backend tables are enabled, your streak and leaderboard update.
                </div>
              </div>
              <Badge className="bg-white/15">Connected</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Metric
                label="Current streak"
                value={s.currentStreak == null ? "—" : String(s.currentStreak)}
              />
              <Metric
                label="Best streak"
                value={s.bestStreak == null ? "—" : String(s.bestStreak)}
              />
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="bg-white/5">
            <div className="text-white font-medium">Sign in for synced impact</div>
            <div className="text-white/60 text-sm mt-1">
              Your device history still works while signed out.
            </div>
          </GlassCard>
        )}
      </Block>

      <Block className="mt-2">
        <Button
          outline
          onClick={() => {
            onToast("Tip: scan with Photo to earn points");
          }}
          className="rounded-2xl"
        >
          Tips
        </Button>
      </Block>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
      <div className="text-white/60 text-xs">{label}</div>
      <div className="text-white text-xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function LeaderboardTab({ session, onToast }) {
  const [state, setState] = useState({ loading: true, rows: [] });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState({ loading: true, rows: [] });
      try {
        // Swift uses a view: impact_leaderboard
        const { data, error } = await supabase
          .from("impact_leaderboard")
          .select("user_id,points,recyclable_scans,total_scans,username,full_name")
          .limit(50);
        if (error) throw error;
        const rows = Array.isArray(data) ? data : [];
        if (!cancelled) setState({ loading: false, rows });
      } catch {
        // Fallback: profiles table (if present)
        try {
          const { data } = await supabase
            .from("profiles")
            .select("id,full_name,username,total_recycled")
            .order("total_recycled", { ascending: false })
            .limit(50);
          const rows = (Array.isArray(data) ? data : []).map((r) => ({
            user_id: r.id,
            full_name: r.full_name,
            username: r.username,
            points: r.total_recycled,
            recyclable_scans: null,
            total_scans: null,
          }));
          if (!cancelled) setState({ loading: false, rows });
        } catch {
          if (!cancelled) setState({ loading: false, rows: [] });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="pb-24">
      <Block className="pt-4">
        <GlassCard>
          <div className="text-white text-xl font-semibold">Top recyclers</div>
          <div className="mt-1 text-white/70">
            {session
              ? "Updates when users sync impact entries."
              : "Sign in to see your rank on supported backends."}
          </div>
        </GlassCard>
      </Block>

      <Block className="mt-2">
        <GlassCard>
          {state.loading ? (
            <div className="flex items-center gap-2 text-white/70">
              <Preloader size="w-5 h-5" /> Loading…
            </div>
          ) : state.rows.length ? (
            <List strong inset className="bg-transparent">
              {state.rows.slice(0, 25).map((r, idx) => {
                const name = r.full_name || r.username || "User";
                const points = r.points ?? 0;
                return (
                  <ListItem
                    key={r.user_id || idx}
                    title={`${idx + 1}. ${name}`}
                    after={
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white/10">{points}</Badge>
                      </div>
                    }
                    subtitle={
                      r.recyclable_scans != null && r.total_scans != null
                        ? `${r.recyclable_scans}/${r.total_scans} recyclable`
                        : undefined
                    }
                    className="text-white"
                  />
                );
              })}
            </List>
          ) : (
            <div className="text-white/70">
              Leaderboard is unavailable (missing backend view/table).
            </div>
          )}
        </GlassCard>
      </Block>

      <Block className="mt-2">
        <Button
          outline
          onClick={() => onToast("Leaderboard refreshes automatically")}
          className="rounded-2xl"
        >
          About
        </Button>
      </Block>
    </div>
  );
}

function AccountTab({ session, history, onDelete, onClearAll, onToast }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      onToast("Signed in");
    } catch (e) {
      onToast(e?.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function signUp() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      onToast("Check email to confirm sign-up");
    } catch (e) {
      onToast(e?.message || "Sign-up failed");
    } finally {
      setLoading(false);
    }
  }

  async function signInGoogle() {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/app`
              : undefined,
        },
      });
    } catch (e) {
      onToast(e?.message || "Google sign-in failed");
    }
  }

  async function signOut() {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      onToast("Signed out");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-24">
      <Block className="pt-4">
        <GlassCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-white text-xl font-semibold">Profile</div>
              <div className="text-white/70 mt-1">
                {session?.user?.email || "Not signed in"}
              </div>
            </div>
            {session ? (
              <Button small outline onClick={signOut} disabled={loading}>
                Sign out
              </Button>
            ) : null}
          </div>

          {!session ? (
            <div className="mt-4">
              <div className="flex gap-2">
                <Button
                  small
                  outline={mode !== "signin"}
                  onClick={() => setMode("signin")}
                  className="flex-1"
                >
                  Sign in
                </Button>
                <Button
                  small
                  outline={mode !== "signup"}
                  onClick={() => setMode("signup")}
                  className="flex-1"
                >
                  Sign up
                </Button>
              </div>

              <div className="mt-3 space-y-2">
                <ListInput
                  label="Email"
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onInput={(e) => setEmail(e.target.value)}
                />
                <ListInput
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onInput={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2">
                <Button
                  large
                  disabled={loading}
                  onClick={mode === "signin" ? signIn : signUp}
                  className="rounded-2xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Preloader size="w-5 h-5" /> Working…
                    </div>
                  ) : mode === "signin" ? (
                    "Sign in"
                  ) : (
                    "Create account"
                  )}
                </Button>

                <Button outline onClick={signInGoogle} className="rounded-2xl">
                  Continue with Google
                </Button>
              </div>
            </div>
          ) : null}
        </GlassCard>
      </Block>

      <BlockTitle className="text-white/80">Scan history</BlockTitle>
      <Block className="space-y-3">
        <GlassCard>
          {Array.isArray(history) && history.length ? (
            <List strong inset className="bg-transparent">
              {history.slice(0, 50).map((e) => (
                <ListItem
                  key={e.id}
                  title={e.item || "Item"}
                  subtitle={e.material || undefined}
                  after={
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          e.recyclable
                            ? "bg-emerald-500/25 border border-emerald-400/30 text-emerald-100"
                            : "bg-rose-500/20 border border-rose-400/30 text-rose-100"
                        }
                      >
                        {e.recyclable ? "Yes" : "No"}
                      </Badge>
                      <Button
                        small
                        outline
                        onClick={() => onDelete(e.id)}
                        className="rounded-xl"
                      >
                        <TrashFill className="w-4 h-4" />
                      </Button>
                    </div>
                  }
                  text={
                    <div className="text-white/60 text-sm">
                      {e.bin ? `Bin: ${e.bin}` : null}
                      {e.zip ? ` • ZIP ${e.zip}` : null}
                      {e.createdAt
                        ? ` • ${formatDistanceToNowStrict(new Date(e.createdAt))} ago`
                        : null}
                    </div>
                  }
                  className="text-white"
                />
              ))}
            </List>
          ) : (
            <div className="text-white/70">No saved scans yet.</div>
          )}
        </GlassCard>

        <div className="grid grid-cols-2 gap-3">
          <Button outline onClick={onClearAll} className="rounded-2xl">
            Clear
          </Button>
          <Button
            outline
            onClick={() => {
              const blob = new Blob([JSON.stringify(history || [], null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "revive-scan-history.json";
              a.click();
              URL.revokeObjectURL(url);
              onToast("Exported JSON");
            }}
            className="rounded-2xl"
          >
            Export
          </Button>
        </div>
      </Block>
    </div>
  );
}

function SettingsTab({
  session,
  zipCode,
  setZipCode,
  locationAware,
  setLocationAware,
  autoSaveHistory,
  setAutoSaveHistory,
  autoSyncImpact,
  setAutoSyncImpact,
  stats,
  onToast,
}) {
  const [adminUrl, setAdminUrl] = useState("");

  useEffect(() => {
    setAdminUrl(
      typeof window !== "undefined" ? `${window.location.origin}/admin` : ""
    );
  }, []);

  return (
    <div className="pb-24">
      <Block className="pt-4">
        <GlassCard>
          <div className="text-white text-xl font-semibold">Quick actions</div>
          <div className="mt-1 text-white/70">
            Configure how ReVive scans and saves results.
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button outline className="rounded-2xl" onClick={() => onToast("ReVive uses web search + local rules")}>About</Button>
            <Button outline className="rounded-2xl" onClick={() => onToast("Tip: empty + rinse before recycling")}>How it works</Button>
            <Button outline className="rounded-2xl" onClick={() => onToast("Set a weekly goal: 10 scans")}>Goals</Button>
            <Button outline className="rounded-2xl" onClick={() => onToast("Invite friends to climb the leaderboard")}>Community</Button>
          </div>
        </GlassCard>
      </Block>

      <BlockTitle className="text-white/80">App settings</BlockTitle>
      <Block className="space-y-3">
        <GlassCard>
          <List strong inset className="bg-transparent">
            <ListItem
              title="Auto-save scan history"
              after={<Toggle checked={autoSaveHistory} onChange={(e) => setAutoSaveHistory(e.target.checked)} />}
              className="text-white"
            />
            <ListItem
              title="Location-aware recycling"
              after={<Toggle checked={locationAware} onChange={(e) => setLocationAware(e.target.checked)} />}
              className="text-white"
              subtitle="Uses ZIP to match local rules"
            />
            <ListItem
              title="Sync impact (signed-in)"
              after={<Toggle checked={autoSyncImpact} onChange={(e) => setAutoSyncImpact(e.target.checked)} />}
              className="text-white"
              subtitle="Best-effort updates"
            />
            <ListInput
              label="ZIP code"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 61820"
              value={zipCode}
              disabled={!locationAware}
              onInput={(e) => setZipCode(e.target.value)}
            />
          </List>
        </GlassCard>

        <GlassCard className="bg-white/5">
          <div className="text-white font-medium">Device stats</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Metric label="Scans" value={String(stats.totalScans)} />
            <Metric label="Recyclable" value={String(stats.recyclableCount)} />
          </div>
        </GlassCard>

        <GlassCard className="bg-white/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-white font-medium">Admin portal</div>
              <div className="text-white/60 text-sm mt-1">
                Manage flags like cloud photo storage when enabled.
              </div>
            </div>
            <Button
              small
              outline
              onClick={() => {
                if (adminUrl) window.location.href = adminUrl;
              }}
            >
              Open
            </Button>
          </div>
          {!session ? (
            <div className="mt-2 text-white/60 text-sm">
              Sign in to access protected admin features.
            </div>
          ) : null}
        </GlassCard>
      </Block>
    </div>
  );
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function normalizeToHistoryEntry({ id, createdAt, zip, source, freeText, parsed, raw }) {
  // Shape is aligned to Swift ScanHistoryEntry in spirit.
  return {
    id,
    createdAt,
    zip,
    source,
    freeText,
    raw,
    item: parsed?.item || "",
    material: parsed?.material || "",
    recyclable: parsed?.recyclable === true,
    bin: parsed?.bin || "",
    instructions: parsed?.instructions || "",
    notes: parsed?.notes || "",
  };
}

async function syncImpactEntry(session, entry) {
  // Best-effort mirror of Swift: insertImpact(dayKey,itemKey, recyclable, source)
  const userId = session?.user?.id;
  if (!userId) return;
  const dayKey = (entry.createdAt || new Date().toISOString()).slice(0, 10);
  const itemKey = (entry.item || "unknown").toLowerCase().trim().slice(0, 80);
  const payload = {
    user_id: userId,
    day_key: dayKey,
    item_key: itemKey,
    recyclable: entry.recyclable === true,
    source: entry.source === "photo" ? "photo" : "text",
  };
  await supabase.from("impact_entries").upsert(payload, {
    onConflict: "user_id,day_key,item_key",
  });
}
