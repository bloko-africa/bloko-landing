export default function PlatformLoading() {
  return (
    <div className="mx-auto flex max-w-(--breakpoint-md) animate-pulse flex-col items-center px-4 py-20">
      <div className="h-4 w-40 rounded bg-gray-2 dark:bg-dark-2" />
      <div className="mt-4 h-12 w-72 rounded bg-gray-2 dark:bg-dark-2" />
      <div className="mt-10 h-16 w-full rounded-2xl bg-gray-2 dark:bg-dark-2" />
    </div>
  );
}
