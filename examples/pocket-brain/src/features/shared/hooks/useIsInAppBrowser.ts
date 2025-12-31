import { useState } from "react";

export function useIsInAppBrowser(): boolean {
  const [isInApp] = useState(() => {
    if (typeof navigator === "undefined") return false;

    const userAgent = navigator.userAgent || navigator.vendor || "";

    // Common in-app browser signatures
    const inAppPatterns = [
      /FBAN|FBAV|FB_IAB/i, // Facebook & Messenger
      /Instagram/i,
      /Line\//i,
      /Twitter|X-Twitter/i,
      /TikTok/i,
      /LinkedInApp/i,
      /Snapchat/i,
      /Pinterest/i,
      /Reddit/i,
      /GSA\//i, // Google app
    ];

    const matchesKnownInApp = inAppPatterns.some((pattern) => pattern.test(userAgent));

    // Android WebView heuristic: "; wv" indicates WebView
    const isAndroid = /Android/i.test(userAgent);
    const hasWvToken = /; wv\)/i.test(userAgent) || /\bwv\b/i.test(userAgent);

    return matchesKnownInApp || (isAndroid && hasWvToken);
  });

  return isInApp;
}
