import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // UPI Link is deployed with Netlify's native Next.js integration.
  // Keep the standard server build: no static export and no basePath.
};

export default nextConfig;
