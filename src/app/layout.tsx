import { IBM_Plex_Sans } from "next/font/google";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import type { Metadata } from "next";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex",
});

const eastmanBold = localFont({
  src: "../../public/fonts/EastmanAlternateBold.otf",
  variable: "--font-heading",
  weight: "700",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bloko - Paiements en ligne sécurisés en Afrique",
    template: "%s | Bloko",
  },
  description:
    "Achetez et vendez en toute confiance avec Bloko. Infrastructure de paiement escrow pour l'Afrique. Protégez vos transactions, éliminez la fraude, payez en toute sécurité.",
  keywords: [
    "paiement sécurisé Afrique",
    "escrow Bénin",
    "achat en ligne sécurisé",
    "paiement mobile Afrique",
    "Bloko",
    "e-commerce Afrique",
    "FedaPay",
    "transaction sécurisée",
    "plateforme de confiance",
    "paiement escrow",
  ],

  authors: [{ name: "Bloko" }],
  creator: "Bloko",
  publisher: "Bloko",
  metadataBase: new URL("https://www.bloko.me"),

  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.bloko.me",
    title: "Bloko - Paiements en ligne sécurisés en Afrique",
    description:
      "Achetez et vendez en toute confiance avec Bloko. Infrastructure de paiement escrow pour l'Afrique.",
    siteName: "Bloko",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bloko - Paiements sécurisés",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Bloko - Paiements en ligne sécurisés en Afrique",
    description:
      "Achetez et vendez en toute confiance avec Bloko. Infrastructure de paiement escrow pour l'Afrique.",
    creator: "@bloko",
    images: ["/twitter-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [{ url: "/favicon.ico" }],
  },

  verification: {
    google: "google2726843557cbb860",
  },

  category: "technology",
  alternates: {
    canonical: "https://www.bloko.me",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${ibmPlexSans.variable} ${eastmanBold.variable}`}
    >
      <head>
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Bloko",
              url: "https://www.bloko.me",
              description:
                "Infrastructure de paiement escrow pour l'Afrique. Achetez et vendez en toute confiance.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
              },
              areaServed: {
                "@type": "Place",
                name: "Africa",
              },
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
