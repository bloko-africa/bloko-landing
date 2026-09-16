import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bloko.me";

// Le chemin admin caché n'est PAS listé ici : robots.txt est un fichier
// public, y écrire le chemin reviendrait à l'annoncer à qui le lit — tout
// l'intérêt de l'avoir cache est qu'aucune page publique n'y pointe.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/b/*/compte", // espace acheteur, données privées
        "/b/*/panier",
        "/b/*/commande",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
