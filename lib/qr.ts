import QRCode from "qrcode";

/**
 * Render a QR code to a PNG data URL in the browser. The code is always dark
 * on white, independent of the site theme, so it stays easy to scan.
 */
export async function createQrDataUrl(
  value: string,
  size: number,
): Promise<string> {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: "M",
    margin: 3,
    width: size,
    color: {
      dark: "#0B0F0E",
      light: "#FFFFFF",
    },
  });
}

export function getQrFileName(upiId: string): string {
  const safe = upiId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `upi-qr-generator-${safe || "payment"}-qr.png`;
}

/**
 * Build and trigger a high-resolution PNG download. Creation happens on
 * demand so the initial page stays light.
 */
export async function downloadQrPng(
  value: string,
  upiId: string,
): Promise<void> {
  const dataUrl = await createQrDataUrl(value, 1024);
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = getQrFileName(upiId);
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
