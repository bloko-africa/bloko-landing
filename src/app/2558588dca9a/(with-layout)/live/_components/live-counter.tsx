"use client";

import { useEffect, useState } from "react";

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function LiveCounter({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(() =>
    Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-red opacity-75" />
        <span className="relative inline-flex size-2.5 rounded-full bg-red" />
      </span>
      <p className="text-heading-6 font-bold tabular-nums text-dark dark:text-white">
        {formatDuration(elapsed)}
      </p>
    </div>
  );
}
