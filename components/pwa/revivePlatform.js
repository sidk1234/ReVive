export function detectPlatform() {
  if (typeof window === "undefined") {
    return { isIOS: false, isAndroid: false, theme: "ios", browser: "unknown" };
  }
  const ua = window.navigator.userAgent || "";
  const lower = ua.toLowerCase();
  const isAndroid = /android/.test(lower);
  const isIOS = /iphone|ipad|ipod/.test(lower);
  const isChrome = /chrome|crios/.test(lower) && !/edg|opr/.test(lower);
  return {
    isIOS,
    isAndroid,
    browser: isChrome ? "chrome" : "other",
    theme: isAndroid ? "material" : "ios",
  };
}

export function isStandaloneDisplay() {
  if (typeof window === "undefined") return true;
  const media = window.matchMedia?.("(display-mode: standalone)")?.matches;
  const ios = window.navigator.standalone === true;
  return Boolean(media || ios);
}
