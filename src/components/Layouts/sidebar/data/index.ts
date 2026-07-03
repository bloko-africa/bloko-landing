import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Tableau de bord",
        url: "/admin",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Boutique",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Produits",
            url: "/admin/products",
          },
          {
            title: "Collections",
            url: "/admin/collections",
          },
          {
            title: "Catégories",
            url: "/admin/categories",
          },
          {
            title: "Commandes",
            url: "/admin/orders",
          },
        ],
      },
      {
        title: "Paramètres",
        url: "/admin/settings",
        icon: Icons.Alphabet,
        items: [],
      },
    ],
  },
];
