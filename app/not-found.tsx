import Link from "next/link";
import { ArrowLeft, ArrowRight, Link2Off, QrCode } from "lucide-react";
import { LogoMark } from "@/components/logo";

export const metadata = {
  title: "Page not found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main id="main-content" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="bg-dot-grid mask-fade-b pointer-events-none absolute inset-0 opacity-30"
      />
      <div className="container-page relative flex min-h-[70svh] flex-col items-center justify-center py-20 text-center">
        <span className="grid size-16 place-items-center rounded-2xl border border-line bg-surface shadow-card">
          <QrCode className="size-7 text-ink-subtle" aria-hidden="true" />
        </span>

        <span className="eyebrow mt-8">404 — Link not found</span>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-6xl">
          This link doesn&apos;t lead anywhere.
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-ink-muted">
          The page may have moved, the address may be mistyped, or the payment
          link may not contain a valid UPI ID.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn-primary btn-lg">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>
          <Link href="/#generator" className="btn-secondary btn-lg">
            Create a payment link
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 flex max-w-md items-start gap-3 rounded-2xl border border-line bg-surface/70 p-4 text-left">
          <LogoMark className="size-8 rounded-[10px]" />
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-ink">
              <Link2Off className="size-3.5" aria-hidden="true" />
              Reopened an old payment link?
            </p>
            <p className="mt-1 text-xs leading-5 text-ink-subtle">
              Payment pages are rebuilt from the UPI ID encoded in the URL. Check
              that the full link was copied, including everything after{" "}
              <span className="font-mono">/pay/</span>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
