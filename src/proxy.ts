import { auth } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/modules/authorization/permissions";
import { ADMIN_BASE, VENDOR_BASE } from "@/lib/dashboard-space";
import { NextRequest, NextResponse } from "next/server";

// Deux dashboards séparés depuis la scission des espaces URL : le staff
// plateforme (viewer/editor/admin) reste sur /2558588dca9a, la vendeuse a
// désormais son propre espace /ma-boutique — "vendeur" n'est plus autorisé
// sous /2558588dca9a, ni l'inverse pour le staff sous /ma-boutique.
const ADMIN_STAFF_ROLES: AppRole[] = ["viewer", "editor", "admin"];
const VENDOR_ROLES: AppRole[] = ["vendeur"];

const ADMIN_AUTH_PATHS = [`${ADMIN_BASE}/auth/sign-in`];

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
// restent ouverts a tout le staff : le filtrage par boutique se fait au
// niveau requete via requireBoutiqueAccess(), pas ici.
const ROLE_PROTECTED: { prefix: string; requiredRoles: AppRole[] }[] = [
  { prefix: `${ADMIN_BASE}/settings`, requiredRoles: ["admin"] },
  { prefix: `${ADMIN_BASE}/boutiques`, requiredRoles: ["admin"] },
  { prefix: `${ADMIN_BASE}/agences`, requiredRoles: ["admin"] },
  { prefix: `${ADMIN_BASE}/users`, requiredRoles: ["admin"] },
];

function isAdminPath(pathname: string) {
  return (
    pathname.startsWith(ADMIN_BASE) &&
    !ADMIN_AUTH_PATHS.some((path) => pathname.startsWith(path))
  );
}

function isVendorPath(pathname: string) {
  return pathname.startsWith(VENDOR_BASE);
}

// Une vendeuse sur une URL admin (vieux lien email/notif, bookmark) ou un
// staff sur une URL vendeuse est renvoyé vers son propre espace, AU MÊME
// CHEMIN plutôt qu'à la racine — ça auto-répare les liens existants
// (ex: /2558588dca9a/orders/abc envoyé par email à une vendeuse) sans avoir
// à traquer chaque générateur de lien un par un.
function swapDashboardBase(pathname: string, from: string, to: string) {
  return to + pathname.slice(from.length);
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
  const needsVendorAccess = isVendorPath(pathname);
  // Session requise sur /b/<handle>/compte/** et /compte, sauf les pages
  // connexion/inscription elles-mêmes (elles gèrent leur propre état "pas
  // encore connecté").
  const needsAnySession =
    (Boolean(customerMatch) && !isCustomerAuthOnly) ||
    (isPlatformAccount && !isPlatformAuthOnly);
  const requiresAuth = needsAdminAccess || needsVendorAccess || needsAnySession;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  function redirectToLogin() {
    const url = request.nextUrl.clone();
    url.searchParams.set("callbackUrl", callbackUrl);
    if (needsAdminAccess || needsVendorAccess) {
      // Un seul point de connexion partagé — la redirection post-connexion
      // (côté client, voir AccessForm) envoie ensuite vers le bon espace
      // selon le rôle réel une fois la session connue.
      url.pathname = `${ADMIN_BASE}/auth/sign-in`;
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

    const sessionRole = (session.user as { role?: string } | undefined)?.role as
      | AppRole
      | undefined;

    if (needsAdminAccess && !ADMIN_STAFF_ROLES.includes(sessionRole as AppRole)) {
      // Une vendeuse sur une URL admin est renvoyée vers l'équivalent dans
      // son propre espace (chemin préservé) ; tout autre rôle (client,
      // session invalide) n'a nulle part où aller côté dashboard.
      if (sessionRole === "vendeur") {
        return NextResponse.redirect(
          new URL(swapDashboardBase(pathname, ADMIN_BASE, VENDOR_BASE), request.url),
        );
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (needsVendorAccess && !VENDOR_ROLES.includes(sessionRole as AppRole)) {
      if (sessionRole && ADMIN_STAFF_ROLES.includes(sessionRole)) {
        return NextResponse.redirect(
          new URL(swapDashboardBase(pathname, VENDOR_BASE, ADMIN_BASE), request.url),
        );
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    const roleProtectedRoute = ROLE_PROTECTED.find((route) =>
      pathname.startsWith(route.prefix),
    );
    if (
      roleProtectedRoute &&
      !roleProtectedRoute.requiredRoles.includes(sessionRole as AppRole)
    ) {
      return NextResponse.redirect(new URL(ADMIN_BASE, request.url));
    }

    if (isAuthOnly) {
      const destination = isAdminAuthOnly
        ? sessionRole === "vendeur"
          ? VENDOR_BASE
          : ADMIN_BASE
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
