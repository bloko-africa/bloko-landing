import { AccessForm } from "@/components/Auth/AccessForm";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Connexion" };

export default function PlatformConnexionPage() {
  return (
    <div className="mx-auto max-w-105 px-4 py-16">
      <h1 className="text-heading-6 font-bold uppercase tracking-tight text-dark dark:text-white">
        Connexion
      </h1>
      <p className="mt-2 text-body-sm text-dark-5 dark:text-dark-6">
        Un seul compte pour toutes les boutiques Bloko — retrouve tes
        commandes où que tu aies acheté.
      </p>

      <div className="mt-8">
        <Suspense>
          <AccessForm callbackURL="/compte" />
        </Suspense>
      </div>
    </div>
  );
}
