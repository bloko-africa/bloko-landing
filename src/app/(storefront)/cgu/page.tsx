import { PLATFORM_CGU } from "@/lib/legal-content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conditions générales d'utilisation" };

export default function PlatformCguPage() {
  return (
    <div className="mx-auto max-w-(--breakpoint-md) px-4 py-16">
      <h1 className="text-heading-5 font-medium text-dark dark:text-white">
        Conditions générales d&apos;utilisation
      </h1>
      <div
        className="rich-text mt-8 text-body-sm text-dark-5 dark:text-dark-6"
        dangerouslySetInnerHTML={{ __html: PLATFORM_CGU }}
      />
    </div>
  );
}
