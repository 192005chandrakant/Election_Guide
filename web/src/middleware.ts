import { NextRequest, NextResponse } from "next/server";

const ALLOW_HEADERS = "Content-Type, Authorization, X-Requested-With";
const ALLOW_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";

function applyCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", ALLOW_METHODS);
  response.headers.set("Access-Control-Allow-Headers", ALLOW_HEADERS);
  response.headers.set("Access-Control-Max-Age", "86400");
  response.headers.set("Vary", "Origin");
  return response;
}

export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return applyCorsHeaders(new NextResponse(null, { status: 204 }));
  }

  return applyCorsHeaders(NextResponse.next());
}

export const config = {
  matcher: "/api/:path*",
};
