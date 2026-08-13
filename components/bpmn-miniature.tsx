"use client";

import { useEffect, useRef, useState } from "react";

type CanvasService = { zoom: (value: string) => void };
type ViewerInstance = {
  importXML: (xml: string) => Promise<unknown>;
  get: (service: "canvas") => CanvasService;
  destroy: () => void;
};

export function BpmnMiniature({ slug }: { slug: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ViewerInstance | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;
    let cancelled = false;

    async function renderDiagram() {
      try {
        const [{ default: Viewer }, response] = await Promise.all([
          import("bpmn-js/lib/NavigatedViewer"),
          fetch(`/api/processus/${slug}`),
        ]);
        if (!response.ok) throw new Error("Processus introuvable");
        const { xml } = (await response.json()) as { xml: string };
        if (cancelled || !containerRef.current) return;
        const viewer = new Viewer({ container: containerRef.current }) as ViewerInstance;
        viewerRef.current = viewer;
        await viewer.importXML(xml);
        viewer.get("canvas").zoom("fit-viewport");
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    renderDiagram();
    return () => {
      cancelled = true;
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [isVisible, slug]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {!isVisible && <div className="absolute inset-0 animate-pulse bg-muted/60" />}
      {failed && (
        <div className="absolute inset-0 grid place-items-center text-[0.68rem] font-semibold text-muted-foreground">
          Aperçu indisponible
        </div>
      )}
      <div ref={containerRef} className="bpmn-miniature h-full w-full" aria-hidden="true" />
    </div>
  );
}
