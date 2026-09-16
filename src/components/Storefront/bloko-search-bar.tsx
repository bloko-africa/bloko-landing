"use client";

import { searchBloko, type BlokoSearchResult } from "@/lib/actions/discover-search";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function BlokoSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BlokoSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const mySeq = ++seq.current;
    const timeout = setTimeout(async () => {
      const found = await searchBloko(query);
      if (seq.current === mySeq) setResults(found);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/decouvrir?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 rounded-2xl border border-stroke bg-white px-5 py-4 shadow-1 dark:border-dark-3 dark:bg-dark-2">
          <SearchIcon />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="@handle, boutique ou produit"
            className="w-full bg-transparent text-body-sm text-dark outline-none placeholder:text-dark-5 dark:text-white dark:placeholder:text-dark-6"
          />
        </div>
      </form>

      {open && results.length > 0 && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-dark-2">
          {results.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="flex items-center gap-3 border-b border-stroke px-4 py-3 last:border-0 hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-3"
            >
              <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-gray-2 dark:bg-dark-3">
                {r.image && <Image src={r.image} alt="" fill className="object-cover" sizes="36px" />}
              </div>
              <div>
                <p className="text-body-sm font-medium text-dark dark:text-white">{r.title}</p>
                <p className="text-body-xs text-dark-5 dark:text-dark-6">{r.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-dark-5 dark:text-dark-6">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
