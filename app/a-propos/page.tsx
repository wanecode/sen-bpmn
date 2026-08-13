import type { Metadata } from "next";
import Link from "next/link";
import { Braces, FileCheck2, GitFork, HeartHandshake, Scale, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "À propos",
  description: "Méthode, principes et guide de contribution de SenBPMN.",
};

const principles = [
  { icon: Braces, title: "Un format ouvert", text: "Des fichiers BPMN 2.0 natifs, lisibles par les outils standards et faciles à versionner." },
  { icon: FileCheck2, title: "Une base explicite", text: "Chaque parcours précise son objectif, son responsable, son public et sa version." },
  { icon: HeartHandshake, title: "Un travail collectif", text: "Les modèles gagnent en justesse grâce aux retours des professionnels et des établissements." },
];

export default function AboutPage() {
  return (
    <main>
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-18">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Présentation</p>
          <h1 className="editorial-title mt-4 max-w-4xl text-4xl leading-tight sm:text-5xl">À propos du référentiel SenBPMN</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">Une bibliothèque ouverte pour documenter et consulter les processus hospitaliers sénégalais en français.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1000px] px-5 py-16 md:px-8">
        <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
          {principles.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-card p-6"><Icon className="size-5 text-primary" /><h2 className="mt-5 text-lg font-semibold">{title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p></div>
          ))}
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-[200px_1fr]">
          <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Méthode</p><p className="mt-3 text-lg font-semibold leading-tight">Modéliser sans figer</p></div>
          <div className="space-y-5 text-[0.95rem] leading-7 text-foreground/75">
            <p>Les modèles publiés décrivent une trame de travail compréhensible : un début et une fin explicites, les activités principales, une décision structurante et les deux orientations qui en découlent.</p>
            <p>Ils sont volontairement génériques. L’organisation réelle varie selon le niveau de la structure, les ressources disponibles, les protocoles cliniques validés et les responsabilités locales.</p>
            <div className="flex gap-3 rounded-md border border-[#d8b4b1] bg-[#fcf4f3] p-5 text-sm leading-6"><ShieldAlert className="mt-0.5 size-5 shrink-0 text-[#a03933]" /><p><strong className="text-foreground">Important :</strong> SenBPMN n’est ni un guide clinique ni un dispositif médical. Toute utilisation opérationnelle exige une validation par les instances compétentes de l’établissement.</p></div>
            <div className="grid gap-3 pt-3 sm:grid-cols-3">
              {[
                ["Brouillon", "Modèle documenté et sourcé, sans validation métier locale."],
                ["En relecture", "Relecture engagée par des professionnels identifiés."],
                ["Validé", "Version, date et instance de validation locale renseignées."],
              ].map(([status, text]) => (
                <div key={status} className="rounded-md border border-border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-wide text-primary">{status}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p></div>
              ))}
            </div>
          </div>
        </div>

        <div id="contribuer" className="mt-16 scroll-mt-20 grid gap-10 border-t border-border pt-16 md:grid-cols-[200px_1fr]">
          <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Contribuer</p><p className="mt-3 text-lg font-semibold leading-tight">Une amélioration à la fois</p></div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Proposer et documenter</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">Vous pouvez corriger un libellé, proposer une variante ou ajouter un parcours. Le dépôt contient le générateur, les métadonnées et les fichiers BPMN afin que chaque changement soit relu clairement.</p>
            <ol className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["01", "Décrire", "Expliquez le besoin, le contexte et les acteurs concernés."],
                ["02", "Modéliser", "Ajoutez ou adaptez le parcours avec des libellés en français."],
                ["03", "Faire relire", "Sollicitez une validation métier avant toute utilisation locale."],
              ].map(([number, title, text]) => <li key={number} className="rounded-md border border-border bg-card p-5"><span className="text-sm font-semibold text-primary">{number}</span><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p></li>)}
            </ol>
            <Button asChild className="mt-7"><Link href="/#catalogue"><GitFork /> Explorer avant de contribuer</Link></Button>
          </div>
        </div>

        <div id="open-source" className="mt-16 scroll-mt-20 grid gap-10 border-t border-border pt-16 md:grid-cols-[200px_1fr]">
          <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Open source</p><p className="mt-3 text-lg font-semibold leading-tight">Auditable par tous</p></div>
          <div><h2 className="text-3xl font-semibold tracking-tight">Conçu pour être repris</h2><p className="mt-5 text-sm leading-7 text-muted-foreground">L’application utilise Next.js et bpmn-js. Le catalogue statique fonctionne sur Vercel ; une option SQLite reste disponible pour l’auto-hébergement avec Docker.</p></div>
        </div>

        <div id="licence" className="mt-16 scroll-mt-20 grid gap-10 border-t border-border pt-16 md:grid-cols-[200px_1fr]">
          <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Licence</p></div>
          <div className="flex gap-4"><Scale className="mt-1 size-6 shrink-0 text-primary" /><div><h2 className="text-2xl font-semibold">Licence MIT</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Le code et les modèles peuvent être utilisés, modifiés et redistribués conformément au fichier LICENSE, sans garantie d’adéquation à un usage clinique.</p></div></div>
        </div>
      </section>
    </main>
  );
}
