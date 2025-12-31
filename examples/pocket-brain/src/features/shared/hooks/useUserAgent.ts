import { useMemo } from "react";

export interface UserAgentInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isMac: boolean;
  isLinux: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  isMobile: boolean;
  isInApp: boolean;
  isWindows: boolean;
}

export function useUserAgent(): UserAgentInfo {
  return useMemo(() => {
    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isMobile = /iPad|iPhone|iPod|Android/i.test(ua);

    // Simple check for common in-app browsers
    // FBAN/FBAV (Facebook), Instagram, LinkedInApp, etc.
    const isInApp =
      /(Instagram|FB_IAB|FB4A|FBAV|LinkedInApp|Snapchat|Twitter|Line)/i.test(ua) ||
      // Detects "wv" (WebView) on Android
      (/Android/i.test(ua) && /wv/i.test(ua)) ||
      // Sometimes seen on iOS in-app browsers
      (isIOS && !/Safari/i.test(ua));

    return {
      isIOS,
      isAndroid,
      isMac: /Macintosh|Mac OS X/i.test(ua),
      isLinux: /Linux/i.test(ua) && !/Android/i.test(ua),
      isWindows: /Windows/i.test(ua),
      isSafari: /Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR/i.test(ua),
      isChrome: /Chrome/i.test(ua) && !/Edg|OPR/i.test(ua),
      isFirefox: /Firefox/i.test(ua),
      isEdge: /Edg/i.test(ua),
      isMobile,
      isInApp,
    };
  }, []);
}
