import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Conservative CSP in Report-Only mode to detect breakage before enforcement.
// Nonces/hashes are not used here; we allow self + data/blob for runtime assets.
const cspDirectives = [
  "default-src 'self'",
  // Allow Next.js runtime and any required https resources; tighten after reports are reviewed.
  "script-src 'self' 'unsafe-inline' " + (isDev ? "'unsafe-eval' " : "") + "blob: data: https:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "media-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  images: {
    // Keep this list tight; add remote hosts explicitly as needed.
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "hs6tools.com",
      },
      {
        protocol: "https",
        hostname: "www.hs6tools.com",
      },
      {
        protocol: "https",
        hostname: "trustseal.enamad.ir",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
    unoptimized: false,
  },
  env: {
    CUSTOM_KEY: "my-value",
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Enable static exports for better performance
  trailingSlash: false,
  // Rewrites: Map /28569823.txt (and all locale-prefixed versions) to API route for ZarinPal verification
  // This ensures the file is accessible regardless of locale prefix
  async rewrites() {
    return [
      // Root path (no locale)
      {
        source: '/28569823.txt',
        destination: '/api/verify/28569823',
      },
      // Locale-prefixed paths (fa, en, ar)
      {
        source: '/fa/28569823.txt',
        destination: '/api/verify/28569823',
      },
      {
        source: '/en/28569823.txt',
        destination: '/api/verify/28569823',
      },
      {
        source: '/ar/28569823.txt',
        destination: '/api/verify/28569823',
      },
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions-Policy: disable sensitive features by default
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          // Cross-Origin Opener/Resource Policies for tab isolation and resource protection
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          // CSP: Use report-only in dev, enforce in production after monitoring
          // Switch to 'Content-Security-Policy' (without -Report-Only) to enforce
          {
            key: isDev ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
            value: cspDirectives,
          },
          // HSTS only in production to avoid local dev issues
          ...(isDev
            ? []
            : [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]),
        ],
      },
    ];
  },
};

export default nextConfig;
