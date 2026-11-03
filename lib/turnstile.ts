/**
 * Shared Cloudflare Turnstile configuration.
 *
 * Only the site key is public. The secret key is read exclusively inside the
 * server-side verification route (`app/api/turnstile/verify/route.ts`) and must
 * never be imported into client code.
 */
export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** Labels the widget so the server can identify which challenge it belongs to. */
export const TURNSTILE_ACTION = "upi_qr_generate";

export type TurnstileTheme = "light" | "dark" | "auto";

export type TurnstileWidgetOptions = {
  sitekey: string;
  action?: string;
  theme?: TurnstileTheme;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  "error-callback"?: () => void;
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
