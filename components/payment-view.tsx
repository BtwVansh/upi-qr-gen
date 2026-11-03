"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Download,
  IndianRupee,
  Info,
  Link2,
  Loader2,
  LockKeyhole,
  Monitor,
  ScanLine,
  Share2,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { QrCode } from "@/components/qr-code";
import { useToast } from "@/components/toast";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/cn";
import { detectDevice, UNKNOWN_DEVICE, type DeviceInfo } from "@/lib/device";
import {
  getAppLaunchUrl,
  PAYMENT_APPS,
  type PaymentApp,
} from "@/lib/payment-apps";
import { downloadQrPng } from "@/lib/qr";
import { SITE_NAME } from "@/lib/site";
import {
  buildPaymentHref,
  formatAmountInr,
  getUpiLocalPart,
  validateAmount,
} from "@/lib/upi";

type PaymentViewProps = {
  upiId: string;
  amount: string | null;
  upiUri: string;
  paymentUrl: string;
};

type LaunchNotice = {
  app: PaymentApp;
  phase: "launching" | "fallback";
};

export function PaymentView({
  upiId,
  amount,
  upiUri,
  paymentUrl,
}: PaymentViewProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [device, setDevice] = useState<DeviceInfo>(UNKNOWN_DEVICE);
  const [canShare, setCanShare] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [launchNotice, setLaunchNotice] = useState<LaunchNotice | null>(null);
  const [editingAmount, setEditingAmount] = useState(false);
  const [amountInput, setAmountInput] = useState(amount ?? "");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [isUpdating, startTransition] = useTransition();
  const launchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayUrl = paymentUrl.replace(/^https?:\/\//, "");
  const localPart = getUpiLocalPart(upiId);
  const amountLabel = amount ? formatAmountInr(amount) : null;

  useEffect(() => {
    setAmountInput(amount ?? "");
    setAmountError(null);
    setEditingAmount(false);
  }, [amount]);

  useEffect(() => {
    setDevice(detectDevice());
    setCanShare(
      typeof navigator !== "undefined" &&
        typeof navigator.share === "function",
    );
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== "hidden" || !launchTimer.current) {
        return;
      }
      clearTimeout(launchTimer.current);
      launchTimer.current = null;
      setLaunchNotice((current) =>
        current ? { ...current, phase: "fallback" } : current,
      );
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (launchTimer.current) {
        clearTimeout(launchTimer.current);
        launchTimer.current = null;
      }
    };
  }, []);

  async function handleCopy(value: string, successMessage: string) {
    const copied = await copyToClipboard(value);
    if (copied) {
      notify(successMessage, "success");
    } else {
      notify(
        "Your browser blocked clipboard access. Select and copy the text manually.",
        "error",
      );
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadQrPng(upiUri, upiId);
      notify("QR code downloaded as a PNG.", "success");
    } catch {
      notify(
        "The QR code could not be downloaded. Please try again.",
        "error",
      );
    } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
      return;
    }

    try {
      await navigator.share({
        title: amountLabel
          ? `Pay ${amountLabel} to ${upiId} · ${SITE_NAME}`
          : `Pay ${upiId} · ${SITE_NAME}`,
        text: amountLabel
          ? `UPI payment link for ${upiId} (${amountLabel})`
          : `UPI payment link for ${upiId}`,
        url: paymentUrl,
      });
      notify("Payment link shared.", "success");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      const copied = await copyToClipboard(paymentUrl);
      notify(
        copied
          ? "Sharing is unavailable here, so the payment link was copied instead."
          : "Sharing is unavailable in this browser.",
        copied ? "info" : "error",
      );
    }
  }

  function handleAppLaunch(app: PaymentApp) {
    if (launchTimer.current) {
      clearTimeout(launchTimer.current);
    }
    setLaunchNotice({ app, phase: "launching" });
    launchTimer.current = setTimeout(() => {
      setLaunchNotice({ app, phase: "fallback" });
      launchTimer.current = null;
    }, 2600);
  }

  function handleAmountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateAmount(amountInput);

    if (!result.valid) {
      setAmountError(result.error);
      return;
    }

    setAmountError(null);
    setEditingAmount(false);
    startTransition(() => {
      router.replace(buildPaymentHref(upiId, result.amount), {
        scroll: false,
      });
    });
  }

  const isMobile = device.platform === "android" || device.platform === "ios";
  const isDesktop =
    device.platform === "windows" ||
    device.platform === "macos" ||
    device.platform === "linux";

  return (
    <main id="main-content">
      <div className="container-page py-8 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition hover:text-ink"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Create your own link
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            UPI · INR
          </span>
        </div>

        <div className="mt-8 max-w-3xl">
          <span className="eyebrow">
            <Wallet className="size-3.5 text-accent" aria-hidden="true" />
            Payment page
          </span>
          <h1 className="mt-4 break-words text-[clamp(2.2rem,6vw,3.8rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-ink">
            Pay{" "}
            <span className="font-display font-semibold tracking-[-0.04em] text-accent">
              {localPart}
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink-muted">
            {amountLabel
              ? `This page requests ${amountLabel}. Scan the QR code or use a payment app, then verify the recipient before you pay.`
              : "Scan the QR code with any UPI app, or use the payment buttons below on your phone. Verify the recipient before you pay."}
          </p>
        </div>

        {/* Recipient */}
        <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-center gap-3.5">
            <span
              className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent-soft font-display text-xl font-semibold text-accent"
              aria-hidden="true"
            >
              {localPart.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
                Recipient UPI ID
              </p>
              <p className="mt-0.5 truncate font-mono text-sm text-ink sm:text-[0.95rem]">
                {upiId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(upiId, "UPI ID copied.")}
            className="btn-secondary btn-md w-full shrink-0 sm:w-auto"
          >
            <Link2 className="size-4" aria-hidden="true" />
            Copy UPI ID
          </button>
        </div>

        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-ink-subtle">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          The format was checked locally, but UPI QR Generator cannot verify that this
          UPI ID is active or belongs to the intended recipient.
        </p>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
          {/* QR card */}
          <section
            aria-labelledby="qr-heading"
            className="card overflow-hidden p-5 sm:p-6 lg:sticky lg:top-24"
          >
            <div className="flex items-center justify-between gap-3">
              <h2
                id="qr-heading"
                className="flex items-center gap-2 text-sm font-semibold text-ink"
              >
                <ScanLine className="size-4 text-accent" aria-hidden="true" />
                Scan to pay
              </h2>
              <span className="rounded-full border border-line bg-canvas px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                {amountLabel ?? "Open amount"}
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-line bg-canvas p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
                    Payment amount
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                    {amountLabel ?? "Open amount"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-ink-subtle">
                    {amountLabel
                      ? "Set in this QR code. Confirm the amount in your UPI app."
                      : "The payer chooses the amount in their UPI app."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAmount((editing) => !editing);
                    setAmountError(null);
                  }}
                  aria-expanded={editingAmount}
                  aria-controls="amount-editor"
                  className="btn-secondary btn-sm shrink-0"
                >
                  {editingAmount ? "Cancel" : "Edit"}
                </button>
              </div>

              {editingAmount && (
                <form
                  id="amount-editor"
                  onSubmit={handleAmountSubmit}
                  className="mt-4 border-t border-line pt-4"
                >
                  <label
                    htmlFor="payment-amount-edit"
                    className="text-xs font-semibold text-ink"
                  >
                    Payment Amount (INR)
                  </label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <div className="relative min-w-0 flex-1">
                      <IndianRupee
                        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
                        aria-hidden="true"
                      />
                      <input
                        id="payment-amount-edit"
                        name="payment-amount"
                        type="text"
                        value={amountInput}
                        onChange={(event) => {
                          setAmountInput(event.target.value);
                          if (amountError) setAmountError(null);
                        }}
                        placeholder="Leave blank for open amount"
                        autoComplete="off"
                        inputMode="decimal"
                        aria-invalid={amountError ? true : undefined}
                        aria-describedby={
                          amountError ? "amount-edit-error" : undefined
                        }
                        className={cn(
                          "field !h-12 pl-10 text-sm",
                          amountError && "field-error",
                        )}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="btn-primary btn-md !h-12 shrink-0"
                    >
                      {isUpdating ? (
                        <Loader2
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Check className="size-4" aria-hidden="true" />
                      )}
                      {isUpdating ? "Updating…" : "Update QR"}
                    </button>
                  </div>
                  <p className="mt-2 text-[0.68rem] leading-5 text-ink-subtle">
                    The QR code and shareable link update together.
                  </p>
                  {amountError && (
                    <p
                      id="amount-edit-error"
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
                </form>
              )}
            </div>

            <div className="mt-4 rounded-3xl border border-line bg-white p-4 shadow-qr sm:p-5">
              <QrCode
                value={upiUri}
                size={720}
                alt={`UPI payment QR code for ${upiId}${
                  amountLabel ? ` with amount ${amountLabel}` : ""
                }`}
              />
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-ink-subtle">
              Open any UPI app, choose Scan, and point your camera at the code.
            </p>

            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="btn-primary btn-md w-full"
              >
                {downloading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="size-4" aria-hidden="true" />
                )}
                {downloading ? "Preparing PNG…" : "Download QR code"}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleCopy(paymentUrl, "Payment link copied.")
                }
                className="btn-secondary btn-md w-full"
              >
                <Link2 className="size-4" aria-hidden="true" />
                Copy payment link
              </button>
              {canShare && (
                <button
                  type="button"
                  onClick={handleShare}
                  className="btn-secondary btn-md w-full"
                >
                  <Share2 className="size-4" aria-hidden="true" />
                  Share payment link
                </button>
              )}
            </div>
          </section>

          {/* Actions column */}
          <div className="space-y-5">
            {/* App launchers */}
            <section
              aria-labelledby="apps-heading"
              className="card p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2
                    id="apps-heading"
                    className="text-base font-semibold tracking-tight text-ink"
                  >
                    Pay with an app
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-ink-muted">
                    {isMobile
                      ? `Opens the selected app on your ${device.label.toLowerCase()}.`
                      : "These buttons work on a mobile device."}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 py-1 text-[0.62rem] font-medium text-ink-subtle">
                  <Smartphone className="size-3" aria-hidden="true" />
                  {device.platform === "unknown"
                    ? "Detecting device"
                    : device.label}
                </span>
              </div>

              {isDesktop && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-line bg-canvas p-3.5">
                  <Monitor
                    className="mt-0.5 size-4 shrink-0 text-ink-subtle"
                    aria-hidden="true"
                  />
                  <p className="text-xs leading-5 text-ink-muted">
                    Open this payment page on your mobile device to use these
                    payment apps. On desktop, scan the QR code with any UPI app
                    instead.
                  </p>
                </div>
              )}

              {device.platform === "other" && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-line bg-canvas p-3.5">
                  <Info
                    className="mt-0.5 size-4 shrink-0 text-ink-subtle"
                    aria-hidden="true"
                  />
                  <p className="text-xs leading-5 text-ink-muted">
                    App launching is not supported on this device. Scan the QR
                    code with any UPI app to pay.
                  </p>
                </div>
              )}

              <div className="mt-4 space-y-2">
                {PAYMENT_APPS.map((app) => {
                  const href = isMobile
                    ? getAppLaunchUrl(
                        app,
                        device.platform,
                        upiUri,
                        paymentUrl,
                      )
                    : null;
                  const disabled =
                    device.platform === "unknown" || !href;
                  const content = (
                    <>
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold",
                          app.brandClass,
                        )}
                        aria-hidden="true"
                      >
                        {app.monogram}
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block text-sm font-semibold text-ink">
                          Open in {app.name}
                        </span>
                        <span className="block text-[0.68rem] text-ink-subtle">
                          {disabled
                            ? isDesktop
                              ? "Available on mobile"
                              : "Detecting device…"
                            : "Launch the app with this UPI ID"}
                        </span>
                      </span>
                      {disabled ? (
                        <LockKeyhole
                          className="size-4 shrink-0 text-ink-subtle"
                          aria-hidden="true"
                        />
                      ) : (
                        <ArrowUpRight
                          className="size-4 shrink-0 text-ink-subtle"
                          aria-hidden="true"
                        />
                      )}
                    </>
                  );

                  if (disabled) {
                    return (
                      <button
                        key={app.id}
                        type="button"
                        disabled
                        className="flex w-full items-center gap-3 rounded-2xl border border-line bg-canvas/60 p-3 text-left opacity-60"
                        aria-label={`Open in ${app.name} — unavailable on this device`}
                      >
                        {content}
                      </button>
                    );
                  }

                  return (
                    <a
                      key={app.id}
                      href={href}
                      onClick={() => handleAppLaunch(app)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-left transition hover:border-accent/40 hover:bg-surface-raised active:scale-[0.995]"
                    >
                      {content}
                    </a>
                  );
                })}
              </div>

              {device.platform === "ios" && (
                <p className="mt-3 text-[0.68rem] leading-5 text-ink-subtle">
                  App links work best in Safari. If iOS blocks a launch, scan the
                  QR code or open the link in your preferred UPI app.
                </p>
              )}

              <p className="mt-3 flex items-start gap-1.5 text-[0.68rem] leading-5 text-ink-subtle">
                <Info className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                Browsers cannot reliably detect installed apps. If a button does
                nothing, the app may not be installed — use the QR code or
                another app.
              </p>

              {launchNotice && (
                <div
                  role="status"
                  className="mt-3 flex items-start gap-2.5 rounded-xl border border-line bg-canvas p-3"
                >
                  {launchNotice.phase === "launching" ? (
                    <Loader2
                      className="mt-0.5 size-3.5 shrink-0 animate-spin text-ink-subtle"
                      aria-hidden="true"
                    />
                  ) : (
                    <AlertCircle
                      className="mt-0.5 size-3.5 shrink-0 text-warning"
                      aria-hidden="true"
                    />
                  )}
                  <p className="text-[0.7rem] leading-5 text-ink-muted">
                    {launchNotice.phase === "launching"
                      ? `Requesting ${launchNotice.app.name}…`
                      : `${launchNotice.app.name} did not open? It may not be installed or the launch may be blocked. Scan the QR code or try another app.`}
                  </p>
                </div>
              )}
            </section>

            {/* Payment link */}
            <section
              aria-labelledby="link-heading"
              className="card p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2
                    id="link-heading"
                    className="text-base font-semibold tracking-tight text-ink"
                  >
                    Payment link
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-ink-muted">
                    Share this page. It rebuilds the same QR code from the URL.
                  </p>
                </div>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-canvas text-ink-subtle">
                  <Link2 className="size-4" aria-hidden="true" />
                </span>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-line bg-canvas px-3.5 py-3">
                <p
                  className="truncate font-mono text-[0.7rem] text-ink-muted sm:text-xs"
                  title={paymentUrl}
                >
                  {displayUrl}
                </p>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(paymentUrl, "Payment link copied.")
                  }
                  className="btn-secondary btn-md w-full"
                >
                  <Link2 className="size-4" aria-hidden="true" />
                  Copy link
                </button>
                {canShare ? (
                  <button
                    type="button"
                    onClick={handleShare}
                    className="btn-secondary btn-md w-full"
                  >
                    <Share2 className="size-4" aria-hidden="true" />
                    Share
                  </button>
                ) : (
                  <div className="flex h-11 items-center justify-center rounded-full border border-dashed border-line px-4 text-[0.68rem] text-ink-subtle">
                    Native sharing not supported
                  </div>
                )}
              </div>

              <p className="mt-3 text-[0.68rem] leading-5 text-ink-subtle">
                The UPI ID and optional amount are part of the URL and may
                appear in browser history, messages and hosting logs. Share the
                link only with the intended payer.
              </p>
            </section>

            {/* Instructions */}
            <section
              aria-labelledby="instructions-heading"
              className="card p-5 sm:p-6"
            >
              <h2
                id="instructions-heading"
                className="text-base font-semibold tracking-tight text-ink"
              >
                How to pay
              </h2>
              <ol className="mt-4 space-y-4">
                {[
                  {
                    title: "Scan the QR code",
                    body: "Open any UPI app, tap Scan, and point your camera at the code on this page.",
                  },
                  {
                    title: "Verify the recipient",
                    body: "Confirm the name and UPI ID shown inside your payment app before continuing.",
                  },
                  {
                    title: amountLabel ? "Confirm the amount and pay" : "Enter the amount and pay",
                    body: amountLabel
                      ? `This page requests ${amountLabel}. Confirm the amount in your UPI app and pay with your UPI PIN.`
                      : "This link does not set an amount. Enter the amount yourself and confirm with your UPI PIN in your app.",
                  },
                ].map((step, index) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line bg-canvas text-[0.65rem] font-semibold text-ink-subtle">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">{step.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-ink-muted">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Safety */}
            <div className="rounded-2xl border border-line bg-surface/60 p-4">
              <p className="flex items-start gap-2 text-xs leading-5 text-ink-muted">
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span>
                  UPI QR Generator never asks for your UPI PIN, OTP, password, or bank
                  details. It does not process or verify this payment.{" "}
                  <Link
                    href="/disclaimer"
                    className="font-medium text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
                  >
                    Read the disclaimer
                  </Link>
                  .
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-5">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.68rem] text-ink-subtle">
            <Check className="size-3 text-accent" aria-hidden="true" />
            QR code generated locally in your browser.
            <span aria-hidden="true" className="text-line-strong">
              ·
            </span>
            No payment data stored.
            <span aria-hidden="true" className="text-line-strong">
              ·
            </span>
            <Link
              href="/"
              className="font-medium text-ink-muted underline decoration-line-strong underline-offset-2 transition hover:text-accent"
            >
              Create your own link
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
