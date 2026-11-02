import { ImageResponse } from "next/og";
import { SITE_TAGLINE } from "@/lib/site";

export const alt = "UPI Link — Your UPI. One Link.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#082f24",
          color: "#f3f4ef",
          padding: "64px 72px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: "#4cc79b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#04130c",
                fontSize: 27,
                fontWeight: 700,
                marginRight: 16,
              }}
            >
              U
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              UPI Link
            </div>
          </div>
          <div
            style={{
              display: "flex",
              border: "1px solid rgba(243,244,239,0.25)",
              borderRadius: 999,
              padding: "10px 18px",
              fontSize: 16,
              color: "#b9d8cc",
              letterSpacing: "0.08em",
            }}
          >
            STATELESS PAYMENT LINKS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              fontWeight: 600,
              letterSpacing: "-0.055em",
              lineHeight: 1,
            }}
          >
            Your UPI.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              fontStyle: "italic",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: "#4cc79b",
              fontFamily: "Georgia, serif",
            }}
          >
            One Link.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              maxWidth: 760,
              fontSize: 24,
              lineHeight: 1.45,
              color: "#b9d8cc",
            }}
          >
            A scannable UPI QR code and a shareable payment page. No account,
            no database, no stored payment data.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(243,244,239,0.18)",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", fontSize: 20, color: "#8fc7b2" }}>
            {SITE_TAGLINE}
          </div>
          <div style={{ display: "flex", fontSize: 20, color: "#f3f4ef" }}>
            upigenerator.netlify.app
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
