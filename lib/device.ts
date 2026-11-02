export type Platform =
  | "android"
  | "ios"
  | "windows"
  | "macos"
  | "linux"
  | "other"
  | "unknown";

export type DeviceInfo = {
  platform: Platform;
  label: string;
  isMobile: boolean;
  isDesktop: boolean;
  isIPad: boolean;
  supportsAppLaunch: boolean;
};

export type DeviceSignals = {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  /** navigator.userAgentData.platform when the browser exposes it. */
  uaPlatform?: string;
};

type UserAgentDataLike = {
  platform?: string;
};

type NavigatorWithUAData = Navigator & {
  userAgentData?: UserAgentDataLike;
};

const UNKNOWN_DEVICE: DeviceInfo = {
  platform: "unknown",
  label: "Detecting device…",
  isMobile: false,
  isDesktop: false,
  isIPad: false,
  supportsAppLaunch: false,
};

/**
 * Pure platform detection, separated from the browser globals so every branch
 * can be tested. It combines several signals instead of trusting one
 * user-agent substring:
 * - `navigator.userAgentData.platform` where Chromium exposes it
 * - `navigator.userAgent`
 * - `navigator.platform` (legacy, but still useful)
 * - `navigator.maxTouchPoints`, required for iPadOS, which can report a
 *   desktop macOS user agent in Safari
 */
export function detectDeviceFromSignals(signals: DeviceSignals): DeviceInfo {
  const ua = signals.userAgent ?? "";
  const platformHint = `${signals.uaPlatform ?? ""} ${signals.platform ?? ""}`.trim();
  const maxTouchPoints = signals.maxTouchPoints ?? 0;

  const isIPhoneOrPod = /iPhone|iPod/i.test(ua);
  const isIPadUA = /iPad/i.test(ua);
  // iPhone user agents also contain "Mac OS X", so exclude them explicitly
  // before using touch points to recognise iPadOS's desktop-style UA.
  const isIPadOSDesktopUA =
    !isIPhoneOrPod &&
    !isIPadUA &&
    /Macintosh|Mac OS X/i.test(ua) &&
    maxTouchPoints > 1;
  const isIPad =
    isIPadUA ||
    isIPadOSDesktopUA ||
    (/iPad/i.test(platformHint) && maxTouchPoints > 0);

  if (isIPhoneOrPod || isIPad) {
    return {
      platform: "ios",
      label: isIPad ? "iPad" : "iPhone",
      isMobile: true,
      isDesktop: false,
      isIPad,
      supportsAppLaunch: true,
    };
  }

  if (/Android/i.test(ua) || /Android/i.test(platformHint)) {
    return {
      platform: "android",
      label: "Android device",
      isMobile: true,
      isDesktop: false,
      isIPad: false,
      supportsAppLaunch: true,
    };
  }

  if (/CrOS/i.test(ua) || /Chrome OS/i.test(platformHint)) {
    return {
      platform: "other",
      label: "ChromeOS device",
      isMobile: false,
      isDesktop: false,
      isIPad: false,
      supportsAppLaunch: false,
    };
  }

  // Prefer the user agent for desktop OS families. Platform hints are a
  // fallback for browsers that ship a generic user agent; this avoids a
  // spoofed `navigator.platform` overriding a clear UA.
  const isWindows = /Windows/i.test(ua);
  const isMac = /Macintosh|Mac OS X/i.test(ua);
  const isLinux = /Linux|X11/i.test(ua);

  if (isWindows || (!isMac && !isLinux && /Win/i.test(platformHint))) {
    return {
      platform: "windows",
      label: "Windows",
      isMobile: false,
      isDesktop: true,
      isIPad: false,
      supportsAppLaunch: false,
    };
  }

  if (isMac || (!isWindows && !isLinux && /Mac/i.test(platformHint))) {
    return {
      platform: "macos",
      label: "macOS",
      isMobile: false,
      isDesktop: true,
      isIPad: false,
      supportsAppLaunch: false,
    };
  }

  if (isLinux || /Linux/i.test(platformHint)) {
    return {
      platform: "linux",
      label: "Linux",
      isMobile: false,
      isDesktop: true,
      isIPad: false,
      supportsAppLaunch: false,
    };
  }

  return {
    platform: "other",
    label: "this device",
    isMobile: false,
    isDesktop: false,
    isIPad: false,
    supportsAppLaunch: false,
  };
}

/**
 * Client-only entry point. Must run inside `useEffect`, never during render,
 * so server HTML and the first client render agree.
 */
export function detectDevice(): DeviceInfo {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return UNKNOWN_DEVICE;
  }

  const nav = navigator as NavigatorWithUAData;

  return detectDeviceFromSignals({
    userAgent: nav.userAgent ?? "",
    platform: nav.platform ?? "",
    maxTouchPoints: nav.maxTouchPoints ?? 0,
    uaPlatform: nav.userAgentData?.platform,
  });
}

export { UNKNOWN_DEVICE };
