import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto max-w-(--breakpoint-sm) px-4 py-24 text-center">
      <h1 className="text-heading-5 font-medium text-dark dark:text-white">
        Merci pour ta commande !
      </h1>
      <p className="mt-4 text-body-sm text-dark-5 dark:text-dark-6">
        {order && <>Référence : {order}. </>}
        Ton paiement est en cours de confirmation — tu recevras une mise à
        jour dès qu'il sera validé.
      </p>

      <Link
        href="/compte"
        className="mt-8 inline-block rounded-full bg-primary px-8 py-3 font-medium text-white hover:bg-opacity-90"
      >
        Voir mes commandes
      </Link>
    </div>
  );
}
