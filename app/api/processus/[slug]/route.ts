import { NextRequest, NextResponse } from "next/server";
import { getProcessDetail } from "@/lib/catalog";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const process = await getProcessDetail(slug);

  if (!process) {
    return NextResponse.json({ erreur: "Processus introuvable" }, { status: 404 });
  }

  if (request.nextUrl.searchParams.get("telecharger") === "1") {
    return new NextResponse(process.xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${process.fileName}"`,
      },
    });
  }

  return NextResponse.json({
    slug: process.slug,
    titre: process.title,
    version: process.version,
    revisionDuWorkflow: process.workflowRevision,
    statutDeValidation: process.validationStatus,
    derniereMiseAJour: process.lastUpdated,
    xml: process.xml,
  });
}
