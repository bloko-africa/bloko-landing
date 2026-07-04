"use client";

import { getCountryName, getFlagEmoji } from "@/lib/countries";
import countries from "i18n-iso-countries";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Sphere,
} from "react-simple-maps";

// TopoJSON basse resolution (110m) : suffisant pour un widget de dashboard,
// evite de charger la version haute definition (10m/50m) inutilement.
import worldTopoJson from "world-atlas/countries-110m.json";

type CountryStat = { code: string; count: number };
type Rotation = [number, number, number];

const AUTO_ROTATE_STEP = 0.15; // degres par tick (~20 fois/s)
const AUTO_ROTATE_INTERVAL = 50; // ms
const DRAG_SENSITIVITY = 0.35; // degres par pixel
const RESUME_AUTO_ROTATE_AFTER = 4000; // ms d'inactivite avant de reprendre la rotation auto

export function OrdersWorldMap({ stats }: { stats: CountryStat[] }) {
  const maxCount = Math.max(1, ...stats.map((s) => s.count));
  const countByNumericId = new Map(
    stats
      .map((s) => [countries.alpha2ToNumeric(s.code), s.count] as const)
      .filter((entry): entry is [string, number] => Boolean(entry[0])),
  );

  const [rotation, setRotation] = useState<Rotation>([-2, -8, 0]);
  const draggingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const resumeAtRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (draggingRef.current || Date.now() < resumeAtRef.current) return;
      setRotation(([lambda, phi, gamma]) => [lambda - AUTO_ROTATE_STEP, phi, gamma]);
    }, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(id);
  }, []);

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current || !lastPointerRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };

    setRotation(([lambda, phi, gamma]) => [
      lambda + dx * DRAG_SENSITIVITY,
      Math.max(-90, Math.min(90, phi - dy * DRAG_SENSITIVITY)),
      gamma,
    ]);
  }

  function handlePointerUp() {
    draggingRef.current = false;
    lastPointerRef.current = null;
    resumeAtRef.current = Date.now() + RESUME_AUTO_ROTATE_AFTER;
  }

  return (
    <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-[20rem_1fr]">
      <div
        className="mx-auto aspect-square w-full max-w-72 cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <ComposableMap
          projection="geoOrthographic"
          projectionConfig={{ scale: 160, rotate: rotation }}
          width={320}
          height={320}
          style={{ width: "100%", height: "100%" }}
        >
          <Sphere
            id="globe-sphere"
            fill="var(--color-gray-1)"
            stroke="var(--color-stroke)"
            strokeWidth={0.6}
            className="dark:fill-dark-2 dark:stroke-dark-3"
          />
          <Graticule
            stroke="var(--color-stroke)"
            strokeWidth={0.3}
            className="opacity-60 dark:stroke-dark-3"
          />
          <Geographies geography={worldTopoJson}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const count = countByNumericId.get(geo.id) ?? 0;
                const intensity = count > 0 ? 0.35 + (count / maxCount) * 0.65 : 0;

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
                    strokeWidth={0.4}
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
      </div>

      <ul className="w-full space-y-3">
        {stats.map((stat) => (
          <li key={stat.code} className="flex items-center gap-3">
            <span className="text-body-lg">{getFlagEmoji(stat.code)}</span>
            <span className="w-28 shrink-0 truncate text-body-sm text-dark dark:text-white">
              {getCountryName(stat.code)}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-2 dark:bg-dark-2">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(stat.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-body-xs text-dark-5 dark:text-dark-6">
              {stat.count}
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
