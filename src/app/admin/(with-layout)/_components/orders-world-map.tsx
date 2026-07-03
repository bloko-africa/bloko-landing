"use client";

import { getCountryName } from "@/lib/countries";
import countries from "i18n-iso-countries";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// TopoJSON basse resolution (110m) : suffisant pour un widget de dashboard,
// evite de charger la version haute definition (10m/50m) inutilement.
import worldTopoJson from "world-atlas/countries-110m.json";

type CountryStat = { code: string; count: number };

export function OrdersWorldMap({ stats }: { stats: CountryStat[] }) {
  const maxCount = Math.max(1, ...stats.map((s) => s.count));
  const countByNumericId = new Map(
    stats
      .map((s) => [countries.alpha2ToNumeric(s.code), s.count] as const)
      .filter((entry): entry is [string, number] => Boolean(entry[0])),
  );

  return (
    <div className="w-full">
      <ComposableMap
        projectionConfig={{ scale: 140 }}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={worldTopoJson}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const count = countByNumericId.get(geo.id) ?? 0;
              const intensity = count > 0 ? 0.25 + (count / maxCount) * 0.75 : 0;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={
                    count > 0
                      ? `rgba(166, 124, 82, ${intensity})`
                      : "var(--color-gray-3)"
                  }
                  stroke="var(--color-stroke)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "var(--color-primary)" },
                    pressed: { outline: "none" },
                  }}
                >
                  <title>
                    {geo.properties?.name ?? "?"}
                    {count > 0 ? ` — ${count} commande(s)` : ""}
                  </title>
                </Geography>
              );
            })
          }
        </Geographies>
      </ComposableMap>

      <ul className="mt-4 space-y-2">
        {stats.map((stat) => (
          <li
            key={stat.code}
            className="flex items-center justify-between text-body-sm"
          >
            <span className="text-dark dark:text-white">
              {getCountryName(stat.code)}
            </span>
            <span className="text-dark-5 dark:text-dark-6">
              {stat.count} commande{stat.count > 1 ? "s" : ""}
            </span>
          </li>
        ))}

        {stats.length === 0 && (
          <li className="text-center text-body-sm text-dark-5 dark:text-dark-6">
            Aucune commande pour le moment.
          </li>
        )}
      </ul>
    </div>
  );
}
