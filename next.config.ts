import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL('https://eldenring.fanapis.com/images/**')],
  },
};

export default nextConfig;
