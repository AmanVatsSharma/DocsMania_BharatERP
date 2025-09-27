import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ignores eslint errors on build
  },
  typescript: {
    ignoreBuildErrors: true, // ignores TS build errors
  },
};

export default nextConfig;
