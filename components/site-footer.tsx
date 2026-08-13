import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-white text-foreground">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-10 md:grid-cols-[1fr_auto] md:px-8">
        <div>
          <div className="flex items-center gap-3 text-primary"><BrandMark /><span className="font-semibold">SenBPMN</span></div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            Référentiel ouvert pour documenter et comparer les parcours hospitaliers au Sénégal.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm text-muted-foreground">
          <Link href="/#catalogue" className="hover:text-primary">Catalogue</Link>
          <Link href="/a-propos" className="hover:text-primary">Méthode</Link>
          <Link href="/a-propos#contribuer" className="hover:text-primary">Contribuer</Link>
          <Link href="/a-propos#licence" className="hover:text-primary">Licence MIT</Link>
        </div>
      </div>
      <div className="border-t border-border bg-secondary/60 px-5 py-4 text-center text-[0.68rem] tracking-wide text-muted-foreground">
        RÉFÉRENTIEL INDICATIF · À ADAPTER AUX PROTOCOLES DE CHAQUE ÉTABLISSEMENT
      </div>
    </footer>
  );
}
