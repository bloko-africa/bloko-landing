import { getStoreSettings } from "@/lib/store-settings";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conditions générales de vente" };
export const dynamic = "force-dynamic";

export default async function CgvPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-(--breakpoint-md) px-4 py-16">
      <h1 className="text-heading-5 font-medium text-dark dark:text-white">
        Conditions générales de vente
      </h1>

      <div
        className="rich-text mt-8 text-body-sm text-dark-5 dark:text-dark-6"
        dangerouslySetInnerHTML={{ __html: settings.cgvContent }}
      />
    </div>
  );
}
