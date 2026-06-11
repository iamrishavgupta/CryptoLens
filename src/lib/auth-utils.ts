import { User } from "@/types/auth";

// Cookie names
export const AUTH_COOKIES = {
  TOKEN: "auth-token",
  SESSION: "session-token",
  USER_SESSION: "user-session",
  REFRESH_TOKEN: "refresh-token",
} as const;

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: false, // Set to false so client can access
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

export class AuthCookieManager {
  // Set authentication cookies
  static setAuthCookies(user: User, token: string, refreshToken?: string) {
    const userSession = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      isAuthenticated: true,
      timestamp: Date.now(),
    };

    // Set cookies that middleware can read
    document.cookie = `${AUTH_COOKIES.TOKEN}=${token}; path=/; max-age=${
      COOKIE_OPTIONS.maxAge
    }; ${COOKIE_OPTIONS.secure ? "secure;" : ""} samesite=${
      COOKIE_OPTIONS.sameSite
    }`;
    document.cookie = `${AUTH_COOKIES.USER_SESSION}=${encodeURIComponent(
      JSON.stringify(userSession)
    )}; path=/; max-age=${COOKIE_OPTIONS.maxAge}; ${
      COOKIE_OPTIONS.secure ? "secure;" : ""
    } samesite=${COOKIE_OPTIONS.sameSite}`;

    if (refreshToken) {
      document.cookie = `${
        AUTH_COOKIES.REFRESH_TOKEN
      }=${refreshToken}; path=/; max-age=${COOKIE_OPTIONS.maxAge}; ${
        COOKIE_OPTIONS.secure ? "secure;" : ""
      } samesite=${COOKIE_OPTIONS.sameSite}`;
    }
  }

  // Clear authentication cookies
  static clearAuthCookies() {
    const cookiesToClear = [
      AUTH_COOKIES.TOKEN,
      AUTH_COOKIES.SESSION,
      AUTH_COOKIES.USER_SESSION,
      AUTH_COOKIES.REFRESH_TOKEN,
    ];

    cookiesToClear.forEach((cookieName) => {
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
  }

  // Get authentication status from cookies
  static getAuthStatus(): {
    isAuthenticated: boolean;
    user: Partial<User> | null;
  } {
    if (typeof document === "undefined") {
      return { isAuthenticated: false, user: null };
    }

    try {
      const cookies = document.cookie.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const userSessionCookie = cookies[AUTH_COOKIES.USER_SESSION];
      const authToken = cookies[AUTH_COOKIES.TOKEN];

      if (userSessionCookie && authToken) {
        const userSession = JSON.parse(decodeURIComponent(userSessionCookie));
        return {
          isAuthenticated: true,
          user: userSession,
        };
      }

      return { isAuthenticated: false, user: null };
    } catch (error) {
      console.error("Error parsing auth cookies:", error);
      return { isAuthenticated: false, user: null };
    }
  }

  // Check if user is authenticated (client-side)
  static isAuthenticated(): boolean {
    return this.getAuthStatus().isAuthenticated;
  }
}

// Route protection utilities
export const ROUTE_CONFIG = {
  // Routes that require authentication
  PROTECTED: [
    "/portfolio",
    "/transactions",
    "/watchlist",
    "/alerts",
    "/settings",
    "/notifications",
  ],

  // Routes that authenticated users shouldn't access
  AUTH_ONLY: ["/login", "/register"],

  // Public routes (accessible to everyone)
  PUBLIC: [
    "/",
    "/market",
    "/news",
    "/education",
    "/exchanges",
    "/analytics",
    "/defi",
    "/nft",
    "/products",
  ],
} as const;

// Helper to check if a route is protected
export function isProtectedRoute(pathname: string): boolean {
  return ROUTE_CONFIG.PROTECTED.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

// Helper to check if a route is auth-only (login/register)
export function isAuthRoute(pathname: string): boolean {
  return ROUTE_CONFIG.AUTH_ONLY.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

// Helper to check if a route is public
export function isPublicRoute(pathname: string): boolean {
  return ROUTE_CONFIG.PUBLIC.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}
