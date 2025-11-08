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
  // Rewrites for special files (like ZarinPal verification)
  async rewrites() {
    return [
      {
        source: '/28569823.txt',
        destination: '/28569823.txt',
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
