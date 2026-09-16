"use client";

import { AccessForm } from "@/components/Auth/AccessForm";
import { useBoutiquePath } from "@/lib/boutique-path";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionContent />
    </Suspense>
  );
}

function ConnexionContent() {
  const comptePath = useBoutiquePath("/compte");
  const inscriptionPath = useBoutiquePath("/compte/inscription");

  return (
    <div className="mx-auto max-w-105 px-4 py-10">
      <div className="relative mb-8 aspect-[16/7] overflow-hidden rounded-2xl bg-dark">
        <Image
          src="/hero/hero-live-selling.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="420px"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <h1 className="text-heading-6 font-bold uppercase tracking-tight text-dark dark:text-white">
        Connexion
      </h1>

      <div className="mt-8">
        <AccessForm callbackURL={comptePath} />
      </div>

      <p className="mt-6 text-center text-body-sm text-dark-5 dark:text-dark-6">
        Pas encore de compte ?{" "}
        <Link href={inscriptionPath} className="font-medium text-primary">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
