import { auth } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/modules/authorization/permissions";
import { NextRequest, NextResponse } from "next/server";

const STAFF_ROLES: AppRole[] = ["viewer", "editor", "admin"];

const ADMIN_AUTH_PATHS = ["/admin/auth/sign-in", "/admin/auth/sign-up"];
const CUSTOMER_AUTH_PATHS = ["/compte/connexion", "/compte/inscription"];
const AUTH_ONLY_PATHS = [...ADMIN_AUTH_PATHS, ...CUSTOMER_AUTH_PATHS];

// Routes needing a logged-in session (any role) but not staff privileges.
const CUSTOMER_PROTECTED_PREFIXES = ["/compte", "/commande"];

const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "development"
    ? "better-auth.session_token"
    : "__Secure-better-auth.session_token";

const ROLE_PROTECTED: { prefix: string; requiredRole: AppRole }[] = [
  { prefix: "/admin/settings", requiredRole: "admin" },
];

function isAdminPath(pathname: string) {
  return (
    pathname.startsWith("/admin") &&
    !ADMIN_AUTH_PATHS.some((path) => pathname.startsWith(path))
  );
}

function isCustomerProtectedPath(pathname: string) {
  return (
    CUSTOMER_PROTECTED_PREFIXES.some((path) => pathname.startsWith(path)) &&
    !CUSTOMER_AUTH_PATHS.some((path) => pathname.startsWith(path))
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const callbackUrl = `${pathname}${request.nextUrl.search}`;
  const isAuthOnly = AUTH_ONLY_PATHS.some((path) => pathname.startsWith(path));
  const isAdminAuthOnly = ADMIN_AUTH_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  const needsAdminAccess = isAdminPath(pathname);
  const needsAnySession = isCustomerProtectedPath(pathname);
  const requiresAuth = needsAdminAccess || needsAnySession;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  function redirectToLogin() {
    const url = request.nextUrl.clone();
    url.searchParams.set("callbackUrl", callbackUrl);
    url.pathname = needsAdminAccess ? "/admin/auth/sign-in" : "/compte/connexion";
    return NextResponse.redirect(url);
  }

  if (!sessionCookie) {
    if (requiresAuth) return redirectToLogin();
    return NextResponse.next();
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.session) {
      if (requiresAuth) return redirectToLogin();
      return NextResponse.next();
    }

    const sessionRole = (session.user as { role?: string } | undefined)?.role;

    if (needsAdminAccess && !STAFF_ROLES.includes(sessionRole as AppRole)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const roleProtectedRoute = ROLE_PROTECTED.find((route) =>
      pathname.startsWith(route.prefix),
    );
    if (roleProtectedRoute && sessionRole !== roleProtectedRoute.requiredRole) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (isAuthOnly) {
      const destination = isAdminAuthOnly ? "/admin" : "/compte";
      return NextResponse.redirect(new URL(destination, request.url));
    }
  } catch (error) {
    console.error(error);
    if (requiresAuth) return redirectToLogin();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
