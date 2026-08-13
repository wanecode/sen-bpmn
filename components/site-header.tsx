import Link from "next/link";
import { Github, Search } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <div className="grid h-1 grid-cols-3" aria-hidden="true"><span className="bg-[#158447]" /><span className="bg-[#d8af27]" /><span className="bg-[#c9423a]" /></div>
      <div className="mx-auto flex h-[58px] max-w-[1200px] items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-center gap-3 text-primary" aria-label="Accueil SenBPMN">
          <BrandMark />
          <span className="text-[0.96rem] font-semibold tracking-[-0.02em]">SenBPMN</span>
          <span className="hidden border-l border-border pl-3 text-xs font-medium text-muted-foreground lg:block">
            Référentiel des processus hospitaliers
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-foreground/75 md:flex">
          <Link href="/#catalogue" className="transition-colors hover:text-primary">Explorer</Link>
          <Link href="/a-propos" className="transition-colors hover:text-primary">À propos</Link>
          <Link href="/a-propos#contribuer" className="transition-colors hover:text-primary">Contribuer</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="md:hidden" aria-label="Rechercher">
            <Link href="/#catalogue"><Search /></Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="https://github.com/wanecode/sen-bpmn" target="_blank" rel="noreferrer"><Github /> <span className="hidden sm:inline">Code source</span></a>
          </Button>
        </div>
      </div>
    </header>
  );
}
