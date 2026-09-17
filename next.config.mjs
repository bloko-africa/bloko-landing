/** @type {import("next").NextConfig} */
const nextConfig = {
  // sharp est une dépendance native (binaire .node) — la laisser bundlée
  // par Turbopack casse son chargement en prod (dlopen échoue sur le
  // binaire linux-x64 alors que le build réussit sans erreur), sur
  // /products, /agences et toute page qui importe transitivement
  // upload-product-image.ts. En la déclarant ici, Next la résout
  // directement depuis node_modules au runtime au lieu de la tracer.
  serverExternalPackages: ["sharp"],
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: ""
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev",
        port: ""
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
        port: ""
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: ""
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
        port: ""
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: ""
      }
    ]
  }
};

export default nextConfig;
