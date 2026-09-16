"use client";

import { useParams } from "next/navigation";

/**
 * Handle de la boutique courante, lu depuis le segment dynamique
 * `/b/[handle]/**` de l'URL — pas besoin de prop-drilling depuis chaque
 * page serveur, ce hook marche dans n'importe quel composant client sous
 * ce layout.
 */
export function useBoutiqueHandle(): string {
  const params = useParams<{ handle: string }>();
  const handle = params?.handle;
  if (!handle) {
    throw new Error("useBoutiqueHandle() doit être utilisé sous /b/[handle].");
  }
  return handle;
}

/** Préfixe `path` (qui commence par "/") du handle de la boutique courante. */
export function useBoutiquePath(path: string): string {
  const handle = useBoutiqueHandle();
  return `/b/${handle}${path}`;
}
