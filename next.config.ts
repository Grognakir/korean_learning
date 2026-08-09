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
    // A content-store outage is cached only long enough to shield the store from retry storms.
    learningContentUnavailable: {
      stale: 5,
      revalidate: 15,
      expire: 60,
    },
  },
};

export default nextConfig;
