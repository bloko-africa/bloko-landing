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
            url: "/shop/products",
          },
          {
            title: "Collections",
            url: "/shop/collections",
          },
          {
            title: "Catégories",
            url: "/shop/categories",
          },
          {
            title: "Commandes",
            url: "/shop/orders",
          },
        ],
      },
      {
        title: "Profile",
        url: "/profile",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Pages",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Settings",
            url: "/pages/settings",
          },
        ],
      },
    ],
  },
];
