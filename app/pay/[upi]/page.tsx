import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaymentView } from "@/components/payment-view";
import { SITE_NAME } from "@/lib/site";
import {
  buildPaymentHref,
  buildPaymentUrl,
  buildUpiUri,
  formatAmountInr,
  readAmountParam,
  readUpiRouteParam,
} from "@/lib/upi";

type PaymentSearchParams = {
  amount?: string | string[];
};

type PaymentPageProps = {
  // Next.js 15 delivers route params and search params asynchronously.
  params: Promise<{ upi: string }>;
  searchParams: Promise<PaymentSearchParams>;
};

async function resolvePayment({ params, searchParams }: PaymentPageProps) {
  const [{ upi }, search] = await Promise.all([params, searchParams]);

  return {
    upi: readUpiRouteParam(upi),
    amount: readAmountParam(search.amount),
  };
}

export async function generateMetadata(
  props: PaymentPageProps,
): Promise<Metadata> {
  const { upi, amount } = await resolvePayment(props);

  if (!upi.valid || !amount.valid) {
    return {
      title: "Payment link not found",
      description:
        "This payment link does not contain a valid UPI ID or amount. Create a new UPI QR Generator payment page.",
      robots: { index: false, follow: false },
    };
  }

  const upiId = upi.upiId;
  const amountLabel = amount.amount ? formatAmountInr(amount.amount) : null;
  const title = amountLabel ? `Pay ${amountLabel} to ${upiId}` : `Pay ${upiId}`;
  const description = amountLabel
    ? `Pay ${amountLabel} to ${upiId} with any UPI app. Scan the QR code, or open Google Pay, PhonePe, or Paytm on a supported mobile device.`
    : `UPI payment page for ${upiId}. Scan the QR code with any UPI app, or open Google Pay, PhonePe, or Paytm on a supported mobile device.`;

  return {
    title,
    description,
    alternates: {
      // Canonical form uses the single, encoded UPI ID and optional amount.
      canonical: buildPaymentHref(upiId, amount.amount),
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
      url: buildPaymentUrl(upiId, amount.amount),
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary",
      title: `${title} · ${SITE_NAME}`,
      description,
    },
  };
}

export default async function PaymentPage(props: PaymentPageProps) {
  const { upi, amount } = await resolvePayment(props);

  // Next.js may hand over a percent-encoded route segment. The helper decodes
  // exactly once, then validates; it never decodes a second time.
  if (!upi.valid || !amount.valid) {
    notFound();
  }

  const upiId = upi.upiId;

  return (
    <PaymentView
      key={`${upiId}:${amount.amount ?? "open"}`}
      upiId={upiId}
      amount={amount.amount}
      upiUri={buildUpiUri(upiId, amount.amount)}
      paymentUrl={buildPaymentUrl(upiId, amount.amount)}
    />
  );
}
