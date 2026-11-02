import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaymentView } from "@/components/payment-view";
import { SITE_NAME } from "@/lib/site";
import {
  buildPaymentPath,
  buildPaymentUrl,
  buildUpiUri,
  readUpiRouteParam,
} from "@/lib/upi";

type PaymentPageProps = {
  // Next.js 15 delivers route params asynchronously.
  params: Promise<{ upi: string }>;
};

export async function generateMetadata({
  params,
}: PaymentPageProps): Promise<Metadata> {
  const { upi } = await params;
  const result = readUpiRouteParam(upi);

  if (!result.valid) {
    return {
      title: "Payment link not found",
      description:
        "This payment link does not contain a valid UPI ID. Create a new UPI Link payment page.",
      robots: { index: false, follow: false },
    };
  }

  const upiId = result.upiId;
  const title = `Pay ${upiId}`;
  const description = `UPI payment page for ${upiId}. Scan the QR code with any UPI app, or open Google Pay, PhonePe, or Paytm on a supported mobile device.`;

  return {
    title,
    description,
    alternates: {
      // Canonical form uses the single, encoded representation of the UPI ID.
      canonical: buildPaymentPath(upiId),
    },
    // Payment pages contain a UPI ID, so they are available to visitors but
    // intentionally kept out of search indexes.
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
    openGraph: {
      type: "website",
      title: `${title} · ${SITE_NAME}`,
      description,
      url: buildPaymentUrl(upiId),
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary",
      title: `${title} · ${SITE_NAME}`,
      description,
    },
  };
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { upi } = await params;

  // Next.js may hand over a percent-encoded route segment. The helper decodes
  // exactly once, then validates; it never decodes a second time.
  const result = readUpiRouteParam(upi);

  if (!result.valid) {
    notFound();
  }

  const upiId = result.upiId;

  return (
    <PaymentView
      key={upiId}
      upiId={upiId}
      upiUri={buildUpiUri(upiId)}
      paymentUrl={buildPaymentUrl(upiId)}
    />
  );
}
