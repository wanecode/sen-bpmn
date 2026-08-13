import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { CategoryIcon } from "@/components/category-icon";
import { Button } from "@/components/ui/button";
import { getCategories, getCategory, getProcessesByCategory } from "@/lib/catalog-store";

export function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  return category ? { title: category.name, description: category.description } : {};
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const processes = getProcessesByCategory(slug);

  return (
    <main>
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-[1200px] px-5 py-12 md:px-8 md:py-16">
          <Button asChild variant="ghost" size="sm" className="-ml-3 text-muted-foreground"><Link href="/#catalogue"><ArrowLeft /> Toutes les catégories</Link></Button>
          <div className="mt-8 grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
            <span className="flex size-12 items-center justify-center rounded-sm border" style={{ color: category.color, borderColor: `${category.color}55` }}><CategoryIcon name={category.icon} className="size-6" /></span>
            <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Domaine hospitalier</p><h1 className="editorial-title mt-2 text-4xl">{category.name}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{category.description}</p></div>
            <div className="border-l border-border pl-6 text-sm text-muted-foreground"><strong className="block text-2xl font-semibold text-foreground">{processes.length}</strong> processus</div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1200px] px-5 py-12 md:px-8">
        <div className="mb-8 border-b border-border pb-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Catalogue du domaine</p><h2 className="editorial-title mt-2 text-3xl">Parcours et procédures</h2></div>
        <CatalogExplorer categories={[category]} processes={processes} initialCategory={category.slug} hideFilters />
      </section>
    </main>
  );
}
