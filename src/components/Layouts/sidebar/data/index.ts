import * as Icons from "../icons";
import type { AppRole } from "@/lib/auth/modules/authorization/permissions";

// `roles` restreint un item (et son sous-menu) à certains rôles — absent =
// visible par tout le staff (viewer/editor/admin/vendeur). Filtré dans
// Sidebar via le rôle de la session courante.
export const NAV_DATA: {
  label: string;
  items: {
    title: string;
    url?: string;
    icon: (props: { className?: string }) => React.ReactElement;
    roles?: AppRole[];
    items: { title: string; url: string; roles?: AppRole[] }[];
  }[];
}[] = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Tableau de bord",
        url: "/2558588dca9a",
        icon: Icons.HomeIcon,
        items: [],
      },
      // Ex-groupe unique "Boutique" (10 items à plat) éclaté en 3 groupes
      // qui suivent le modèle mental de la vendeuse — "je vends" / "je
      // livre et je suis payée" / "je réponds à mes clientes" — plutôt
      // qu'une liste technique. Même structure de données que "Plateforme"
      // ci-dessous, juste plus de groupes.
      {
        title: "Vendre",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Produits",
            url: "/2558588dca9a/products",
          },
          {
            title: "Collections",
            url: "/2558588dca9a/collections",
          },
          {
            title: "Catégories",
            url: "/2558588dca9a/categories",
          },
          {
            title: "Live",
            url: "/2558588dca9a/live",
          },
        ],
      },
      {
        title: "Commandes",
        icon: Icons.Table,
        items: [
          {
            title: "Commandes",
            url: "/2558588dca9a/orders",
          },
          {
            title: "Livraisons",
            url: "/2558588dca9a/livraisons",
          },
          {
            title: "Portefeuille",
            url: "/2558588dca9a/wallet",
          },
        ],
      },
      {
        title: "Relation client",
        icon: Icons.User,
        items: [
          {
            title: "SAV",
            url: "/2558588dca9a/support",
          },
          {
            title: "Clients",
            url: "/2558588dca9a/clients",
          },
          {
            title: "Mes coordonnées",
            url: "/2558588dca9a/contact-sav",
            roles: ["vendeur"],
          },
        ],
      },
      {
        title: "Plateforme",
        icon: Icons.Authentication,
        roles: ["admin"],
        items: [
          {
            title: "Boutiques",
            url: "/2558588dca9a/boutiques",
          },
          {
            title: "Équipe",
            url: "/2558588dca9a/users",
          },
          {
            title: "Agences de livraison",
            url: "/2558588dca9a/agences",
          },
        ],
      },
      {
        title: "Paramètres",
        url: "/2558588dca9a/settings",
        icon: Icons.Alphabet,
        roles: ["admin"],
        items: [],
      },
    ],
  },
];
