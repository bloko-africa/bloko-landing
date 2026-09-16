import { db } from "@/lib/db";
import { getBoutiqueByHandle } from "@/lib/boutique";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Collections" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function CollectionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { handle } = await params;
  const boutique = await getBoutiqueByHandle(handle);
  if (!boutique) notFound();

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const base = `/b/${boutique.handle}`;

  const [totalCount, collections] = await Promise.all([
    db.collection.count({ where: { boutiqueId: boutique.id, isActive: true } }),
    db.collection.findMany({
      where: { boutiqueId: boutique.id, isActive: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-12 md:px-8">
      <h1 className="text-heading-5 font-bold uppercase tracking-tight text-dark dark:text-white">
        Collections
      </h1>

      {collections.length === 0 ? (
        <p className="mt-12 text-body-sm text-dark-5 dark:text-dark-6">
          Aucune collection pour le moment.
        </p>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`${base}/produits?collection=${collection.slug}`}
                className="group block"
              >
                <div className="relative aspect-4/5 overflow-hidden bg-gray-2 dark:bg-dark-2">
                  {collection.coverImage && (
                    <Image
                      src={collection.coverImage}
                      alt=""
                      fill
                      className="object-cover grayscale-[15%] transition group-hover:grayscale-0"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  )}
                </div>
                <p className="mt-4 text-body-lg font-bold uppercase tracking-wide text-dark dark:text-white">
                  {collection.name}
                </p>
                {collection.description && (
                  <p className="mt-1 text-body-sm text-dark-5 dark:text-dark-6">
                    {collection.description}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2">
              <Link
                href={page > 1 ? `${base}/collections?page=${page - 1}` : `${base}/collections`}
                aria-disabled={page === 1}
                className={
                  page === 1
                    ? "pointer-events-none rounded-full border border-stroke px-4 py-2 text-body-sm text-dark-5 opacity-40 dark:border-dark-3 dark:text-dark-6"
                    : "rounded-full border border-stroke px-4 py-2 text-body-sm text-dark-5 hover:border-primary hover:text-primary dark:border-dark-3 dark:text-dark-6"
                }
              >
                Précédent
              </Link>

              <span className="text-body-sm text-dark-5 dark:text-dark-6">
                Page {page} / {totalPages}
              </span>

              <Link
                href={`${base}/collections?page=${Math.min(totalPages, page + 1)}`}
                aria-disabled={page === totalPages}
                className={
                  page === totalPages
                    ? "pointer-events-none rounded-full border border-stroke px-4 py-2 text-body-sm text-dark-5 opacity-40 dark:border-dark-3 dark:text-dark-6"
                    : "rounded-full border border-stroke px-4 py-2 text-body-sm text-dark-5 hover:border-primary hover:text-primary dark:border-dark-3 dark:text-dark-6"
                }
              >
                Suivant
              </Link>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
