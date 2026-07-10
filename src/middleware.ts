import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPaths = ["/events/create", "/bookings", "/dashboard", "/admin", "/profile"];
const organizerPaths = ["/events/create", "/dashboard"];
const adminPaths = ["/admin"];
const authPaths = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Redirect authenticated users away from auth pages
  if (authPaths.some((p) => pathname.startsWith(p)) && token) {
    return NextResponse.redirect(new URL("/events", request.url));
  }

  // Check if path requires authentication
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check organizer access
  if (organizerPaths.some((p) => pathname.startsWith(p)) && token) {
    if (token.role !== "ORGANIZER" && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/events", request.url));
    }
  }

  // Check admin access
  if (adminPaths.some((p) => pathname.startsWith(p)) && token) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/events", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/events/create",
    "/bookings/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
