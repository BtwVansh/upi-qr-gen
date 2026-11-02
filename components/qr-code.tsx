"use client";

import { useEffect, useState } from "react";
import { Loader2, QrCode as QrCodeIcon } from "lucide-react";
import { createQrDataUrl } from "@/lib/qr";
import { cn } from "@/lib/cn";

type QrCodeProps = {
  value: string;
  /** Rendered image size in CSS pixels. The PNG itself is generated at this width. */
  size?: number;
  alt: string;
  className?: string;
};

export function QrCode({ value, size = 640, alt, className }: QrCodeProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setSrc(null);

    createQrDataUrl(value, size)
      .then((dataUrl) => {
        if (!cancelled) setSrc(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <div
      className={cn(
        "relative grid aspect-square w-full place-items-center overflow-hidden rounded-2xl bg-white",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- a generated data URL has no optimisation benefit
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="size-full"
          draggable={false}
          decoding="async"
        />
      ) : failed ? (
        <div className="flex flex-col items-center gap-2 p-6 text-center">
          <QrCodeIcon className="size-8 text-neutral-400" aria-hidden="true" />
          <p className="text-sm font-medium text-neutral-700">
            QR code could not be generated
          </p>
          <p className="text-xs text-neutral-500">
            Reload the page to try again.
          </p>
        </div>
      ) : (
        <div
          className="qr-skeleton size-full"
          role="status"
          aria-label="Generating QR code"
        >
          <span className="sr-only">Generating QR code…</span>
          <span className="grid size-full place-items-center">
            <Loader2
              className="size-7 animate-spin text-neutral-500/60"
              aria-hidden="true"
            />
          </span>
        </div>
      )}
    </div>
  );
}
