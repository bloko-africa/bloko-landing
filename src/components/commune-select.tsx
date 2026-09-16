"use client";

import { getCommuneList } from "@/lib/benin-communes";
import { useId, useMemo, useState } from "react";

type CommuneSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  className?: string;
};

const OTHER_VALUE = "__autre__";

// Sélecteur de ville pour le Bénin (77 communes, voir src/lib/benin-communes.ts),
// avec une échappatoire en saisie libre — utile pour une ville hors Bénin
// (ex: Abidjan, marché secondaire confirmé) ou une entrée non listée.
export function CommuneSelect({ label, value, onChange, name, className }: CommuneSelectProps) {
  const id = useId();
  const communes = useMemo(() => getCommuneList(), []);
  const isKnownCommune = communes.some((c) => c.commune === value);
  const [customMode, setCustomMode] = useState(value !== "" && !isKnownCommune);

  const departements = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const { commune, departement } of communes) {
      if (!map.has(departement)) map.set(departement, []);
      map.get(departement)!.push(commune);
    }
    return map;
  }, [communes]);

  if (customMode) {
    return (
      <div className={className}>
        <label htmlFor={id} className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
          {label}
        </label>
        <div className="flex gap-2">
          <input
            id={id}
            name={name}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Nom de la ville"
            className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          />
          <button
            type="button"
            onClick={() => {
              setCustomMode(false);
              onChange("");
            }}
            className="shrink-0 rounded-lg border border-stroke px-4 text-body-sm text-dark-5 hover:border-primary hover:text-primary dark:border-dark-3 dark:text-dark-6"
          >
            Liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={isKnownCommune ? value : ""}
        onChange={(e) => {
          if (e.target.value === OTHER_VALUE) {
            setCustomMode(true);
            onChange("");
          } else {
            onChange(e.target.value);
          }
        }}
        className="w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
      >
        <option value="" disabled>
          Choisir une ville
        </option>
        {[...departements.entries()].map(([departement, list]) => (
          <optgroup key={departement} label={departement}>
            {list.map((commune) => (
              <option key={commune} value={commune}>
                {commune}
              </option>
            ))}
          </optgroup>
        ))}
        <option value={OTHER_VALUE}>Autre (hors Bénin, ou non listée)</option>
      </select>
    </div>
  );
}
