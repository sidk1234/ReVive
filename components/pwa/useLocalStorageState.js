import { useEffect, useMemo, useState } from "react";

/**
 * Minimal localStorage-backed state.
 * - Safe on SSR (reads only after mount)
 * - JSON serializes values
 */
export function useLocalStorageState(key, defaultValue) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState(defaultValue);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw == null) return;
      setState(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, key]);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [mounted, key, state]);

  return useMemo(() => [state, setState], [state]);
}
