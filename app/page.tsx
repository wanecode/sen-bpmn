import Link from "next/link";
import { ArrowDown, Braces, Download, GitFork, Languages } from "lucide-react";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { CategoryGrid } from "@/components/category-grid";
import { ProcessMotif } from "@/components/process-motif";
import { Button } from "@/components/ui/button";
import { getAllProcesses, getCategories } from "@/lib/catalog-store";

export default function Home() {
  const categories = getCategories();
  const processes = getAllProcesses();

  return (
    <main>
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[1fr_440px] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Référentiel ouvert · Sénégal</p>
            <h1 className="editorial-title mt-5 max-w-[720px] text-4xl leading-[1.08] text-foreground sm:text-5xl lg:text-[3.5rem]">
              Processus hospitaliers documentés en BPMN
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
              Consultez des modèles en français, comparez les responsabilités et téléchargez les fichiers BPMN 2.0 pour les adapter à votre établissement.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href="#catalogue">Explorer les processus <ArrowDown /></Link></Button>
              <Button asChild size="lg" variant="secondary"><Link href="/a-propos#contribuer"><GitFork /> Contribuer</Link></Button>
            </div>
            <dl className="mt-10 grid max-w-xl grid-cols-3 border-y border-border py-4">
              <div className="border-r border-border pr-5"><dt className="text-2xl font-semibold">{processes.length}</dt><dd className="mt-1 text-xs text-muted-foreground">Processus</dd></div>
              <div className="border-r border-border px-5"><dt className="text-2xl font-semibold">{categories.length}</dt><dd className="mt-1 text-xs text-muted-foreground">Domaines</dd></div>
              <div className="pl-5"><dt className="text-2xl font-semibold">BPMN 2.0</dt><dd className="mt-1 text-xs text-muted-foreground">Format ouvert</dd></div>
            </dl>
          </div>
          <div className="overflow-hidden rounded-md border border-border bg-secondary/40">
            <div className="flex items-center justify-between border-b border-border bg-white px-4 py-3">
              <div className="flex items-center gap-2"><span className="size-2 bg-[#158447]" /><span className="text-xs font-semibold">Exemple de diagramme</span></div>
              <span className="text-[0.68rem] font-medium text-muted-foreground">Accueil et triage</span>
            </div>
            <div className="h-[300px] p-4">
              <ProcessMotif />
            </div>
            <div className="border-t border-border bg-white px-4 py-3 text-xs text-muted-foreground">
              Couloirs, décisions, événements et responsabilités
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-16 md:px-8">
        <div className="mb-8 flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Domaines hospitaliers</p>
            <h2 className="editorial-title mt-2 text-3xl">Naviguer par catégorie</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Chaque domaine regroupe trois parcours et donne accès aux diagrammes détaillés.
          </p>
        </div>
        <CategoryGrid categories={categories} />
      </section>

      <section id="catalogue" className="scroll-mt-20 border-y border-border bg-white">
        <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-8">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Catalogue</p>
              <h2 className="editorial-title mt-2 text-3xl">Tous les processus</h2>
            </div>
            <div className="flex flex-wrap divide-x divide-border border border-border bg-secondary/35 text-xs text-muted-foreground">
              <span className="flex items-center gap-2 px-3 py-2"><Braces className="size-3.5" /> BPMN natif</span>
              <span className="flex items-center gap-2 px-3 py-2"><Download className="size-3.5" /> Téléchargeable</span>
              <span className="flex items-center gap-2 px-3 py-2"><Languages className="size-3.5" /> Français</span>
            </div>
          </div>
          <CatalogExplorer categories={categories} processes={processes} />
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-16 md:px-8">
        <div className="grid gap-6 border border-border border-l-4 border-l-[#158447] bg-white px-6 py-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-xl font-semibold">Contribuer au référentiel</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Signalez un écart, proposez une variante ou documentez un nouveau parcours. Chaque changement reste traçable dans le dépôt.</p>
          </div>
          <Button asChild variant="outline"><Link href="/a-propos#contribuer">Guide de contribution <GitFork /></Link></Button>
        </div>
      </section>
    </main>
  );
}
