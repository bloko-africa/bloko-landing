import Signin from "@/components/Auth/Signin";
import { Logo } from "@/components/logo";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <div className="flex min-h-screen flex-wrap items-center">
      <div className="w-full xl:w-1/2">
        <div className="mx-auto w-[570px] p-4 sm:p-12.5 xl:p-15">
          <Signin />
        </div>
      </div>

      <div className="hidden w-full p-6 xl:block xl:w-1/2">
        <div className="relative isolate flex min-h-[560px] flex-col overflow-hidden rounded-2xl bg-dark px-15 pt-12.5">
          <Image
            src="/hero/hero-live-selling-2.jpg"
            alt=""
            fill
            className="-z-10 object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 -z-10 bg-black/70" />

          <Link className="mb-10 inline-block" href="/2558588dca9a">
            <Logo />
          </Link>
          <p className="mb-3 text-xl font-medium text-white">
            Espace boutique
          </p>

          <h1 className="mb-4 text-2xl font-bold text-white sm:text-heading-3">
            Content de te revoir
          </h1>

          <p className="w-full max-w-[375px] font-medium text-dark-7">
            Connecte-toi pour gérer tes commandes, tes livraisons et ton
            catalogue.
          </p>
        </div>
      </div>
    </div>
  );
}
