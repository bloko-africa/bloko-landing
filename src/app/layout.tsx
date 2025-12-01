import { IBM_Plex_Sans } from "next/font/google";
import localFont from "next/font/local";
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
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
