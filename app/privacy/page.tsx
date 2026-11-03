import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import { GITHUB_URL, SITE_NAME } from "@/lib/site";

export const metadata = {
  title: "Privacy",
  description:
    "How UPI QR Generator handles your UPI ID, payment links and browser data. No database, no accounts and no payment credentials.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
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
          <span className="grid size-11 place-items-center rounded-2xl bg-accent-soft text-accent">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <span className="eyebrow">Privacy note</span>
        </div>

        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">
          Your UPI ID is not ours to keep.
        </h1>
        <p className="mt-4 text-base leading-7 text-ink-muted">
          UPI QR Generator is a stateless utility. It creates a QR code and a payment
          link from the UPI ID and optional amount you enter. It does not store
          payment records, require an account, or process money.
        </p>
        <p className="mt-3 text-xs text-ink-subtle">
          Last updated: 2 November 2026
        </p>

        <div className="legal-prose mt-10">
          <h2>Information you provide</h2>
          <p>
            The only information requested is a UPI ID, such as{" "}
            <span className="font-mono text-[0.85em]">name@okaxis</span>, and an
            optional payment amount. You do not create an account. We do not ask
            for your name, phone number, bank account number, card details, UPI
            PIN, password or OTP.
          </p>

          <h2>How your UPI ID is used</h2>
          <p>
            Your browser uses the UPI ID and optional amount to build a standard
            UPI payment URI
            (<span className="font-mono text-[0.85em]">upi://pay?pa=…&amp;am=500.00&amp;cu=INR</span>)
            and render that URI as a QR code. This happens locally in your
            browser.
          </p>
          <p>
            The UPI ID and optional amount are also encoded into the payment page
            URL, for example{" "}
            <span className="font-mono text-[0.85em] break-all">
              https://upigenerator.netlify.app/pay/name%40okaxis?amount=500.00
            </span>
            . That URL is the complete source of truth for the payment page. It
            is not a reference to a database record.
          </p>

          <h2>What we do not store</h2>
          <ul>
            <li>No database of UPI IDs, QR codes or payment links.</li>
            <li>No user accounts or authentication records.</li>
            <li>
              No UPI IDs in local storage or session storage. Reconstructing a
              payment page never depends on either.
            </li>
            <li>No analytics, advertising pixels or cross-site tracking scripts.</li>
            <li>No UPI PINs, OTPs, passwords or banking credentials.</li>
          </ul>

          <h2>Your browser and your shared link</h2>
          <p>
            A payment URL contains the UPI ID and any amount you set, so it can
            appear in your browser history, bookmarks, clipboard, and any
            messaging application you use to share it. Treat a payment link with
            the same care as the UPI ID itself. Anyone who has the link can
            reconstruct the payment page.
          </p>

          <h2>Hosting and technical logs</h2>
          <p>
            This site is hosted on Netlify. Like most hosting providers, Netlify
            and its content delivery network may process technical request data
            such as IP addresses, browser user agents, timestamps and requested
            URLs for security, reliability and operational purposes. Those URLs
            can include the UPI ID and optional amount because they are part of
            the path and query string. We do not control those infrastructure
            logs. See Netlify&apos;s own privacy documentation for details.
          </p>
          <p>
            Your browser may also store your light/dark theme preference in
            local storage. That preference contains no payment information and
            is not required to view or regenerate a QR code.
          </p>

          <h2>Payment applications and third parties</h2>
          <p>
            Choosing a payment application can hand the UPI payment URI to that
            third-party app. Once you leave UPI QR Generator, the app&apos;s own privacy
            policy and terms apply. UPI QR Generator does not receive confirmation of a
            payment and has no access to your bank account.
          </p>

          <h2>Security</h2>
          <p>
            The site is served over HTTPS. Keeping the application stateless
            reduces the amount of sensitive data that could be exposed, but no
            website or transmission method can be guaranteed completely secure.
            Only enter a UPI ID that you are comfortable sharing in a link.
          </p>

          <h2>Changes</h2>
          <p>
            This note may be updated if the application changes. The revision
            date at the top of this page will reflect material updates.
          </p>

          <h2>Questions</h2>
          <p>
            The source code is public. For privacy questions or corrections,
            open an issue in the{" "}
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

        <div className="mt-10 rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm text-ink-muted">
            UPI QR Generator is an independent project. It is not affiliated with NPCI,
            Google Pay, PhonePe, Paytm, or any bank.
          </p>
          <Link
            href="/disclaimer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
          >
            Read the full disclaimer
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
