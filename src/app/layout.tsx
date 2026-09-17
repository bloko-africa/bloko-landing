import "@/css/style.css";

import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Toaster } from "sonner";
import { InstallPrompt } from "@/components/install-prompt";
import { Providers } from "./providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Bloko",
    default: "Bloko",
  },
  description: "Le marché des boutiques TikTok.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bloko",
  },
};

export const viewport: Viewport = {
  themeColor: "#141414",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="fr" suppressHydrationWarning className={poppins.variable}>
      <body>
        <Providers>
          <NextTopLoader color="#141414" showSpinner={false} />

          {children}

          <InstallPrompt />

          <Toaster
            position="bottom-right"
            richColors
            closeButton
            duration={5000}
            toastOptions={{
              className: "dark:bg-gray-dark dark:border-dark-3 dark:text-white",
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
