import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  images: {
    domains: ["localhost", "images.unsplash.com"],
    formats: ["image/webp", "image/avif"],
  },
  env: {
    CUSTOM_KEY: "my-value",
  },
};

export default nextConfig;
