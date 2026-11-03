"use client";

import Script from "next/script";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { AlertCircle, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import {
  TURNSTILE_ACTION,
  TURNSTILE_SCRIPT_SRC,
  type TurnstileWidgetOptions,
} from "@/lib/turnstile";

export type TurnstileWidgetHandle = {
  reset: () => void;
};

type TurnstileWidgetProps = {
  siteKey: string;
  onToken: (token: string | null) => void;
};

/**
 * Cloudflare Turnstile in managed mode, rendered explicitly so the widget can
 * be reset after a failed server-side verification. The secret key is never
 * referenced here: this component only knows the public site key.
 */
export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  TurnstileWidgetProps
>(function TurnstileWidget({ siteKey, onToken }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const reset = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
    setNotice(null);
    onTokenRef.current(null);
  }, []);

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  useEffect(() => {
    if (
      !siteKey ||
      !scriptReady ||
      !containerRef.current ||
      !window.turnstile ||
      widgetIdRef.current
    ) {
      return;
    }

    try {
      const options: TurnstileWidgetOptions = {
        sitekey: siteKey,
        action: TURNSTILE_ACTION,
        theme: "auto",
        callback: (token) => {
          setNotice(null);
          onTokenRef.current(token);
        },
        "expired-callback": () => {
          onTokenRef.current(null);
          setNotice("Verification expired. Please complete the check again.");
          if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
          }
        },
        "timeout-callback": () => {
          onTokenRef.current(null);
          setNotice("Verification timed out. Please try again.");
          if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
          }
        },
        "error-callback": () => {
          onTokenRef.current(null);
          setNotice(
            "Verification could not load. Check your connection and retry.",
          );
        },
      };

      widgetIdRef.current = window.turnstile.render(
        containerRef.current,
        options,
      );
      setRendered(true);
      setNotice(null);
    } catch {
      setNotice(
        "Verification could not start. Check your connection and retry.",
      );
    }
  }, [scriptReady, siteKey]);

  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, []);

  if (!siteKey) {
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger-soft p-4">
        <p className="flex items-start gap-2 text-xs font-medium leading-5 text-danger">
          <AlertCircle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          CAPTCHA is not configured. Set
          <span className="font-mono">NEXT_PUBLIC_TURNSTILE_SITE_KEY</span> and
          <span className="font-mono">TURNSTILE_SECRET_KEY</span> in the
          environment before generating payment links.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-canvas/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
          <ShieldCheck className="size-4 text-accent" aria-hidden="true" />
          Verification
        </span>
        <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
          Required
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-5 text-ink-subtle">
        Cloudflare Turnstile confirms you are human before a payment link is
        created.
      </p>

      {!scriptReady && !scriptFailed && (
        <p className="mt-3 flex items-center gap-2 text-xs text-ink-subtle">
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          Loading verification…
        </p>
      )}

      {scriptFailed && (
        <p
          role="alert"
          className="mt-3 flex items-start gap-1.5 text-xs font-medium leading-5 text-danger"
        >
          <AlertCircle
            className="mt-0.5 size-3.5 shrink-0"
            aria-hidden="true"
          />
          Cloudflare Turnstile could not load. Check your connection, then
          reload the page.
        </p>
      )}

      <div
        ref={containerRef}
        className="mt-3 min-h-[65px]"
        role="group"
        aria-label="CAPTCHA verification"
      />

      {!rendered && scriptReady && !scriptFailed && (
        <p className="mt-2 flex items-center gap-2 text-xs text-ink-subtle">
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          Preparing verification…
        </p>
      )}

      {notice && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p
            role="alert"
            className="flex items-start gap-1.5 text-xs font-medium leading-5 text-danger"
          >
            <AlertCircle
              className="mt-0.5 size-3.5 shrink-0"
              aria-hidden="true"
            />
            {notice}
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent underline decoration-accent/30 underline-offset-4 transition hover:decoration-accent"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      <Script
        src={TURNSTILE_SCRIPT_SRC}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => setScriptFailed(true)}
      />
    </div>
  );
});
