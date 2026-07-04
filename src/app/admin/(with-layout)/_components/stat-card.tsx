import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>

      <div>
        <p className="text-heading-6 font-semibold text-dark dark:text-white">
          {value}
        </p>
        <p className="mt-1 text-body-sm text-dark-5 dark:text-dark-6">{label}</p>
        {hint && (
          <p className="mt-1 text-body-xs text-dark-5 dark:text-dark-6">{hint}</p>
        )}
      </div>
    </div>
  );
}
