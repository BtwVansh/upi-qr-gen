import Link from "next/link";
import { ArrowUpRight, Code2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { GITHUB_URL } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 md:flex"
        >
          <Link href="/#how-it-works" className="btn-ghost btn-sm">
            How it works
          </Link>
          <Link href="/#privacy" className="btn-ghost btn-sm">
            Privacy
          </Link>
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost btn-sm"
          >
            GitHub
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/#generator"
            className="btn-primary btn-sm max-[374px]:hidden"
          >
            Create a link
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface/50">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-6 text-ink-muted">
              A free, independent utility for turning a UPI ID into a scannable
              QR code and a shareable payment link.
            </p>
            <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-ink-subtle">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
              UPI QR Generator does not process payments, hold money, or verify UPI IDs.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
              Product
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  href="/#generator"
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  Create a payment link
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
              Legal
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  Disclaimer
                </Link>
              </li>
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-ink-muted transition-colors hover:text-ink"
                >
                  Source code
                  <Code2 className="size-3.5" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-6">
          <p className="text-xs leading-5 text-ink-subtle">
            © {year} UPI QR Generator. An independent tool, not affiliated with NPCI or
            any bank or payment application. Payment links remain reproducible
            only while this domain, hosting, and application remain available.
          </p>
        </div>
      </div>
    </footer>
  );
}
