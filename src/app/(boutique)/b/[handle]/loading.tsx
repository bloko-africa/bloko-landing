export default function BoutiqueLoading() {
  return (
    <div className="mx-auto max-w-(--breakpoint-2xl) animate-pulse px-4 py-10 md:px-8">
      <div className="mb-8 h-8 w-56 rounded bg-gray-2 dark:bg-dark-2" />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square rounded-xl bg-gray-2 dark:bg-dark-2" />
            <div className="h-3 w-3/4 rounded bg-gray-2 dark:bg-dark-2" />
            <div className="h-3 w-1/3 rounded bg-gray-2 dark:bg-dark-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
