import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define route patterns
const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_ROUTES = [
  "/portfolio",
  "/transactions",
  "/watchlist",
  "/alerts",
  "/settings",
  "/notifications",
];
const PUBLIC_ROUTES = [
  "/",
  "/market",
  "/news",
  "/education",
  "/exchanges",
  "/analytics",
  "/defi",
  "/nft",
  "/products",
  "/coin",
];

// Helper function to check if user is authenticated
function isAuthenticated(request: NextRequest): boolean {
  // Check for authentication token in cookies
  const authToken = request.cookies.get("auth-token")?.value;
  const sessionToken = request.cookies.get("session-token")?.value;

  // Check localStorage simulation via cookie (since we can't access localStorage in middleware)
  const userSession = request.cookies.get("user-session")?.value;

  return !!(authToken || sessionToken || userSession);
}

// Helper function to check if route matches pattern
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    if (route.endsWith("*")) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + "/");
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isUserAuthenticated = isAuthenticated(request);

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Handle authentication routes (login, register)
  if (matchesRoute(pathname, AUTH_ROUTES)) {
    if (isUserAuthenticated) {
      // Redirect authenticated users away from auth pages
      const redirectUrl =
        request.nextUrl.searchParams.get("redirect") || "/portfolio";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (matchesRoute(pathname, PROTECTED_ROUTES)) {
    if (!isUserAuthenticated) {
      // Redirect unauthenticated users to login with return URL
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Handle public routes - always allow access
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // For any other routes, allow access but you might want to customize this
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
