import { getBoutiqueByHandle } from "@/lib/boutique";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Mentions légales" };
export const dynamic = "force-dynamic";

export default async function MentionsLegalesPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const boutique = await getBoutiqueByHandle(handle);
  if (!boutique) notFound();

  return (
    <div className="mx-auto max-w-(--breakpoint-md) px-4 py-16">
      <h1 className="text-heading-5 font-medium text-dark dark:text-white">
        Mentions légales
      </h1>

      {boutique.legalMentions ? (
        <div
          className="rich-text mt-8 text-body-sm text-dark-5 dark:text-dark-6"
          dangerouslySetInnerHTML={{ __html: boutique.legalMentions }}
        />
      ) : (
        <p className="mt-8 text-body-sm text-dark-5 dark:text-dark-6">
          Mentions légales non renseignées pour cette boutique.
        </p>
      )}
    </div>
  );
}
