import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'eldenring.fanapis.com' },
      { protocol: 'https', hostname: 'eldenring.wiki.gg' }
    ],
  },
};

export default nextConfig;
