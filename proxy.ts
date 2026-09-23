import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/workflow",
  "/workspace",
  "/projects",
  "/tasks",
  "/teams",
  "/employees",
  "/calendar",
  "/reports",
  "/profile",
  "/settings",
  "/notifications"
];

const authPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password"
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session")?.value;

  // 1. Check if path is protected
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected && !sessionToken) {
    // Redirect to login page if unauthenticated
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Check if path is an auth page (login/register)
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  if (isAuthPath && sessionToken) {
    // Redirect authenticated users away from login/register to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow request to continue
  return NextResponse.next();
}

export const config = {
  // Run proxy on all document requests except static files
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png).*)",
  ],
};
