import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Your UPI. One Link.`,
    short_name: SITE_NAME,
    description:
      "Generate UPI payment QR codes and shareable, stateless payment links.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f6f1",
    theme_color: "#0b7a5c",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
