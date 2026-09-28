import type { NextConfig } from "next";
import { ASSET_HOSTNAME, ASSET_PATH_PREFIXES } from "./lib/assets";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy.
 * - Images are served by the Next.js image optimizer (same origin), so
 *   img-src doesn't need NASA's host. Only video streams straight from NASA.
 * - script-src needs 'unsafe-inline' for Next's inline bootstrap scripts.
 *   A nonce-based policy would remove it, but nonces force every page to
 *   render dynamically, which would defeat ISR. See README, "Security".
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  `media-src https://${ASSET_HOSTNAME}`,
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Only NASA's APOD asset paths may be optimized, and only without a query
    // string (the API client strips resize params before URLs reach here).
    remotePatterns: ASSET_PATH_PREFIXES.map((prefix) => ({
      protocol: "https",
      hostname: ASSET_HOSTNAME,
      pathname: `${prefix}**`,
      search: "",
    })),
    qualities: [75],
    // APOD images never change once published, so cache optimized renditions
    // for 31 days instead of re-fetching the originals.
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
