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
      {
        // Security headers for all routes
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              [
                "default-src 'self' https:",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com https://apis.google.com https://accounts.google.com",
                "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://apis.google.com https://*.googleusercontent.com",
                "img-src 'self' data: https: blob:",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com",
                "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://*.cloudfunctions.net https://www.google-analytics.com https://googletagmanager.com https://*.google.com wss:",
                "base-uri 'self'",
                "form-action 'self'",
                "upgrade-insecure-requests",
              ].join('; '),
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
