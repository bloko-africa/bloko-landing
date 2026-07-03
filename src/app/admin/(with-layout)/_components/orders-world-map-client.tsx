"use client";

import dynamic from "next/dynamic";

const OrdersWorldMap = dynamic(
  () => import("./orders-world-map").then((m) => m.OrdersWorldMap),
  { ssr: false },
);

export { OrdersWorldMap };
