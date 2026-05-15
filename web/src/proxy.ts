import { NextRequest, NextResponse } from "next/server";

const ALLOW_HEADERS = "Origin, Content-Type, Accept, Authorization, X-Requested-With, X-CSRF-Token";
const ALLOW_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";

/**
 * Security Proxy Handler
 * Applies security headers and CORS configuration to all requests
 */
function applyCorsHeaders(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get("origin");

  response.headers.set("Access-Control-Allow-Origin", origin || "*");
  response.headers.set("Access-Control-Allow-Methods", ALLOW_METHODS);
  response.headers.set("Access-Control-Allow-Headers", ALLOW_HEADERS);
  response.headers.set("Access-Control-Max-Age", "86400");
  response.headers.set("Vary", "Origin");
  return response;
}

/**
 * Apply security headers to all responses
 * Implements OWASP best practices
 */
function applySecurityHeaders(response: NextResponse) {
  // Content Security Policy - allow Firebase and Google frames/scripts
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self' https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com https://apis.google.com https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://*.cloudfunctions.net https://www.google-analytics.com https://googletagmanager.com https://*.google.com wss:",
      // Allow Firebase auth handler and Google accounts to be framed where necessary
      "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://apis.google.com https://*.googleusercontent.com",
      // Allow specific origins to embed us (avoid blocking necessary postMessage flows)
      "frame-ancestors 'self' https://*.firebaseapp.com https://accounts.google.com",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; ")
  );

  // Allow framing from same origin; do not completely deny framing
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy
  response.headers.set(
    "Permissions-Policy",
    [
      "accelerometer=()",
      "ambient-light-sensor=()",
      "autoplay=()",
      "camera=()",
      "encrypted-media=()",
      "fullscreen=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "usb=()",
    ].join(", ")
  );

  // HTTP Strict Transport Security (only in production)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

export function proxy(request: NextRequest) {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return applyCorsHeaders(request, new NextResponse(null, { status: 204 }));
  }

  // Create response with next() and apply headers
  let response = NextResponse.next();
  response = applyCorsHeaders(request, response);
  response = applySecurityHeaders(response);

  return response;
}

export const config = {
  // Apply to all routes except static assets
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};