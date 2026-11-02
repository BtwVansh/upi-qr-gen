"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  AtSign,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { buildPaymentPath, validateUpiId } from "@/lib/upi";
import { cn } from "@/lib/cn";

const EXAMPLES = ["name@okaxis", "username@ybl", "number@paytm"];

export function HeroForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const [upiId, setUpiId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateUpiId(upiId);

    if (!result.valid) {
      setError(result.error);
      setPending(false);
      inputRef.current?.focus();
      return;
    }

    setError(null);

    if (!consent) {
      setConsentError("Please acknowledge the disclaimer before generating.");
      consentRef.current?.focus();
      return;
    }

    setConsentError(null);
    setPending(true);
    router.push(buildPaymentPath(result.upiId));
  }

  function applyExample(example: string) {
    setUpiId(example);
    setError(null);
    setConsentError(null);
    inputRef.current?.focus();
  }

  return (
    <div className="relative" id="generator">
      <div
        aria-hidden="true"
        className="absolute -inset-3 rounded-[2.25rem] bg-accent-soft/70 blur-xl"
      />
      <div className="card relative overflow-hidden p-6 shadow-lift sm:p-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        />

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
              No amount, phone number or bank details needed.
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
                I understand UPI Link is an independent tool, does not verify
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

          <button
            type="submit"
            disabled={pending}
            className="btn-primary btn-lg mt-5 w-full"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Generating…
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
