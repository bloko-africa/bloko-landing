"use client";

import { SearchIcon } from "@/assets/icons";
import { globalSearch, type SearchResult } from "@/lib/actions/search";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const TYPE_LABEL: Record<SearchResult["type"], string> = {
  product: "Produit",
  order: "Commande",
  collection: "Collection",
  category: "Catégorie",
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function handleGlobalKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await globalSearch(query);
        setResults(data);
        setActiveIndex(0);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  function goTo(result: SearchResult) {
    setOpen(false);
    router.push(result.href);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      goTo(results[activeIndex]);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-gray-2 focus-visible:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-dark-4 dark:hover:bg-dark-3 dark:hover:text-dark-6 dark:focus-visible:border-primary relative flex w-full max-w-75 items-center gap-3.5 rounded-full border py-3 pr-5 pl-13.25 text-left text-body-sm text-dark-5 transition-colors outline-none dark:text-dark-6"
      >
        <SearchIcon className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 max-[1015px]:size-5" />
        Rechercher...
        <kbd className="ml-auto hidden rounded border border-stroke px-1.5 py-0.5 text-body-xs text-dark-5 sm:block dark:border-dark-3 dark:text-dark-6">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-999999 flex items-start justify-center bg-black/50 pt-24"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-3 dark:bg-gray-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-stroke px-5 py-4 dark:border-dark-3">
              <SearchIcon className="size-5 text-dark-5 dark:text-dark-6" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher un produit, une commande, une collection..."
                className="w-full bg-transparent text-dark outline-none placeholder:text-dark-5 dark:text-white dark:placeholder:text-dark-6"
              />
              <kbd className="rounded border border-stroke px-1.5 py-0.5 text-body-xs text-dark-5 dark:border-dark-3 dark:text-dark-6">
                Esc
              </kbd>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {loading && (
                <p className="px-3 py-4 text-center text-body-sm text-dark-5 dark:text-dark-6">
                  Recherche...
                </p>
              )}

              {!loading && query.trim().length >= 2 && results.length === 0 && (
                <p className="px-3 py-4 text-center text-body-sm text-dark-5 dark:text-dark-6">
                  Aucun résultat pour « {query} ».
                </p>
              )}

              {!loading &&
                results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => goTo(result)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left ${
                      index === activeIndex
                        ? "bg-gray-2 dark:bg-dark-2"
                        : "hover:bg-gray-2 dark:hover:bg-dark-2"
                    }`}
                  >
                    <span>
                      <span className="block text-body-sm font-medium text-dark dark:text-white">
                        {result.title}
                      </span>
                      <span className="block text-body-xs text-dark-5 dark:text-dark-6">
                        {result.subtitle}
                      </span>
                    </span>
                    <span className="rounded-full bg-gray-2 px-2.5 py-1 text-body-xs font-medium text-dark-5 dark:bg-dark-3 dark:text-dark-6">
                      {TYPE_LABEL[result.type]}
                    </span>
                  </button>
                ))}

              {query.trim().length < 2 && (
                <p className="px-3 py-4 text-center text-body-sm text-dark-5 dark:text-dark-6">
                  Tape au moins 2 caractères pour chercher.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
