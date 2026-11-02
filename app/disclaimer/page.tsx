import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowUpRight, ShieldAlert } from "lucide-react";
import { GITHUB_URL, SITE_NAME } from "@/lib/site";

export const metadata = {
  title: "Disclaimer",
  description:
    "Important limits of UPI Link: it is an independent utility, does not process or verify payments, and does not guarantee UPI IDs or link availability.",
  alternates: {
    canonical: "/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <main id="main-content" className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to {SITE_NAME}
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-warning-soft text-warning">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </span>
          <span className="eyebrow">Disclaimer</span>
        </div>

        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">
          A link is not a guarantee.
        </h1>
        <p className="mt-4 text-base leading-7 text-ink-muted">
          Please read these limits before using a UPI Link payment page. They
          are short, and they matter.
        </p>
        <p className="mt-3 text-xs text-ink-subtle">
          Last updated: 2 November 2026
        </p>

        <div className="legal-prose mt-10">
          <h2>Independent utility</h2>
          <p>
            UPI Link is an independent, open-source utility for generating UPI
            payment QR codes and shareable payment links. It is not affiliated
            with, endorsed by, or operated by the National Payments Corporation
            of India (NPCI), any bank, Google Pay, PhonePe, Paytm, or any other
            payment application.
          </p>

          <h2>No payment processing</h2>
          <p>
            UPI Link does not process, authorise, settle, or route payments. It
            does not hold or transmit money, and it is not a merchant, payment
            aggregator, or financial institution. Your payment is made entirely
            inside the UPI application and banking system you choose.
          </p>

          <h2>No verification of UPI IDs</h2>
          <p>
            The application checks basic syntax only. A UPI ID that looks valid
            may be inactive, mistyped, closed, or belong to someone other than
            the intended recipient. No screen in this application should be
            interpreted as proof that a UPI ID is active or verified.
          </p>
          <p>
            Always check the recipient&apos;s name and UPI ID inside your
            payment application before confirming a payment. UPI Link cannot
            recover money sent to the wrong recipient.
          </p>

          <h2>No guarantee of link availability</h2>
          <p>
            Payment pages are reconstructed from the information in the URL. No
            website can promise that a URL will work forever. A link remains
            reproducible only for as long as this domain, its hosting, and the
            application remain available. Hosting changes, domain changes,
            software changes, or service interruptions can affect old links.
          </p>

          <h2>Payment application behaviour</h2>
          <p>
            Android and iOS launch mechanisms are implemented according to each
            platform&apos;s capabilities. A payment application may not be
            installed, may change or remove its URL scheme, may block a launch,
            or may show its own confirmation or error. UPI Link cannot detect
            installed applications reliably and does not claim that an app
            opened successfully.
          </p>
          <p>
            The QR code is the universal fallback. Any application that supports
            UPI payments can scan it. On desktop, the QR code is the intended
            payment path.
          </p>

          <h2>Your responsibility</h2>
          <ul>
            <li>Verify the recipient before sending money.</li>
            <li>Never share your UPI PIN, OTP, password, or banking credentials.</li>
            <li>Only generate links for UPI IDs you are authorised to share.</li>
            <li>Do not use UPI Link for fraud, impersonation, or unlawful activity.</li>
            <li>Treat payment links as sensitive information.</li>
          </ul>

          <h2>No warranty</h2>
          <p>
            The application is provided on an &quot;as is&quot; and &quot;as
            available&quot; basis, without warranties of any kind, express or
            implied, including fitness for a particular purpose or
            uninterrupted availability. You use it at your own risk.
          </p>

          <h2>Trademarks</h2>
          <p>
            Google Pay, PhonePe, Paytm, UPI, and other names and marks are the
            property of their respective owners. References are descriptive and
            do not imply partnership or endorsement.
          </p>

          <h2>Not professional advice</h2>
          <p>
            Nothing on this website is financial, legal, or tax advice. If you
            are unsure about a payment, contact your bank or the relevant
            payment provider directly.
          </p>

          <h2>Questions</h2>
          <p>
            For corrections or concerns, open an issue in the{" "}
            <a
              href={`${GITHUB_URL}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1"
            >
              project repository
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
            .
          </p>
        </div>

        <div className="mt-10 flex items-start gap-3 rounded-2xl border border-warning/25 bg-warning-soft p-5">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-warning"
            aria-hidden="true"
          />
          <p className="text-sm leading-6 text-ink-muted">
            <span className="font-medium text-ink">
              Before every payment:
            </span>{" "}
            check the recipient name and UPI ID inside your UPI application.
            UPI Link cannot verify who owns a UPI ID.
          </p>
        </div>
      </div>
    </main>
  );
}
