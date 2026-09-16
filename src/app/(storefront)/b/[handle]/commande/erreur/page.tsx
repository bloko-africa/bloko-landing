import Link from "next/link";

export default async function CheckoutErrorPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { handle } = await params;
  const { order } = await searchParams;

  return (
    <div className="mx-auto max-w-(--breakpoint-sm) px-4 py-24 text-center">
      <h1 className="text-heading-5 font-medium text-dark dark:text-white">
        Le paiement n'a pas abouti
      </h1>
      <p className="mt-4 text-body-sm text-dark-5 dark:text-dark-6">
        {order && <>Référence : {order}. </>}
        Aucun montant n'a été débité. Tu peux réessayer depuis la boutique.
      </p>

      <Link
        href={`/b/${handle}/produits`}
        className="mt-8 inline-block bg-dark px-8 py-3 font-medium uppercase tracking-wide text-white hover:bg-opacity-90 dark:bg-white dark:text-dark"
      >
        Retour à la boutique
      </Link>
    </div>
  );
}
