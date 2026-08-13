"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Expand, Minus, RotateCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type CanvasService = {
  zoom: {
    (value: "fit-viewport" | number): void;
    (): number;
  };
};

type ViewerInstance = {
  importXML: (xml: string) => Promise<{ warnings?: unknown[] }>;
  get: (service: "canvas") => CanvasService;
  destroy: () => void;
};

export function BpmnViewer({ xml, slug }: { xml: string; slug: string }) {
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ViewerInstance | null>(null);
  const [status, setStatus] = useState<"chargement" | "prêt" | "erreur">("chargement");

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      if (!viewerContainerRef.current) return;
      try {
        const { default: Viewer } = await import("bpmn-js/lib/NavigatedViewer");
        if (cancelled || !viewerContainerRef.current) return;
        const viewer = new Viewer({ container: viewerContainerRef.current }) as ViewerInstance;
        viewerRef.current = viewer;
        await viewer.importXML(xml);
        viewer.get("canvas").zoom("fit-viewport");
        if (!cancelled) setStatus("prêt");
      } catch (error) {
        console.error("Impossible d’afficher le diagramme BPMN", error);
        if (!cancelled) setStatus("erreur");
      }
    }

    renderDiagram();
    return () => {
      cancelled = true;
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [xml]);

  function changeZoom(delta: number) {
    const canvas = viewerRef.current?.get("canvas");
    if (!canvas) return;
    const current = canvas.zoom();
    canvas.zoom(Math.max(0.25, Math.min(2.5, current + delta)));
  }

  function resetZoom() {
    viewerRef.current?.get("canvas").zoom("fit-viewport");
  }

  async function openFullscreen() {
    await fullscreenRef.current?.requestFullscreen?.();
    window.setTimeout(resetZoom, 120);
  }

  return (
    <div ref={fullscreenRef} className="overflow-hidden rounded-md border border-border bg-[#f6f7f9]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`size-2 ${status === "prêt" ? "bg-[#158447]" : status === "erreur" ? "bg-[#c9423a]" : "animate-pulse bg-accent"}`} />
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {status === "chargement" ? "Chargement du diagramme" : status === "erreur" ? "Erreur d’affichage" : "Diagramme interactif"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => changeZoom(-0.15)} aria-label="Dézoomer"><Minus /></Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={() => changeZoom(0.15)} aria-label="Zoomer"><Plus /></Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={resetZoom} aria-label="Ajuster à l’écran"><RotateCcw /></Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={openFullscreen} aria-label="Plein écran"><Expand /></Button>
          <span className="mx-1 h-5 w-px bg-border" />
          <Button asChild variant="outline" size="sm">
            <a href={`/api/processus/${slug}?telecharger=1`}><Download /> Télécharger</a>
          </Button>
        </div>
      </div>
      <div className="relative">
        {status === "chargement" && <div className="absolute inset-0 z-10 grid place-items-center bg-[#f6f7f9]"><span className="size-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /></div>}
        {status === "erreur" && <div className="absolute inset-0 z-10 grid place-items-center bg-[#f6f7f9] px-6 text-center text-sm text-muted-foreground">Le diagramme ne peut pas être affiché. Le fichier BPMN reste téléchargeable.</div>}
        <div ref={viewerContainerRef} className="bpmn-workspace h-[480px] w-full md:h-[590px]" aria-label="Visionneuse du processus BPMN" />
      </div>
      <div className="flex items-center justify-between border-t border-border bg-card px-4 py-2 text-[0.65rem] text-muted-foreground">
        <span>Glisser pour déplacer · Molette pour zoomer</span>
        <span className="font-semibold">BPMN 2.0</span>
      </div>
    </div>
  );
}
