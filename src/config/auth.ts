// Authentication and Route Protection Configuration
// This file documents the routing rules and authentication requirements for the application

export const AUTH_CONFIG = {
  // Routes that require authentication
  PROTECTED_ROUTES: [
    // Dashboard routes (require authentication)
    "/portfolio",
    "/transactions",
    "/watchlist",
    "/alerts",

    // User-specific routes
    "/settings",
    "/notifications",
  ],

  // Routes that authenticated users shouldn't access (will redirect to dashboard)
  AUTH_ONLY_ROUTES: ["/login", "/register"],

  // Public routes (accessible to everyone)
  PUBLIC_ROUTES: [
    "/",
    "/market",
    "/news",
    "/education",
    "/exchanges",
    "/analytics",
    "/defi",
    "/nft",
    "/products",
    "/coin", // Dynamic route: /coin/[id]
  ],

  // Redirect destinations
  REDIRECTS: {
    DEFAULT_AFTER_LOGIN: "/portfolio",
    DEFAULT_AFTER_LOGOUT: "/",
    LOGIN_PAGE: "/login",
  },
} as const;

// Route protection levels
export enum ProtectionLevel {
  PUBLIC = "public", // Accessible to everyone
  PROTECTED = "protected", // Requires authentication
  AUTH_ONLY = "auth-only", // Only accessible to unauthenticated users
}

// Route configuration mapping
export const ROUTE_PROTECTION: Record<string, ProtectionLevel> = {
  // Public routes
  "/": ProtectionLevel.PUBLIC,
  "/market": ProtectionLevel.PUBLIC,
  "/news": ProtectionLevel.PUBLIC,
  "/education": ProtectionLevel.PUBLIC,
  "/exchanges": ProtectionLevel.PUBLIC,
  "/analytics": ProtectionLevel.PUBLIC,
  "/defi": ProtectionLevel.PUBLIC,
  "/nft": ProtectionLevel.PUBLIC,
  "/products": ProtectionLevel.PUBLIC,
  "/coin": ProtectionLevel.PUBLIC,

  // Protected routes (require authentication)
  "/portfolio": ProtectionLevel.PROTECTED,
  "/transactions": ProtectionLevel.PROTECTED,
  "/watchlist": ProtectionLevel.PROTECTED,
  "/alerts": ProtectionLevel.PROTECTED,
  "/settings": ProtectionLevel.PROTECTED,
  "/notifications": ProtectionLevel.PROTECTED,

  // Auth-only routes (redirect if authenticated)
  "/login": ProtectionLevel.AUTH_ONLY,
  "/register": ProtectionLevel.AUTH_ONLY,
};

// Utility functions for route checking
export function getRouteProtection(pathname: string): ProtectionLevel {
  // Check exact match first
  if (ROUTE_PROTECTION[pathname]) {
    return ROUTE_PROTECTION[pathname];
  }

  // Check for route patterns (e.g., /coin/bitcoin should match /coin)
  for (const [route, protection] of Object.entries(ROUTE_PROTECTION)) {
    if (pathname.startsWith(route + "/")) {
      return protection;
    }
  }

  // Default to public if no match found
  return ProtectionLevel.PUBLIC;
}

export function isRouteProtected(pathname: string): boolean {
  return getRouteProtection(pathname) === ProtectionLevel.PROTECTED;
}

export function isRouteAuthOnly(pathname: string): boolean {
  return getRouteProtection(pathname) === ProtectionLevel.AUTH_ONLY;
}

export function isRoutePublic(pathname: string): boolean {
  return getRouteProtection(pathname) === ProtectionLevel.PUBLIC;
}
