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
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },
};

export default nextConfig;
