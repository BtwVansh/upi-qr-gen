import type { Platform } from "@/lib/device";

export type PaymentAppId = "google-pay" | "phonepe" | "paytm";

export type PaymentApp = {
  id: PaymentAppId;
  name: string;
  /** Android application package used in a package-targeted UPI intent. */
  androidPackage: string;
  /** iOS URL scheme documented/used by the app for UPI payments. */
  iosScheme: string;
  monogram: string;
  brandClass: string;
};

export const PAYMENT_APPS: readonly PaymentApp[] = [
  {
    id: "google-pay",
    name: "Google Pay",
    androidPackage: "com.google.android.apps.nbu.paisa.user",
    iosScheme: "gpay://upi/pay",
    monogram: "G",
    brandClass: "bg-[#1a73e8] text-white",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    androidPackage: "com.phonepe.app",
    iosScheme: "phonepe://pay",
    monogram: "P",
    brandClass: "bg-[#5f259f] text-white",
  },
  {
    id: "paytm",
    name: "Paytm",
    androidPackage: "net.one97.paytm",
    iosScheme: "paytmmp://pay",
    monogram: "P",
    brandClass: "bg-[#00baf2] text-[#012b72]",
  },
] as const;

function getUpiQuery(upiUri: string): string {
  const prefix = "upi://pay?";
  return upiUri.startsWith(prefix) ? upiUri.slice(prefix.length) : upiUri;
}

/**
 * Android: a package-targeted intent keeps the payment inside the chosen app.
 * Chrome and other Android browsers support the `intent://` syntax. The
 * browser fallback returns the visitor to the payment page if the package is
 * not installed, instead of showing a dead end.
 */
function buildAndroidIntentUrl(
  app: PaymentApp,
  upiUri: string,
  fallbackUrl: string,
): string {
  const query = getUpiQuery(upiUri);
  const fallback = encodeURIComponent(fallbackUrl);
  return `intent://pay?${query}#Intent;scheme=upi;package=${app.androidPackage};S.browser_fallback_url=${fallback};end`;
}

/**
 * iOS: each app exposes its own UPI scheme. They are deliberately not the
 * Android intent URLs. iOS may show a browser alert when the app is absent;
 * the page always keeps the QR code and other apps as fallbacks.
 */
function buildIosUrl(app: PaymentApp, upiUri: string): string {
  return `${app.iosScheme}?${getUpiQuery(upiUri)}`;
}

export function getAppLaunchUrl(
  app: PaymentApp,
  platform: Platform,
  upiUri: string,
  fallbackUrl: string,
): string | null {
  if (platform === "android") {
    return buildAndroidIntentUrl(app, upiUri, fallbackUrl);
  }
  if (platform === "ios") {
    return buildIosUrl(app, upiUri);
  }
  return null;
}

export function getPaymentApp(id: PaymentAppId): PaymentApp {
  const app = PAYMENT_APPS.find((candidate) => candidate.id === id);
  if (!app) {
    throw new Error(`Unknown payment app: ${id}`);
  }
  return app;
}
