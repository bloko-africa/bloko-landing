export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 w-48 rounded bg-gray-2 dark:bg-dark-2" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-[10px] bg-gray-2 dark:bg-dark-2" />
        ))}
      </div>
      <div className="h-64 rounded-[10px] bg-gray-2 dark:bg-dark-2" />
    </div>
  );
}
