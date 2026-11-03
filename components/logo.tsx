import Link from "next/link";
import { cn } from "@/lib/cn";

type LogoProps = {
  href?: string;
  className?: string;
};

export function Logo({ href = "/", className }: LogoProps) {
  const content = (
    <>
      <LogoMark />
      <span className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-[1rem] font-semibold tracking-[-0.02em] text-ink">
          UPI QR
        </span>
        <span className="text-[1rem] font-medium tracking-[-0.02em] text-ink-muted">
          Generator
        </span>
      </span>
    </>
  );

  if (!href) {
    return (
      <span className={cn("inline-flex items-center gap-2.5", className)}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full transition-opacity hover:opacity-80",
        className,
      )}
    >
      {content}
    </Link>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[11px] bg-accent text-accent-ink shadow-sm",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[22px]" fill="none">
        <path
          d="M4.5 8.2V6.4c0-1.05.85-1.9 1.9-1.9h1.8M17.7 4.5h1.9c1.05 0 1.9.85 1.9 1.9v1.8M21.5 15.8v1.8c0 1.05-.85 1.9-1.9 1.9h-1.8M6.3 19.5H4.4c-1.05 0-1.9-.85-1.9-1.9v-1.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <rect x="8" y="8" width="3.4" height="3.4" rx="0.7" fill="currentColor" />
        <rect x="13" y="13" width="3.4" height="3.4" rx="0.7" fill="currentColor" />
        <circle cx="14.6" cy="9.6" r="1.15" fill="currentColor" opacity="0.7" />
        <circle cx="9.5" cy="14.8" r="1.15" fill="currentColor" opacity="0.7" />
      </svg>
    </span>
  );
}
