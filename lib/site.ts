/**
 * Public site identity and canonical origin.
 *
 * The production deployment lives at the apex Netlify subdomain. A fork can
 * override this with NEXT_PUBLIC_SITE_URL, but the default is intentional:
 * every generated link must point at the real public site even when the app
 * is running locally or on a preview deploy.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://upigenerator.netlify.app"
).replace(/\/+$/, "");

export const SITE_NAME = "UPI QR Generator";
export const SITE_TAGLINE = "Your UPI. One Link.";
export const SITE_DESCRIPTION =
  "Create a scannable UPI payment QR code and a permanent, shareable payment link in seconds. Add an optional amount, with no sign-up, fees or stored payment data.";

export const GITHUB_URL = "https://github.com/BtwVansh/upi-qr-gen";
