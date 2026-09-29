import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: [
    "local-origin.dev", // Match an exact domain
    "192.168.1.214", // Match a local network IP
    "localhost:3000", // Match localhost with a specific port
  ],
};

export default nextConfig;
