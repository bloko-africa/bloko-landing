import { auth } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/modules/authorization/permissions";
import { NextRequest, NextResponse } from "next/server";

const STAFF_ROLES: AppRole[] = ["viewer", "editor", "admin", "vendeur"];

const ADMIN_AUTH_PATHS = ["/2558588dca9a/auth/sign-in"];

// Compte acheteur, scopé par boutique : /b/<handle>/compte/**. Capture le
// handle pour rediriger vers la bonne connexion/inscription plutôt qu'une
// route plateforme générique qui n'existe pas.
const CUSTOMER_PATH_RE = /^\/b\/([^/]+)\/compte(\/|$)/;
const CUSTOMER_AUTH_PATH_RE = /^\/b\/[^/]+\/compte\/(connexion|inscription)(\/|$)/;

// Compte acheteur au niveau plateforme (pas rattaché à une boutique dans
// l'URL) : /compte liste les commandes toutes boutiques confondues,
// /connexion s'y connecte. Distinct de /b/<handle>/compte/connexion qui
// reste le point d'entrée depuis une boutique précise.
const PLATFORM_ACCOUNT_PATH_RE = /^\/compte(\/|$)/;
const PLATFORM_AUTH_PATH_RE = /^\/connexion(\/|$)/;

const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "development"
    ? "better-auth.session_token"
    : "__Secure-better-auth.session_token";

// /2558588dca9a/livraisons, /2558588dca9a/products, /2558588dca9a/orders, /2558588dca9a/collections
// restent ouverts a tout le staff (y compris vendeur) : le filtrage par
// boutique se fait au niveau requete via requireBoutiqueAccess(), pas ici.
const ROLE_PROTECTED: { prefix: string; requiredRoles: AppRole[] }[] = [
  { prefix: "/2558588dca9a/settings", requiredRoles: ["admin"] },
  { prefix: "/2558588dca9a/boutiques", requiredRoles: ["admin"] },
  { prefix: "/2558588dca9a/agences", requiredRoles: ["admin"] },
  { prefix: "/2558588dca9a/users", requiredRoles: ["admin"] },
];

function isAdminPath(pathname: string) {
  return (
    pathname.startsWith("/2558588dca9a") &&
    !ADMIN_AUTH_PATHS.some((path) => pathname.startsWith(path))
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const callbackUrl = `${pathname}${request.nextUrl.search}`;
  const isAdminAuthOnly = ADMIN_AUTH_PATHS.some((path) => pathname.startsWith(path));
  const customerMatch = pathname.match(CUSTOMER_PATH_RE);
  const isCustomerAuthOnly = CUSTOMER_AUTH_PATH_RE.test(pathname);
  const isPlatformAccount = PLATFORM_ACCOUNT_PATH_RE.test(pathname);
  const isPlatformAuthOnly = PLATFORM_AUTH_PATH_RE.test(pathname);
  const isAuthOnly = isAdminAuthOnly || isCustomerAuthOnly || isPlatformAuthOnly;

  const needsAdminAccess = isAdminPath(pathname);
  // Session requise sur /b/<handle>/compte/** et /compte, sauf les pages
  // connexion/inscription elles-mêmes (elles gèrent leur propre état "pas
  // encore connecté").
  const needsAnySession =
    (Boolean(customerMatch) && !isCustomerAuthOnly) ||
    (isPlatformAccount && !isPlatformAuthOnly);
  const requiresAuth = needsAdminAccess || needsAnySession;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  function redirectToLogin() {
    const url = request.nextUrl.clone();
    url.searchParams.set("callbackUrl", callbackUrl);
    if (needsAdminAccess) {
      url.pathname = "/2558588dca9a/auth/sign-in";
    } else if (customerMatch) {
      url.pathname = `/b/${customerMatch[1]}/compte/connexion`;
    } else {
      url.pathname = "/connexion";
    }
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
    if (
      roleProtectedRoute &&
      !roleProtectedRoute.requiredRoles.includes(sessionRole as AppRole)
    ) {
      return NextResponse.redirect(new URL("/2558588dca9a", request.url));
    }

    if (isAuthOnly) {
      const destination = isAdminAuthOnly
        ? "/2558588dca9a"
        : isPlatformAuthOnly
          ? "/compte"
          : `/b/${customerMatch ? customerMatch[1] : pathname.split("/")[2]}/compte`;
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
