import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA will be handled via a manual service worker registration
  // Enable standalone output for minimal Docker images
  output: "standalone",
  // next-pwa is incompatible with Next.js 16 Turbopack
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Origin, Content-Type, Accept, Authorization, X-Requested-With, X-CSRF-Token" },
        ],
      },
    ];
  },
};

export default nextConfig;
