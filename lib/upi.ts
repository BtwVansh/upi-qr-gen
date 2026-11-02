import { SITE_URL } from "@/lib/site";

const UPI_LOCAL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*[A-Za-z0-9]$|^[A-Za-z0-9]$/;
const UPI_PSP_PATTERN = /^[A-Za-z0-9][A-Za-z0-9.-]*[A-Za-z0-9]$|^[A-Za-z0-9]{2,}$/;

export type UpiValidation =
  | { valid: true; upiId: string }
  | { valid: false; error: string };

/**
 * Remove invisible copy/paste artefacts and surrounding whitespace. Internal
 * whitespace is deliberately preserved so validation can reject it.
 */
export function normalizeUpiId(input: string): string {
  return input
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

/**
 * Basic syntax validation only. A valid format does not mean the UPI ID is
 * active, belongs to anyone, or is safe to pay. That distinction is shown in
 * the UI and documented in the README.
 */
export function validateUpiId(input: string): UpiValidation {
  const upiId = normalizeUpiId(input);

  if (!upiId) {
    return { valid: false, error: "Enter your UPI ID to continue." };
  }

  if (/\s/.test(upiId)) {
    return {
      valid: false,
      error: "UPI IDs cannot contain spaces. Remove any spaces and try again.",
    };
  }

  if (upiId.length > 80) {
    return {
      valid: false,
      error: "That UPI ID is too long. Check it and try again.",
    };
  }

  const atMatches = upiId.match(/@/g);
  if (!atMatches) {
    return {
      valid: false,
      error: "Include the bank handle after @ — for example name@okaxis.",
    };
  }

  if (atMatches.length > 1) {
    return {
      valid: false,
      error: "A UPI ID contains exactly one @. Check the address and try again.",
    };
  }

  const atIndex = upiId.indexOf("@");
  const localPart = upiId.slice(0, atIndex);
  const psp = upiId.slice(atIndex + 1);

  if (localPart.length < 1) {
    return {
      valid: false,
      error: "Add the part of your UPI ID that comes before @.",
    };
  }

  if (localPart.length > 64) {
    return {
      valid: false,
      error: "The part before @ is too long. Check your UPI ID and try again.",
    };
  }

  if (!UPI_LOCAL_PATTERN.test(localPart)) {
    return {
      valid: false,
      error:
        "The part before @ can only use letters, numbers, dots, hyphens and underscores, and must start and end with a letter or number.",
    };
  }

  if (psp.length < 2) {
    return {
      valid: false,
      error: "Add the full bank handle after @ — for example @okaxis or @ybl.",
    };
  }

  if (psp.length > 32) {
    return {
      valid: false,
      error: "The bank handle after @ looks too long. Check it and try again.",
    };
  }

  if (!UPI_PSP_PATTERN.test(psp)) {
    return {
      valid: false,
      error:
        "The bank handle after @ can only use letters, numbers, dots and hyphens, and must start and end with a letter or number.",
    };
  }

  return { valid: true, upiId };
}

export function isValidUpiId(input: string): boolean {
  return validateUpiId(input).valid;
}

/**
 * Build the UPI payment URI. `encodeURIComponent` is applied exactly once to
 * the UPI ID: `name@okaxis` becomes `pa=name%40okaxis`. No amount is included,
 * so the payer chooses it inside their UPI application.
 */
export function buildUpiUri(upiId: string): string {
  const normalized = normalizeUpiId(upiId);
  return `upi://pay?pa=${encodeURIComponent(normalized)}&cu=INR`;
}

/**
 * The payment URL is the single source of truth for a QR code. The UPI ID is
 * encoded exactly once as a path segment. Next.js decodes route params once,
 * so the page never calls decodeURIComponent on them again.
 */
export function buildPaymentPath(upiId: string): string {
  return `/pay/${encodeURIComponent(normalizeUpiId(upiId))}`;
}

export function buildPaymentUrl(upiId: string): string {
  return `${SITE_URL}${buildPaymentPath(upiId)}`;
}

/**
 * Read a UPI ID from a Next.js route param.
 *
 * In the verified Next.js 15 App Router runtime, dynamic params arrive
 * percent-encoded (`name%40okaxis`), so we decode exactly once. The same code
 * also works if a future runtime hands over an already-decoded value, because
 * decoding an `@` is a no-op. A double-encoded URL decodes to a literal `%40`
 * which fails validation — we never decode a second time.
 */
export function readUpiRouteParam(param: string): UpiValidation {
  let decoded: string;

  try {
    decoded = decodeURIComponent(param);
  } catch {
    return {
      valid: false,
      error: "This payment link contains invalid URL encoding.",
    };
  }

  return validateUpiId(decoded);
}

export function getUpiHandle(upiId: string): string {
  const atIndex = upiId.indexOf("@");
  return atIndex === -1 ? upiId : upiId.slice(atIndex + 1);
}

export function getUpiLocalPart(upiId: string): string {
  const atIndex = upiId.indexOf("@");
  return atIndex === -1 ? upiId : upiId.slice(0, atIndex);
}
