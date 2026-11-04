"use client";

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
  getTurnstileApi,
  isValidTurnstileSiteKey,
  loadTurnstileScript,
  resetTurnstileScriptLoader,
  TURNSTILE_ACTION,
  type TurnstileWidgetOptions,
} from "@/lib/turnstile";

export type TurnstileWidgetHandle = {
  reset: () => void;
};

type TurnstileWidgetProps = {
  siteKey: string;
  onToken: (token: string | null) => void;
};

const START_ERROR =
  "Verification could not start. Check your connection and retry.";

const LOAD_ERROR =
  "Cloudflare Turnstile could not load. Check your connection and retry.";

/**
 * Cloudflare Turnstile in managed mode, rendered explicitly so the widget can
 * be reset after a failed server-side verification. The secret key is never
 * referenced here: this component only knows the public site key.
 *
 * The script is loaded from an effect rather than `next/script`, so the
 * third-party widget never runs during server rendering or while React is
 * hydrating. Before the effect runs, the server and client render exactly the
 * same placeholder markup.
 */
export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  TurnstileWidgetProps
>(function TurnstileWidget({ siteKey, onToken }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  const [mounted, setMounted] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // Bumping this restarts the load/render effect for a genuine retry.
  const [attempt, setAttempt] = useState(0);

  const configured = isValidTurnstileSiteKey(siteKey);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  // Defer all third-party work until after hydration has completed.
  useEffect(() => {
    setMounted(true);
  }, []);

  const reset = useCallback(() => {
    const api = getTurnstileApi();
    if (widgetIdRef.current && api) {
      api.reset(widgetIdRef.current);
    }
    setNotice(null);
    onTokenRef.current(null);
  }, []);

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  const retry = useCallback(() => {
    const api = getTurnstileApi();

    if (widgetIdRef.current && api) {
      try {
        api.remove(widgetIdRef.current);
      } catch {
        // The widget may already be gone; a fresh render still follows.
      }
      widgetIdRef.current = null;
    }

    // Clear any markup Turnstile left behind so render() gets a clean node.
    containerRef.current?.replaceChildren();

    // Only discard the script if it never produced an API. A loaded script is
    // reused so retrying a failed challenge does not re-download it.
    if (!api) {
      resetTurnstileScriptLoader();
    }

    onTokenRef.current(null);
    setNotice(null);
    setScriptLoaded(false);
    setRendered(false);
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!mounted || !configured) return;

    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    setNotice(null);
    setScriptLoaded(false);
    setRendered(false);

    loadTurnstileScript()
      .then((api) => {
        if (cancelled) return;
        // Strict Mode re-runs effects; never render a second widget.
        if (widgetIdRef.current) return;

        setScriptLoaded(true);
        container.replaceChildren();

        const showNotice = (message: string) => {
          if (!cancelled) setNotice(message);
        };

        const restart = () => {
          const current = getTurnstileApi();
          if (widgetIdRef.current && current) {
            try {
              current.reset(widgetIdRef.current);
            } catch {
              // Ignore: the widget may have been removed already.
            }
          }
        };

        const options: TurnstileWidgetOptions = {
          sitekey: siteKey,
          action: TURNSTILE_ACTION,
          theme: "auto",
          callback: (token) => {
            if (cancelled) return;
            setNotice(null);
            onTokenRef.current(token);
          },
          "expired-callback": () => {
            if (cancelled) return;
            onTokenRef.current(null);
            showNotice("Verification expired. Please complete the check again.");
            restart();
          },
          "timeout-callback": () => {
            if (cancelled) return;
            onTokenRef.current(null);
            showNotice("Verification timed out. Please try again.");
            restart();
          },
          "error-callback": () => {
            if (cancelled) return;
            onTokenRef.current(null);
            showNotice(LOAD_ERROR);
          },
        };

        try {
          widgetIdRef.current = api.render(container, options);
          setRendered(true);
        } catch {
          setNotice(START_ERROR);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setNotice(LOAD_ERROR);
      });

    return () => {
      cancelled = true;
      const api = getTurnstileApi();
      if (widgetIdRef.current && api) {
        try {
          api.remove(widgetIdRef.current);
        } catch {
          // Ignore teardown races; the next effect renders a fresh widget.
        }
      }
      widgetIdRef.current = null;
    };
  }, [attempt, configured, mounted, siteKey]);

  if (!configured) {
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

      {!rendered && !notice && (
        <p className="mt-3 flex items-center gap-2 text-xs text-ink-subtle">
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          {scriptLoaded ? "Preparing verification…" : "Loading verification…"}
        </p>
      )}

      <div
        ref={containerRef}
        className="mt-3 min-h-[65px]"
        role="group"
        aria-label="CAPTCHA verification"
      />

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
            onClick={retry}
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent underline decoration-accent/30 underline-offset-4 transition hover:decoration-accent"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
});
