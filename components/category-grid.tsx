import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import type { Category } from "@/lib/types";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/categories/${category.slug}`}
          className="group relative min-h-44 bg-card p-5 transition-colors hover:bg-secondary/60"
        >
          <div className="flex items-start justify-between">
            <span
              className="flex size-9 items-center justify-center rounded-sm border"
              style={{ borderColor: `${category.color}45`, color: category.color }}
            >
              <CategoryIcon name={category.icon} className="size-5" />
            </span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <h3 className="mt-5 text-lg font-semibold">{category.name}</h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{category.description}</p>
          <p className="mt-4 text-xs font-medium text-primary">{category.processCount} processus</p>
        </Link>
      ))}
    </div>
  );
}
