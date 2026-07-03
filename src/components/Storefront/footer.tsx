export function StorefrontFooter() {
  return (
    <footer className="border-t border-stroke bg-gray-1 dark:border-dark-3 dark:bg-dark-2">
      <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-10 md:px-8">
        <p className="text-heading-6 font-medium text-dark dark:text-white">
          Mode Shop
        </p>
        <p className="mt-2 max-w-md text-body-sm text-dark-5 dark:text-dark-6">
          Prêt-à-porter et accessoires, livrés depuis Cotonou et Abidjan.
        </p>

        <p className="mt-8 text-body-xs text-dark-5 dark:text-dark-6">
          © {new Date().getFullYear()} Mode Shop. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
