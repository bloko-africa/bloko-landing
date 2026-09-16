export default function SupportDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-180 animate-pulse space-y-8">
      <div className="h-7 w-56 rounded bg-gray-2 dark:bg-dark-2" />

      <div className="rounded-[10px] bg-white p-6.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-10 rounded bg-gray-2 dark:bg-dark-2" />
          <div className="h-10 rounded bg-gray-2 dark:bg-dark-2" />
        </div>
      </div>

      <div className="space-y-4 rounded-[10px] bg-white p-6.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-gray-2 dark:bg-dark-2" />
        ))}
      </div>

      <div className="h-48 rounded-[10px] bg-white p-6.5 shadow-1 dark:bg-gray-dark dark:shadow-card" />
    </div>
  );
}
