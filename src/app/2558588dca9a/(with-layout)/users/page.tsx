import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { EmptyState } from "@/components/Admin/empty-state";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { USER_ROLE_LABEL } from "@/lib/user-role";
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { BanUserButton } from "./_components/ban-user-button";
import { RoleSelectForm } from "./_components/role-select-form";

export const metadata: Metadata = { title: "Équipe" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean | null;
  boutiqueId: string | null;
  createdAt: Date;
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { users, total } = await auth.api.listUsers({
    query: q
      ? {
          searchValue: q,
          searchField: "email",
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
          sortBy: "createdAt",
          sortDirection: "desc",
        }
      : {
          filterField: "role",
          filterOperator: "ne",
          filterValue: "customer",
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
          sortBy: "createdAt",
          sortDirection: "desc",
        },
    headers: await headers(),
  });

  const staffUsers = users as unknown as StaffUser[];
  const boutiqueIds = staffUsers.map((u) => u.boutiqueId).filter((id): id is string => Boolean(id));
  const boutiques =
    boutiqueIds.length > 0
      ? await db.boutique.findMany({
          where: { id: { in: boutiqueIds } },
          select: { id: true, displayName: true },
        })
      : [];
  const boutiqueNameById = new Map(boutiques.map((b) => [b.id, b.displayName]));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `/2558588dca9a/users?${query}` : "/2558588dca9a/users";
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Breadcrumb pageName="Équipe" />
        <Link
          href="/2558588dca9a/users/new"
          className="rounded-lg bg-primary px-4 py-2 text-body-sm font-medium text-white hover:bg-opacity-90"
        >
          Nouveau compte staff
        </Link>
      </div>

      <form className="mb-5">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher par email (tous comptes, y compris clientes)"
          className="w-full max-w-md rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-body-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
        />
      </form>

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-stroke text-left dark:border-dark-3">
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">Nom</th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">Email</th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">Rôle</th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">Boutique</th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">Statut</th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">Créé le</th>
              <th className="px-5.5 py-4 font-medium text-dark dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffUsers.map((user) => (
              <tr key={user.id} className="border-b border-stroke last:border-0 hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2">
                <td className="px-5.5 py-4 font-medium text-dark dark:text-white">{user.name}</td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">{user.email}</td>
                <td className="px-5.5 py-4">
                  {user.role === "vendeur" ? (
                    <span className="text-body-sm text-dark-5 dark:text-dark-6">
                      {USER_ROLE_LABEL.vendeur}
                    </span>
                  ) : (
                    <RoleSelectForm userId={user.id} currentRole={user.role ?? "viewer"} />
                  )}
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {user.boutiqueId ? (
                    <Link
                      href={`/2558588dca9a/boutiques/${user.boutiqueId}`}
                      className="text-primary hover:underline"
                    >
                      {boutiqueNameById.get(user.boutiqueId) ?? "—"}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5.5 py-4">
                  {user.banned ? (
                    <span className="rounded-full bg-red-light-6 px-3 py-1 text-body-xs font-medium text-red-dark">
                      Banni
                    </span>
                  ) : (
                    <span className="text-body-sm text-dark-5 dark:text-dark-6">Actif</span>
                  )}
                </td>
                <td className="px-5.5 py-4 text-dark-5 dark:text-dark-6">
                  {user.createdAt.toLocaleDateString("fr-FR")}
                </td>
                <td className="px-5.5 py-4">
                  <BanUserButton userId={user.id} banned={Boolean(user.banned)} />
                </td>
              </tr>
            ))}

            {staffUsers.length === 0 && (
              <tr>
                <td colSpan={7}>
                  {q ? (
                    <EmptyState
                      title="Aucun compte ne correspond"
                      hint={`Aucun résultat pour "${q}" — vérifie l'orthographe de l'email.`}
                    />
                  ) : (
                    <EmptyState
                      title="Aucun compte staff pour le moment"
                      hint="Le premier compte admin a été créé par script au démarrage — les suivants se créent ici."
                      action={
                        <Link
                          href="/2558588dca9a/users/new"
                          className="text-body-sm font-medium text-primary hover:underline"
                        >
                          Nouveau compte staff →
                        </Link>
                      }
                    />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2">
          <Link
            href={pageHref(Math.max(1, page - 1))}
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
            href={pageHref(Math.min(totalPages, page + 1))}
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
  );
}
