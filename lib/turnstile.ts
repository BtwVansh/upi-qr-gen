/**
 * Shared Cloudflare Turnstile configuration.
 *
 * Only the site key is public. The secret key is read exclusively inside the
 * server-side verification route (`app/api/turnstile/verify/route.ts`) and must
 * never be imported into client code.
 */

const RAW_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

/**
 * Environment-variable editors and documentation examples often include the
 * surrounding angle brackets when a key is pasted, e.g. `<0x4AAAAAAA...>`.
 * Turnstile rejects that value at render time, so strip one layer of wrapping
 * brackets or quotes and any stray whitespace.
 */
export function normalizeTurnstileSiteKey(value: string): string {
  return value
    .trim()
    .replace(/^[<"'“”‘’]+/, "")
    .replace(/[>"'“”‘’]+$/, "")
    .trim();
}

/** Cloudflare site keys are URL-safe tokens, never markup. */
export function isValidTurnstileSiteKey(value: string): boolean {
  return /^[A-Za-z0-9_-]{10,}$/.test(value);
}

export const TURNSTILE_SITE_KEY = normalizeTurnstileSiteKey(RAW_SITE_KEY);

export const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** Fixed id so only one Turnstile script tag can ever exist. */
export const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";

/** Labels the widget so the server can identify which challenge it belongs to. */
export const TURNSTILE_ACTION = "upi_qr_generate";

const SCRIPT_TIMEOUT_MS = 15_000;

export type TurnstileTheme = "light" | "dark" | "auto";

export type TurnstileWidgetOptions = {
  sitekey: string;
  action?: string;
  theme?: TurnstileTheme;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  "error-callback"?: (errorCode?: string) => void;
};

export type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileWidgetOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function getTurnstileApi(): TurnstileApi | null {
  if (typeof window === "undefined") return null;
  const api = window.turnstile;
  return api && typeof api.render === "function" ? api : null;
}

let scriptPromise: Promise<TurnstileApi> | null = null;

/**
 * Clears the memoised loader and removes a failed script tag so the Retry
 * action can make a genuinely fresh attempt.
 */
export function resetTurnstileScriptLoader(): void {
  scriptPromise = null;
  if (typeof document !== "undefined") {
    document.getElementById(TURNSTILE_SCRIPT_ID)?.remove();
  }
}

/**
 * Loads the Turnstile script exactly once, on the client only.
 *
 * This intentionally does not use `next/script`: that component emits a
 * `<link rel="preload">` during SSR and can execute the third-party script while
 * React is still hydrating. Turnstile mutates the DOM as soon as it starts, so
 * running it inside the hydration window can produce React error #418. Calling
 * this from an effect keeps the integration out of both the server render and
 * the hydration pass.
 */
export function loadTurnstileScript(): Promise<TurnstileApi> {
  const existing = getTurnstileApi();
  if (existing) return Promise.resolve(existing);

  if (scriptPromise) return scriptPromise;

  if (typeof document === "undefined") {
    return Promise.reject(new Error("Turnstile can only load in the browser."));
  }

  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    let script = document.getElementById(TURNSTILE_SCRIPT_ID) as
      | HTMLScriptElement
      | null;
    let settled = false;

    const cleanup = () => {
      window.clearTimeout(timeout);
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
    };

    const succeed = () => {
      if (settled) return;
      const api = getTurnstileApi();
      if (!api) {
        fail("Cloudflare Turnstile loaded without an API.");
        return;
      }
      settled = true;
      cleanup();
      resolve(api);
    };

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      scriptPromise = null;
      script?.remove();
      reject(new Error(message));
    };

    function handleLoad() {
      succeed();
    }

    function handleError() {
      fail("Cloudflare Turnstile could not load.");
    }

    if (!script) {
      script = document.createElement("script");
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    // Never leave the widget spinning forever if the network hangs.
    const timeout = window.setTimeout(() => {
      fail("Cloudflare Turnstile did not finish loading.");
    }, SCRIPT_TIMEOUT_MS);
  });

  return scriptPromise;
}
