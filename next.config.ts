import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        process.env.VERCEL_URL ?? "",
        process.env.NEXT_PUBLIC_APP_URL ?? "",
      ].filter(Boolean),
    },
  },
};

export default nextConfig;
