import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    viewTransition: true,
    staleTimes: {
      dynamic: 60,
      static: 600,
    },
  },
};

export default nextConfig;
