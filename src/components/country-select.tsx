"use client";

import { getCountryList, getFlagEmoji } from "@/lib/countries";
import { useId, useMemo } from "react";

type CountrySelectProps = {
  label: string;
  value: string;
  onChange: (code: string) => void;
  name?: string;
  className?: string;
};

export function CountrySelect({
  label,
  value,
  onChange,
  name,
  className,
}: CountrySelectProps) {
  const id = useId();
  const countryList = useMemo(() => getCountryList(), []);

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-3 block text-body-sm font-medium text-dark dark:text-white"
      >
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
      >
        {countryList.map((country) => (
          <option key={country.code} value={country.code}>
            {getFlagEmoji(country.code)} {country.name}
          </option>
        ))}
      </select>
    </div>
  );
}
