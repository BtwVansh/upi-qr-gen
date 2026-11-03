"use client";

import { useCallback, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  AtSign,
  IndianRupee,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/components/turnstile";
import { TURNSTILE_SITE_KEY } from "@/lib/turnstile";
import { validateAmount, validateUpiId } from "@/lib/upi";
import { cn } from "@/lib/cn";

const EXAMPLES = ["name@okaxis", "username@ybl", "number@paytm"];

type TurnstileApiResponse =
  | { success: true; href: string }
  | { success: false; error: string };

export function HeroForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleTurnstileToken = useCallback((token: string | null) => {
    setTurnstileToken(token);
    if (token) setCaptchaError(null);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateUpiId(upiId);

    if (!result.valid) {
      setError(result.error);
      setPending(false);
      inputRef.current?.focus();
      return;
    }

    setError(null);

    const amountResult = validateAmount(amount);

    if (!amountResult.valid) {
      setAmountError(amountResult.error);
      setPending(false);
      amountRef.current?.focus();
      return;
    }

    setAmountError(null);

    if (!consent) {
      setConsentError("Please acknowledge the disclaimer before generating.");
      consentRef.current?.focus();
      return;
    }

    setConsentError(null);

    if (!TURNSTILE_SITE_KEY) {
      setCaptchaError(
        "CAPTCHA is not configured. Add NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY to the environment before generating payment links.",
      );
      return;
    }

    if (!turnstileToken) {
      setCaptchaError(
        "Complete the CAPTCHA verification before generating a payment link.",
      );
      return;
    }

    setCaptchaError(null);
    setPending(true);

    try {
      const response = await fetch("/api/turnstile/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: turnstileToken,
          upiId: result.upiId,
          amount: amountResult.amount ?? "",
        }),
      });

      const data = (await response
        .json()
        .catch(() => null)) as TurnstileApiResponse | null;

      if (!response.ok || !data || !data.success) {
        setCaptchaError(
          data && !data.success
            ? data.error
            : "Verification failed. Please complete the CAPTCHA and try again.",
        );
        setPending(false);
        // A Turnstile token is single-use; start a fresh challenge on retry.
        turnstileRef.current?.reset();
        return;
      }

      router.push(data.href);
    } catch {
      setCaptchaError(
        "Could not reach the verification service. Check your connection and try again.",
      );
      setPending(false);
      turnstileRef.current?.reset();
    }
  }

  function applyExample(example: string) {
    setUpiId(example);
    setError(null);
    setConsentError(null);
    inputRef.current?.focus();
  }

  return (
    <div className="relative" id="generator">
      <div className="card relative overflow-hidden p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow">
            <span className="size-1.5 rounded-full bg-accent" />
            New payment link
          </span>
          <span className="rounded-full border border-line bg-canvas px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            INR
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6"
          aria-describedby="form-privacy-note"
        >
          <label
            htmlFor="upi-id"
            className="text-sm font-semibold tracking-tight text-ink"
          >
            Your UPI ID
          </label>
          <div className="relative mt-2">
            <AtSign
              className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-ink-subtle"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              id="upi-id"
              name="upi-id"
              type="text"
              value={upiId}
              onChange={(event) => {
                setUpiId(event.target.value);
                if (error) setError(null);
              }}
              onBlur={() => {
                if (upiId.trim()) {
                  const result = validateUpiId(upiId);
                  setError(result.valid ? null : result.error);
                }
              }}
              placeholder="name@okaxis"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="email"
              aria-invalid={error ? true : undefined}
              aria-describedby={cn(
                "upi-id-hint",
                error && "upi-id-error",
              )}
              className={cn("field pl-11", error && "field-error")}
            />
          </div>

          <div
            id="upi-id-hint"
            className="mt-2 flex items-start justify-between gap-3"
          >
            <p className="text-xs leading-5 text-ink-subtle">
              Your UPI ID, like <span className="font-mono">name@okaxis</span>.
              No phone number or bank details needed.
            </p>
          </div>

          {error && (
            <p
              id="upi-id-error"
              role="alert"
              className="mt-2 flex items-start gap-1.5 text-xs font-medium leading-5 text-danger"
            >
              <AlertCircle
                className="mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              {error}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-ink-subtle">
              Try
            </span>
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => applyExample(example)}
                className="rounded-full border border-line bg-canvas px-2.5 py-1 font-mono text-[0.7rem] text-ink-muted transition hover:border-accent/40 hover:text-accent"
              >
                {example}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="payment-amount"
                className="text-sm font-semibold tracking-tight text-ink"
              >
                Payment Amount (INR)
              </label>
              <span className="rounded-full border border-line bg-canvas px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                Optional
              </span>
            </div>
            <div className="relative mt-2">
              <IndianRupee
                className="pointer-events-none absolute left-4 top-1/2 size-[17px] -translate-y-1/2 text-ink-subtle"
                aria-hidden="true"
              />
              <input
                ref={amountRef}
                id="payment-amount"
                name="payment-amount"
                type="text"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  if (amountError) setAmountError(null);
                }}
                onBlur={() => {
                  if (amount.trim()) {
                    const result = validateAmount(amount);
                    setAmountError(result.valid ? null : result.error);
                  }
                }}
                placeholder="e.g. 500.00"
                autoComplete="off"
                inputMode="decimal"
                aria-invalid={amountError ? true : undefined}
                aria-describedby={cn(
                  "amount-hint",
                  amountError && "amount-error",
                )}
                className={cn("field pl-11", amountError && "field-error")}
              />
            </div>
            <p id="amount-hint" className="mt-2 text-xs leading-5 text-ink-subtle">
              Leave blank to create an open-amount QR code. The payer enters the
              amount in their UPI app.
            </p>
            {amountError && (
              <p
                id="amount-error"
                role="alert"
                className="mt-2 flex items-start gap-1.5 text-xs font-medium leading-5 text-danger"
              >
                <AlertCircle
                  className="mt-0.5 size-3.5 shrink-0"
                  aria-hidden="true"
                />
                {amountError}
              </p>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-line bg-canvas/70 p-3.5">
            <div className="flex items-start gap-2.5">
              <input
                ref={consentRef}
                id="disclaimer-consent"
                type="checkbox"
                checked={consent}
                onChange={(event) => {
                  setConsent(event.target.checked);
                  if (event.target.checked) setConsentError(null);
                }}
                aria-invalid={consentError ? true : undefined}
                aria-describedby={cn(
                  "consent-label",
                  consentError && "consent-error",
                )}
                className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-line-strong accent-[var(--accent)]"
              />
              <label
                id="consent-label"
                htmlFor="disclaimer-consent"
                className="cursor-pointer text-xs leading-5 text-ink-muted"
              >
                I understand UPI QR Generator is an independent tool, does not verify
                this UPI ID, and does not process payments. I will verify the
                recipient before paying.
              </label>
            </div>
            {consentError && (
              <p
                id="consent-error"
                role="alert"
                className="mt-2 flex items-start gap-1.5 pl-6 text-xs font-medium leading-5 text-danger"
              >
                <AlertCircle
                  className="mt-0.5 size-3.5 shrink-0"
                  aria-hidden="true"
                />
                {consentError}
              </p>
            )}
          </div>

          <div className="mt-5">
            <TurnstileWidget
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onToken={handleTurnstileToken}
            />
            {captchaError && (
              <p
                id="captcha-error"
                role="alert"
                className="mt-2 flex items-start gap-1.5 text-xs font-medium leading-5 text-danger"
              >
                <AlertCircle
                  className="mt-0.5 size-3.5 shrink-0"
                  aria-hidden="true"
                />
                {captchaError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="btn-primary btn-lg mt-5 w-full"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Verifying…
              </>
            ) : (
              <>
                Generate QR
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 flex flex-col gap-2.5 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p
            id="form-privacy-note"
            className="flex items-center gap-1.5 text-[0.7rem] text-ink-subtle"
          >
            <LockKeyhole className="size-3.5 shrink-0" aria-hidden="true" />
            Nothing is saved to a database.
          </p>
          <Link
            href="/privacy"
            className="inline-flex items-center gap-1 text-[0.7rem] font-medium text-ink-muted underline decoration-line-strong underline-offset-2 transition hover:text-accent"
          >
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Read the privacy note
          </Link>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-[0.68rem] text-ink-subtle">
        <span>Free forever</span>
        <span aria-hidden="true" className="size-1 rounded-full bg-line-strong" />
        <span>No sign-up</span>
        <span aria-hidden="true" className="size-1 rounded-full bg-line-strong" />
        <span>No payment data stored</span>
      </div>
    </div>
  );
}
