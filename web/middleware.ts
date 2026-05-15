import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // CORS headers for cross-origin requests
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With, X-CSRF-Token');

  // Content Security Policy - More permissive for Firebase and Google services
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self' https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:",
      "frame-src 'self' https: data: blob:",
      "img-src 'self' data: https: blob:",
      "style-src 'self' 'unsafe-inline' https:",
      "font-src 'self' https: data:",
      "connect-src 'self' https: wss: blob:",
      "child-src 'self' blob: data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ')
  );

  // Cross-Origin policies for popup auth to work
  // Use same-origin-allow-popups so popup windows can be opened and inspected
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  // Do not set Cross-Origin-Embedder-Policy here (can break third-party scripts)

  // Fix Permissions-Policy header with valid features only (no ambient-light-sensor)
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
