import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import logger from "@/lib/logger";

export function middleware(request: NextRequest) {
  const start = Date.now();
  const res = NextResponse.next();
  res.headers.set("x-request-start", String(start));
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};

