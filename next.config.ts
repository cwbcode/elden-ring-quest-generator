import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'eldenring.fanapis.com' },
      { protocol: 'https', hostname: 'eldenring.wiki.gg' },
      { protocol: 'https', hostname: 'eldenring.wiki.fextralife.com' }
    ],
  },
};

export default nextConfig;
