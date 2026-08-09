import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    learningContent: {
      stale: 3600,
      revalidate: 300,
      expire: 86_400,
    },
  },
};

export default nextConfig;
