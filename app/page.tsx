import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleCheck,
  DatabaseZap,
  Globe2,
  Link2,
  LockKeyhole,
  MonitorSmartphone,
  QrCode,
  ScanLine,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { HeroForm } from "@/components/hero-form";
import { LogoMark } from "@/components/logo";
import { GITHUB_URL } from "@/lib/site";

const paymentApps = [
  { name: "Google Pay", className: "bg-[#1a73e8]" },
  { name: "PhonePe", className: "bg-[#5f259f]" },
  { name: "Paytm", className: "bg-[#00baf2]" },
];

const steps = [
  {
    number: "01",
    title: "Enter your UPI ID",
    description:
      "Add your UPI ID and, if you like, the amount you want to receive. No name, phone number, bank details, PIN or OTP is needed.",
  },
  {
    number: "02",
    title: "Generate your QR",
    description:
      "We build a standard UPI payment URI and encode it into a sharp QR code, plus a unique payment page you can share.",
  },
  {
    number: "03",
    title: "Share or scan",
    description:
      "Send the link, show the QR on your screen, or open the page on a phone to launch a payment app. The link rebuilds the QR every time.",
  },
];

const features = [
  {
    icon: QrCode,
    title: "A QR that actually scans",
    body: "High-contrast, high-resolution codes generated in the browser from a real UPI payment URI — not a screenshot or a link to this website.",
  },
  {
    icon: Link2,
    title: "Links that rebuild themselves",
    body: "The UPI ID and optional amount live in the URL. There is no database, no lookup step and no session dependency, so a link reopens the same payment page later.",
  },
  {
    icon: Smartphone,
    title: "Payment apps, done right",
    body: "On Android we use package-targeted UPI intents. On iPhone and iPad we use each app’s own scheme. On desktop the app buttons step aside for the QR.",
  },
  {
    icon: LockKeyhole,
    title: "Private by architecture",
    body: "No accounts, analytics scripts, tracking pixels or stored payments. Your UPI ID appears in the link you choose to share — nothing more.",
  },
];

const faqs = [
  {
    question: "Is UPI QR Generator free to use?",
    answer:
      "Yes. There is no account, subscription or fee. It is a small, independent utility built to make UPI payment links easier to create and share.",
  },
  {
    question: "Why is there a CAPTCHA?",
    answer:
      "Cloudflare Turnstile checks that a person is creating the payment link. The check runs before the page is generated, and no CAPTCHA token or verification result is stored in a database.",
  },
  {
    question: "Does UPI QR Generator verify my UPI ID?",
    answer:
      "No. We check the basic syntax only. A correctly formatted UPI ID can still be inactive, mistyped or belong to someone else. Always confirm the recipient inside your payment app before paying.",
  },
  {
    question: "Can I set a payment amount?",
    answer:
      "Yes, optionally. Enter an amount to embed it in the QR code and payment link, or leave the field blank for an open-amount QR where the payer chooses the amount in their UPI app.",
  },
  {
    question: "Where is my UPI ID stored?",
    answer:
      "The UPI ID and any optional amount are encoded into the payment URL and rendered in your browser. UPI QR Generator does not write them to a database, account, local storage or session storage. The page is recreated from the URL each time it opens.",
  },
  {
    question: "Do payment links expire?",
    answer:
      "The application has no expiry or deletion step. A link remains reproducible as long as this domain, its hosting and the application remain available. No website can honestly promise permanent availability.",
  },
  {
    question: "Which UPI apps can I use?",
    answer:
      "Any application that supports UPI QR codes or UPI payment URIs can pay the recipient. Dedicated launch buttons are provided for Google Pay, PhonePe and Paytm on supported mobile devices.",
  },
  {
    question: "Does it work on a desktop?",
    answer:
      "Yes. Desktop visitors see the full QR code and can scan it with any UPI application on their phone. App-launch buttons are disabled on desktop because mobile app schemes cannot reliably launch desktop apps.",
  },
  {
    question: "Will you ever ask for my PIN or OTP?",
    answer:
      "Never. UPI QR Generator needs a UPI ID and, optionally, the amount you want to receive. It never asks for a UPI PIN, OTP, password, card number, bank credentials or phone number.",
  },
];

export default function HomePage() {
  return (
    <main id="main-content">
      {/* Hero */}
      <section className="hero-wash relative overflow-hidden">
        <div
          aria-hidden="true"
          className="bg-dot-grid mask-fade-b pointer-events-none absolute inset-0 opacity-40"
        />
        <div className="container-page relative grid items-center gap-14 py-16 lg:grid-cols-[1.04fr_0.96fr] lg:gap-20 lg:py-24">
          <div className="animate-fade-up">
            <span className="eyebrow rounded-full border border-line bg-surface/70 px-3 py-1.5 backdrop-blur">
              <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
              A payment link, not a payment processor
            </span>

            <h1 className="mt-6 text-[clamp(2.8rem,7vw,5.25rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-ink">
              Your UPI.
              <br />
              <span className="font-display font-semibold tracking-[-0.045em] text-accent">
                One Link.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[1.03rem] leading-7 text-ink-muted sm:text-lg sm:leading-8">
              Turn your UPI ID into a crisp payment QR code and a shareable
              link, with an optional amount built in. Send it once, print it, or
              let someone scan your screen — no account and no stored payment
              data.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-ink-muted">
              {["Free to use", "No sign-up", "Nothing stored"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-accent-soft text-accent">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#generator" className="btn-primary btn-lg">
                Create a payment link
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <a href="#how-it-works" className="btn-secondary btn-lg">
                See how it works
              </a>
            </div>

            <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-ink-subtle">
              <ShieldCheck
                className="mt-0.5 size-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              Only your UPI ID is required; an amount is optional. Never enter
              a UPI PIN, OTP, password or bank credentials.
            </p>
          </div>

          <div className="animate-fade-up animate-delay-1">
            <HeroForm />
          </div>
        </div>
      </section>

      {/* Compatibility strip */}
      <section
        aria-label="Compatible payment applications"
        className="border-y border-line bg-surface/50"
      >
        <div className="container-page flex flex-col items-center justify-between gap-5 py-6 sm:flex-row">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-subtle">
            Works with UPI apps
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {paymentApps.map((app) => (
              <span
                key={app.name}
                className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted"
              >
                <span
                  className={`grid size-5 place-items-center rounded-full text-[0.6rem] font-bold text-white ${app.className}`}
                  aria-hidden="true"
                >
                  {app.name.charAt(0)}
                </span>
                {app.name}
              </span>
            ))}
            <span className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted">
              <span className="grid size-5 place-items-center rounded-full bg-ink text-[0.55rem] font-bold text-canvas">
                <QrCode className="size-3" aria-hidden="true" />
              </span>
              Any UPI app
            </span>
          </div>
          <p className="hidden text-xs text-ink-subtle lg:block">
            Standard UPI URI
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container-page py-20 sm:py-24">
        <div className="max-w-2xl">
          <span className="eyebrow">
            <ScanLine className="size-3.5 text-accent" aria-hidden="true" />
            How it works
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-[2.6rem] sm:leading-[1.05]">
            One UPI ID. One link. No account.
          </h2>
          <p className="mt-4 text-base leading-7 text-ink-muted">
            UPI QR Generator does one job carefully: turn a UPI ID into something
            someone else can pay with. Everything happens in your browser.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.number}
              className="card group relative overflow-hidden p-6 transition duration-300 hover:-translate-y-0.5 hover:border-line-strong sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl font-semibold tracking-tight text-ink-subtle/70">
                  {step.number}
                </span>
                <span className="grid size-9 place-items-center rounded-full border border-line bg-canvas text-ink-subtle">
                  {index === 0 ? (
                    <Wallet className="size-4" aria-hidden="true" />
                  ) : index === 1 ? (
                    <QrCode className="size-4" aria-hidden="true" />
                  ) : (
                    <Share2 className="size-4" aria-hidden="true" />
                  )}
                </span>
              </div>
              <h3 className="mt-8 text-lg font-semibold tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-surface/60 p-4 text-sm text-ink-muted">
          <CircleCheck
            className="mt-0.5 size-4 shrink-0 text-accent"
            aria-hidden="true"
          />
          <p>
            <span className="font-medium text-ink">Format-valid is not verified.</span>{" "}
            We cannot confirm that a UPI ID is active or belongs to the person
            you expect. Confirm the recipient inside your payment app.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-line bg-surface/40">
        <div className="container-page py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <span className="eyebrow">
                <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
                Built with care
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-[2.6rem] sm:leading-[1.05]">
                Small surface area. Solid foundations.
              </h2>
              <p className="mt-4 max-w-md text-base leading-7 text-ink-muted">
                A focused tool with no unnecessary layers: client-side QR
                generation, stateless links and platform-aware payment actions.
              </p>
              <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-line bg-canvas px-4 py-3">
                <span className="grid size-9 place-items-center rounded-full bg-accent-soft text-accent">
                  <Globe2 className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">
                    Works across devices
                  </p>
                  <p className="text-xs text-ink-subtle">
                    Mobile, tablet and desktop
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="card p-6 transition duration-300 hover:border-line-strong"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                    <feature.icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-[0.98rem] font-semibold tracking-tight text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {feature.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section
        id="privacy"
        className="container-page overflow-hidden py-20 sm:py-24"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <span className="eyebrow">
              <LockKeyhole className="size-3.5 text-accent" aria-hidden="true" />
              Privacy by design
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-[2.6rem] sm:leading-[1.05]">
              No database. No account. No payment details.
            </h2>
            <p className="mt-4 text-base leading-7 text-ink-muted">
              A payment link should not require a profile or a server-side
              record. Here, the link itself carries the one piece of
              information needed to rebuild the payment page.
            </p>

            <ul className="mt-7 space-y-3.5">
              {[
                "Your UPI ID and optional amount are encoded in the URL you choose to share.",
                "QR codes are generated locally in your browser, not fetched from a server.",
                "We never ask for or accept UPI PINs, OTPs, passwords or bank credentials.",
                "No analytics, advertising pixels or third-party tracking scripts.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink-muted">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-6 text-xs leading-5 text-ink-subtle">
              Hosting providers and browsers may still process technical logs
              and requested URLs. Read the{" "}
              <Link
                href="/privacy"
                className="font-medium text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
              >
                privacy note
              </Link>{" "}
              for the honest details.
            </p>
          </div>

          <div>
            <div className="card relative overflow-hidden p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
                    What the link carries
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Enough to reconstruct the QR
                  </p>
                </div>
                <span className="grid size-10 place-items-center rounded-xl border border-line bg-canvas text-ink-muted">
                  <Link2 className="size-4" aria-hidden="true" />
                </span>
              </div>

              <div className="mt-6 overflow-hidden rounded-xl border border-line bg-canvas px-4 py-3">
                <p className="truncate font-mono text-xs text-ink-muted">
                  upigenerator.netlify.app/pay/
                  <span className="text-accent">name%40okaxis</span>
                </p>
              </div>

              <div className="mt-6 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
                {["UPI ID", "UPI URI", "QR"].map((label, index) => (
                  <div key={label} className="contents">
                    <div className="rounded-xl border border-line bg-surface px-2 py-4 text-center">
                      <p className="text-[0.63rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                        {label}
                      </p>
                      <p className="mt-1 font-mono text-[0.6rem] text-ink-muted">
                        {index === 0
                          ? "name@okaxis"
                          : index === 1
                            ? "upi://pay"
                            : "PNG"}
                      </p>
                    </div>
                    {index < 2 && (
                      <ArrowRight
                        className="size-3.5 text-ink-subtle"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-line-strong bg-canvas/60 px-4 py-3">
                <DatabaseZap
                  className="size-4 text-ink-subtle"
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <p className="text-xs font-medium text-ink-muted">
                    Database lookup
                  </p>
                  <p className="text-[0.65rem] text-ink-subtle">
                    Not needed and not used
                  </p>
                </div>
                <X className="size-4 text-ink-subtle" aria-hidden="true" />
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-line pt-4 text-[0.68rem] text-ink-subtle">
                <MonitorSmartphone className="size-3.5" aria-hidden="true" />
                Same URL, same QR — on any device, any time.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-y border-line bg-surface/40">
        <div className="container-page py-20 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <span className="eyebrow">
                <CircleCheck
                  className="size-3.5 text-accent"
                  aria-hidden="true"
                />
                Good to know
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-[2.6rem] sm:leading-[1.05]">
                Questions, answered plainly.
              </h2>
              <p className="mt-4 text-sm leading-6 text-ink-muted">
                Still unsure about something? The{" "}
                <Link
                  href="/disclaimer"
                  className="font-medium text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
                >
                  full disclaimer
                </Link>{" "}
                covers the limits of this tool.
              </p>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent underline decoration-accent/30 underline-offset-4 transition hover:decoration-accent"
              >
                View source code on GitHub
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            </div>

            <div className="divide-y divide-line border-y border-line">
              {faqs.map((faq) => (
                <details key={faq.question} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-[0.95rem] font-medium text-ink [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink-subtle transition group-open:rotate-180">
                      <ChevronDown className="size-3.5" aria-hidden="true" />
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-5 pr-10 text-sm leading-6 text-ink-muted">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20 sm:py-24">
        <div className="relative overflow-hidden rounded-4xl bg-[#0f172a] px-6 py-14 text-[#f8fafc] sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, #f8fafc 1px, transparent 0)",
              backgroundSize: "26px 26px",
            }}
          />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-xl">
              <div className="flex items-center gap-2.5">
                <LogoMark className="bg-[#2563eb] text-[#ffffff]" />
                <span className="text-sm font-medium text-[#bfdbfe]">
                  UPI QR Generator
                </span>
              </div>
              <h2 className="mt-6 text-3xl font-semibold tracking-[-0.035em] sm:text-[2.7rem] sm:leading-[1.04]">
                Ready to turn your UPI ID into a link?
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#cbd5e1] sm:text-base">
                It takes seconds. No form-filling, no account, no payment data
                stored.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#generator"
                className="btn btn-lg bg-[#f8fafc] text-[#0f172a] hover:bg-white active:scale-[0.985]"
              >
                Generate a QR
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <Link
                href="/privacy"
                className="btn btn-lg border border-[#f8fafc]/25 text-[#f8fafc] hover:bg-[#f8fafc]/10"
              >
                Privacy note
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
