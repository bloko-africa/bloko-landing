"use client";

import dynamic from "next/dynamic";

const OrdersWorldMap = dynamic(
  () => import("./orders-world-map").then((m) => m.OrdersWorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 items-center justify-center text-body-sm text-dark-5 dark:text-dark-6">
        Chargement du globe...
      </div>
    ),
  },
);

export { OrdersWorldMap };
