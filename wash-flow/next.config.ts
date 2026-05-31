import type { NextConfig } from "next";

console.log('NEXT CONFIG LOADED - STATIC EXPORT ENABLED');

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
