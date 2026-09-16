"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const INTERVAL_MS = 5000;

/**
 * Fond du hero plateforme : plusieurs photos qui défilent en fondu-enchaîné.
 * Toutes superposées en permanence (pas de montage/démontage), seule
 * l'opacité change — évite tout flash blanc entre deux images.
 */
export function HeroCarousel({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % images.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          className="object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === active ? 1 : 0 }}
          sizes="100vw"
        />
      ))}
    </>
  );
}
