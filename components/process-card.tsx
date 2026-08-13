import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { BpmnMiniature } from "@/components/bpmn-miniature";
import type { ProcessSummary } from "@/lib/types";

export function ProcessCard({ process, priority = false }: { process: ProcessSummary; priority?: boolean }) {
  return (
    <Link
      href={`/processus/${process.slug}`}
      className="group flex min-h-[355px] flex-col overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-primary/45"
    >
      <div className="relative h-40 overflow-hidden border-b border-border bg-secondary/45 p-3">
        <BpmnMiniature slug={process.slug} />
        {priority && (
          <span className="absolute left-3 top-3 rounded-sm border border-border bg-white px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-wide text-primary">
            Sélection
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <span className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ backgroundColor: process.category.color }} />{process.category.name}</span>
          <span className="rounded-sm border border-[#d8c58d] bg-[#fbf8ed] px-2 py-1 text-[0.56rem] tracking-wide text-[#725814]">Brouillon</span>
        </div>
        <h3 className="mt-3 text-lg font-semibold leading-snug text-foreground">
          {process.shortTitle}
        </h3>
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">{process.description}</p>
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground"><Clock3 className="size-3.5" />{process.duration} · {process.laneCount} couloirs</span>
          <span className="flex items-center gap-1.5 font-medium text-primary">Consulter <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" /></span>
        </div>
      </div>
    </Link>
  );
}
