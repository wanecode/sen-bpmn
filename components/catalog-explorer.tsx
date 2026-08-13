"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { ProcessCard } from "@/components/process-card";
import { Button } from "@/components/ui/button";
import type { Category, ProcessSummary } from "@/lib/types";

function searchable(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function CatalogExplorer({
  categories,
  processes,
  initialCategory = "tous",
  hideFilters = false,
}: {
  categories: Category[];
  processes: ProcessSummary[];
  initialCategory?: string;
  hideFilters?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);

  const results = useMemo(() => {
    const normalizedQuery = searchable(query.trim());
    return processes.filter((process) => {
      const matchesCategory = category === "tous" || process.category.slug === category;
      const haystack = searchable(
        [process.title, process.description, process.owner, process.category.name, ...process.tags].join(" "),
      );
      return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [category, processes, query]);

  return (
    <div>
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {!hideFilters && (
          <div className="flex flex-wrap gap-px overflow-hidden rounded-md border border-border bg-border" aria-label="Filtrer par catégorie">
            <button
              onClick={() => setCategory("tous")}
              className={`px-3 py-2 text-xs font-medium transition-colors ${category === "tous" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`}
            >
              Tous <span className="ml-1 opacity-65">{processes.length}</span>
            </button>
            {categories.map((item) => (
              <button
                key={item.slug}
                onClick={() => setCategory(item.slug)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${category === item.slug ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`}
              >
                {item.name} <span className="ml-1 opacity-65">{item.processCount}</span>
              </button>
            ))}
          </div>
        )}
        <label className="relative block w-full shrink-0 lg:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un processus…"
            className="h-10 w-full rounded-md border border-border bg-card pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground/75 focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Effacer la recherche">
              <X className="size-4" />
            </button>
          )}
        </label>
      </div>

      <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
        <span><strong className="text-foreground">{results.length}</strong> processus affiché{results.length > 1 ? "s" : ""}</span>
        <span className="hidden sm:inline">Fichiers BPMN 2.0 · versionnables</span>
      </div>

      {results.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((process, index) => (
            <ProcessCard key={process.slug} process={process} priority={index < 2 && category === "tous" && !query} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <p className="text-xl font-semibold">Aucun processus trouvé</p>
          <p className="mt-2 text-sm text-muted-foreground">Essayez un autre terme ou réinitialisez les filtres.</p>
          <Button className="mt-5" variant="outline" onClick={() => { setQuery(""); setCategory("tous"); }}>Réinitialiser</Button>
        </div>
      )}
    </div>
  );
}
