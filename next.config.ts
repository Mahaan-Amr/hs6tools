import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  images: {
    domains: ["localhost", "images.unsplash.com", "87.107.73.10"],
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
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
