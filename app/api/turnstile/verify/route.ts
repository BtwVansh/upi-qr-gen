import { NextResponse } from "next/server";
import { TURNSTILE_ACTION } from "@/lib/turnstile";
import { buildPaymentHref, validateAmount, validateUpiId } from "@/lib/upi";

export const runtime = "nodejs";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

type TurnstileSiteverifyResult = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
};

type VerifyRequestBody = {
  token?: unknown;
  upiId?: unknown;
  amount?: unknown;
};

function errorResponse(error: string, status = 400) {
  return NextResponse.json(
    { success: false, error },
    { status, headers: NO_STORE_HEADERS },
  );
}

function friendlyError(codes: string[]): string {
  if (codes.includes("timeout-or-duplicate")) {
    return "Verification expired or was already used. Please complete the CAPTCHA again.";
  }

  if (
    codes.includes("invalid-input-secret") ||
    codes.includes("missing-input-secret") ||
    codes.includes("sitekey-secret-mismatch")
  ) {
    return "CAPTCHA verification is misconfigured on the server.";
  }

  if (codes.includes("internal-error")) {
    return "The verification service is temporarily unavailable. Please try again.";
  }

  return "Verification failed. Please complete the CAPTCHA again.";
}

function clientIp(request: Request): string | undefined {
  const direct = request.headers.get("x-nf-client-connection-ip");
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  const ip = (direct ?? forwarded ?? "").trim();

  return ip && ip.length <= 64 ? ip : undefined;
}

/**
 * Server-side verification for the Turnstile widget.
 *
 * The secret key is read only here, never sent to the browser. A Turnstile
 * token is single-use: the Siteverify API rejects a second verification of the
 * same token with `timeout-or-duplicate`, so no database is needed.
 */
export async function POST(request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return errorResponse(
      "CAPTCHA verification is not configured on the server.",
      500,
    );
  }

  let body: VerifyRequestBody;

  try {
    const parsed: unknown = await request.json();

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return errorResponse("The verification request was invalid.");
    }

    body = parsed as VerifyRequestBody;
  } catch {
    return errorResponse("The verification request was invalid.");
  }

  // Validate the requested payment page before consuming the single-use token.
  const upiResult = validateUpiId(
    typeof body.upiId === "string" ? body.upiId : "",
  );

  if (!upiResult.valid) {
    return errorResponse(upiResult.error);
  }

  if (
    body.amount !== undefined &&
    body.amount !== null &&
    typeof body.amount !== "string"
  ) {
    return errorResponse("The payment amount was invalid.");
  }

  const amountResult = validateAmount(
    typeof body.amount === "string" ? body.amount : "",
  );

  if (!amountResult.valid) {
    return errorResponse(amountResult.error);
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";

  if (!token) {
    return errorResponse(
      "Complete the CAPTCHA verification before generating a payment link.",
    );
  }

  if (token.length > 4096) {
    return errorResponse(
      "Verification was invalid. Please complete the CAPTCHA again.",
    );
  }

  const form = new URLSearchParams({
    secret,
    response: token,
  });

  const ip = clientIp(request);
  if (ip) {
    form.set("remoteip", ip);
  }

  let result: TurnstileSiteverifyResult;

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return errorResponse(
        "The verification service is temporarily unavailable. Please try again.",
        502,
      );
    }

    result = (await response.json()) as TurnstileSiteverifyResult;
  } catch {
    return errorResponse(
      "Could not reach the verification service. Check your connection and try again.",
      502,
    );
  }

  if (!result.success) {
    return errorResponse(friendlyError(result["error-codes"] ?? []));
  }

  // Reject a valid token that was minted for a different Turnstile widget
  // action. Test-key responses omit `action`, so only enforce it when present.
  if (result.action && result.action !== TURNSTILE_ACTION) {
    return errorResponse(
      "Verification was invalid. Please complete the CAPTCHA again.",
    );
  }

  // The payment link is only constructed after the token has been verified.
  const href = buildPaymentHref(
    upiResult.upiId,
    amountResult.amount,
  );

  return NextResponse.json(
    { success: true, href },
    { headers: NO_STORE_HEADERS },
  );
}
