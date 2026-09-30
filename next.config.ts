import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.CARVIZO_STATIC_EXPORT === "1" ? { output: "export" as const, trailingSlash: true } : {}),
  images: {
    unoptimized: process.env.CARVIZO_STATIC_EXPORT === "1",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
