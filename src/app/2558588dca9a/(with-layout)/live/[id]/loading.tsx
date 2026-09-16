export default function LiveDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-180 animate-pulse space-y-8">
      <div className="h-7 w-40 rounded bg-gray-2 dark:bg-dark-2" />

      <div className="rounded-[10px] bg-white p-6.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-8 w-32 rounded bg-gray-2 dark:bg-dark-2" />
            <div className="h-3 w-56 rounded bg-gray-2 dark:bg-dark-2" />
          </div>
          <div className="h-10 w-36 rounded-lg bg-gray-2 dark:bg-dark-2" />
        </div>
      </div>

      <div className="rounded-[10px] bg-white p-6.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-2 dark:bg-dark-2" />
          ))}
        </div>
      </div>
    </div>
  );
}
