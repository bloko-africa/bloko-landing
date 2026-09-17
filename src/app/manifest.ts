import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bloko",
    short_name: "Bloko",
    description: "Le marché des boutiques TikTok.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#141414",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
