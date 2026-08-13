import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Clock3,
  ExternalLink,
  FileCheck2,
  GitBranch,
  Info,
  MapPinned,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { BpmnViewer } from "@/components/bpmn-viewer";
import { ProcessCard } from "@/components/process-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProcessDetail } from "@/lib/catalog";
import { getAllProcesses } from "@/lib/catalog-store";

export function generateStaticParams() {
  return getAllProcesses().map((process) => ({ slug: process.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const process = await getProcessDetail(slug);
  if (!process) return {};
  return { title: process.shortTitle, description: process.description };
}

export default async function ProcessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const process = await getProcessDetail(slug);
  if (!process) notFound();
  const formattedUpdate = new Intl.DateTimeFormat("fr-SN", { dateStyle: "long" }).format(new Date(process.lastUpdated));
  const validationLabel = process.validationStatus === "valide"
    ? "Validé"
    : process.validationStatus === "en_relecture"
      ? "En relecture"
      : "Brouillon";

  return (
    <main>
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-[1200px] px-5 py-9 md:px-8 md:py-12">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground" aria-label="Fil d’Ariane">
            <Link href="/" className="hover:text-primary">Accueil</Link><span>/</span>
            <Link href={`/categories/${process.category.slug}`} className="hover:text-primary">{process.category.name}</Link><span>/</span>
            <span className="text-foreground">{process.shortTitle}</span>
          </nav>
          <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_280px] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge style={{ color: process.category.color, borderColor: `${process.category.color}35`, backgroundColor: `${process.category.color}0d` }}>
                  <span className="mr-1.5 size-1.5 rounded-full" style={{ backgroundColor: process.category.color }} />{process.category.name}
                </Badge>
                <Badge className="border-[#d8c58d] bg-[#fbf8ed] text-[#725814]"><FileCheck2 className="mr-1.5 size-3" />{validationLabel} · validation locale requise</Badge>
              </div>
              <h1 className="editorial-title mt-5 max-w-4xl text-4xl leading-tight sm:text-[2.75rem]">{process.title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{process.description}</p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {process.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] gap-6 px-5 py-8 md:px-8 lg:grid-cols-[1fr_260px]">
        <div className="min-w-0">
          <BpmnViewer xml={process.xml} slug={process.slug} />
          <div className="mt-4 flex items-start gap-3 rounded-md border border-[#d8c58d] bg-[#fbf8ed] p-4 text-xs leading-5 text-foreground/75">
            <Info className="mt-0.5 size-4 shrink-0 text-[#725814]" />
            <p><strong className="text-foreground">Référentiel indicatif.</strong> Ce modèle doit être relu et adapté aux ressources, responsabilités et protocoles validés dans chaque établissement.</p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <section className="rounded-md border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-primary"><MapPinned className="size-4" /><h2 className="text-xs font-bold uppercase tracking-[0.13em]">Périmètre d’application</h2></div>
              <dl className="mt-6 space-y-5 text-sm">
                <div><dt className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Niveau de soins</dt><dd className="mt-1.5 font-semibold">{process.careLevel}</dd></div>
                <div><dt className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Périmètre territorial</dt><dd className="mt-1.5 font-semibold">{process.territorialScope}</dd></div>
                <div><dt className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Établissements cibles</dt><dd className="mt-2 flex flex-wrap gap-2">{process.facilityTypes.map((facility) => <Badge key={facility} className="normal-case tracking-normal">{facility}</Badge>)}</dd></div>
              </dl>
            </section>

            <section className="rounded-md border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-primary"><ShieldCheck className="size-4" /><h2 className="text-xs font-bold uppercase tracking-[0.13em]">Gouvernance du modèle</h2></div>
              <dl className="mt-6 space-y-5 text-sm">
                <div><dt className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Statut</dt><dd className="mt-1.5 font-semibold text-[#725814]">{validationLabel}</dd></div>
                <div><dt className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Dernière mise à jour</dt><dd className="mt-1.5 font-semibold">{formattedUpdate}</dd></div>
                <div><dt className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Date de validation locale</dt><dd className="mt-1.5 font-semibold">{process.validationDate ? new Intl.DateTimeFormat("fr-SN", { dateStyle: "long" }).format(new Date(process.validationDate)) : "Non validé — à renseigner par l’établissement"}</dd></div>
              </dl>
            </section>
          </div>

          <section className="mt-5 rounded-md border border-border bg-card p-5">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.13em] text-primary">Sources de cadrage</h2>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">Ces références orientent la modélisation mais ne remplacent pas les protocoles validés localement.</p>
                <ul className="mt-5 space-y-3">
                  {process.sources.map((source) => (
                    <li key={`${source.organization}-${source.title}`}>
                      <a href={source.url} target="_blank" rel="noreferrer" className="group flex items-start justify-between gap-4 rounded-sm border border-border p-3 transition-colors hover:border-primary/35 hover:bg-secondary/45">
                        <span><span className="block text-sm font-semibold leading-5">{source.title}</span><span className="mt-1 block text-[0.68rem] text-muted-foreground">{source.organization} · {source.year}</span></span>
                        <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.13em] text-primary">Contributeurs</h2>
                <ul className="mt-5 space-y-4">
                  {process.contributors.map((contributor) => (
                    <li key={`${contributor.name}-${contributor.role}`} className="border-l-2 border-primary/15 pl-4"><p className="text-sm font-semibold">{contributor.name}</p><p className="mt-1 text-xs text-muted-foreground">{contributor.role}</p></li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <aside>
          <div className="sticky top-20 rounded-md border border-border bg-card p-5">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-primary">Fiche du processus</p>
            <dl className="mt-5 space-y-5">
              <div className="flex gap-3"><Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div><dt className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Responsable</dt><dd className="mt-1 text-sm font-semibold leading-5">{process.owner}</dd></div></div>
              <div className="flex gap-3"><UsersRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div><dt className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Public concerné</dt><dd className="mt-1 text-sm font-semibold leading-5">{process.audience}</dd></div></div>
              <div className="flex gap-3"><Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div><dt className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Durée indicative</dt><dd className="mt-1 text-sm font-semibold">{process.duration}</dd></div></div>
              <div className="flex gap-3"><GitBranch className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div><dt className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Modèle</dt><dd className="mt-1 text-sm font-semibold">Version {process.version} · {process.nodeCount} éléments · {process.laneCount} couloirs</dd></div></div>
              <div className="flex gap-3"><CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div><dt className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Révision du workflow</dt><dd className="mt-1 text-sm font-semibold">Révision {process.workflowRevision}</dd></div></div>
            </dl>
            <Button asChild variant="secondary" className="mt-6 w-full"><Link href={`/categories/${process.category.slug}`}><ArrowLeft /> Retour à {process.category.name}</Link></Button>
          </div>
        </aside>
      </section>

      {process.related.length > 0 && (
        <section className="border-t border-border bg-secondary/45">
          <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Continuer dans {process.category.name}</p>
            <h2 className="editorial-title mt-2 text-3xl">Parcours associés</h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {process.related.map((related) => <ProcessCard key={related.slug} process={related} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
