import { NextResponse } from "next/server";
import { getAllProcesses } from "@/lib/catalog-store";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    const processes = getAllProcesses();
    return NextResponse.json(
      {
        statut: "ok",
        service: "sen-bpmn",
        processus: processes.length,
        horodatage: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { statut: "indisponible", service: "sen-bpmn" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
