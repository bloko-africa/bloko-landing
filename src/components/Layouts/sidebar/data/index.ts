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
      {
        title: "Boutique",
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
            title: "Commandes",
            url: "/2558588dca9a/orders",
          },
          {
            title: "Livraisons",
            url: "/2558588dca9a/livraisons",
          },
          {
            title: "SAV",
            url: "/2558588dca9a/support",
          },
          {
            title: "Contact & SAV (ma boutique)",
            url: "/2558588dca9a/contact-sav",
            roles: ["vendeur"],
          },
          {
            title: "Portefeuille",
            url: "/2558588dca9a/wallet",
          },
          {
            title: "Clients",
            url: "/2558588dca9a/clients",
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
