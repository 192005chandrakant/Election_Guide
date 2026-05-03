import { NextRequest, NextResponse } from "next/server";

const ALLOW_HEADERS = "Origin, Content-Type, Accept, Authorization, X-Requested-With, X-CSRF-Token";
const ALLOW_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";

function applyCorsHeaders(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get("origin");

  response.headers.set("Access-Control-Allow-Origin", origin || "*");
  response.headers.set("Access-Control-Allow-Methods", ALLOW_METHODS);
  response.headers.set("Access-Control-Allow-Headers", ALLOW_HEADERS);
  response.headers.set("Access-Control-Max-Age", "86400");
  response.headers.set("Vary", "Origin");
  return response;
}

export function proxy(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return applyCorsHeaders(request, new NextResponse(null, { status: 204 }));
  }

  return applyCorsHeaders(request, NextResponse.next());
}

export const config = {
  matcher: "/api/:path*",
};