export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <p className="text-body-sm text-dark-5 dark:text-dark-6">{label}</p>
      <p className="mt-2 text-heading-5 font-medium text-dark dark:text-white">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-body-xs text-dark-5 dark:text-dark-6">{hint}</p>
      )}
    </div>
  );
}
