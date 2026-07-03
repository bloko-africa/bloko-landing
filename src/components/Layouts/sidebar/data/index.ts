import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
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
        title: "Pages",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Settings",
            url: "/admin/settings",
          },
        ],
      },
    ],
  },
];
