import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[65vh] max-w-2xl place-items-center px-5 text-center">
      <div><p className="text-sm font-semibold text-primary">ERREUR 404</p><h1 className="editorial-title mt-4 text-3xl">Page introuvable</h1><p className="mt-4 text-sm text-muted-foreground">La page demandée n’existe pas ou a changé d’adresse.</p><Button asChild className="mt-7"><Link href="/"><ArrowLeft /> Revenir au catalogue</Link></Button></div>
    </main>
  );
}
