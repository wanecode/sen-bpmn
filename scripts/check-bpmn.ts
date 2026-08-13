import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import BpmnModdle from "bpmn-moddle";
import { processesSeed } from "../lib/catalog-data";
import { governanceByProcess } from "../lib/traceability-data";
import { workflowsByProcess } from "../lib/workflow-data";

async function main() {
  const moddle = new BpmnModdle();
  let warnings = 0;
  const manifest = JSON.parse(
    await readFile(path.join(process.cwd(), "data", "bpmn", "manifest.json"), "utf8"),
  ) as {
    schemaVersion: number;
    processes: Array<{ slug: string; modelVersion: string; workflowRevision: string; sha256: string }>;
  };
  if (manifest.schemaVersion !== 1 || manifest.processes.length !== processesSeed.length) {
    throw new Error("Le manifeste BPMN est absent, incomplet ou utilise un schéma inconnu.");
  }
  const manifestBySlug = new Map(manifest.processes.map((entry) => [entry.slug, entry]));

  for (const processDefinition of processesSeed) {
    const file = path.join(process.cwd(), "data", "bpmn", `${processDefinition.slug}.bpmn`);
    const xml = await readFile(file, "utf8");
    const result = await moddle.fromXML(xml);
    warnings += result.warnings?.length ?? 0;

    if (!result.rootElement) {
      throw new Error(`Le fichier ${processDefinition.slug}.bpmn ne contient pas de définition BPMN.`);
    }

    const workflow = workflowsByProcess[processDefinition.slug];
    const governance = governanceByProcess[processDefinition.slug];
    if (!workflow) throw new Error(`Workflow absent : ${processDefinition.slug}`);
    if (!governance) throw new Error(`Traçabilité absente : ${processDefinition.slug}`);
    const manifestEntry = manifestBySlug.get(processDefinition.slug);
    if (!manifestEntry) throw new Error(`Entrée de manifeste absente : ${processDefinition.slug}`);
    if (manifestEntry.sha256 !== createHash("sha256").update(xml).digest("hex")) {
      throw new Error(`Empreinte SHA-256 invalide : ${processDefinition.slug}`);
    }
    if (manifestEntry.modelVersion !== processDefinition.version || manifestEntry.workflowRevision !== workflow.revision) {
      throw new Error(`Version de manifeste incohérente : ${processDefinition.slug}`);
    }

    const nodeIds = new Set(workflow.nodes.map((node) => node.id));
    if (nodeIds.size !== workflow.nodes.length) throw new Error(`Identifiant BPMN dupliqué : ${processDefinition.slug}`);
    if (workflow.roles.length < 2) throw new Error(`Couloirs insuffisants : ${processDefinition.slug}`);
    if (!workflow.nodes.some((node) => node.type === "subProcess")) throw new Error(`Sous-processus absent : ${processDefinition.slug}`);
    if (!workflow.nodes.some((node) => node.type.startsWith("boundary"))) throw new Error(`Exception absente : ${processDefinition.slug}`);
    if (!workflow.nodes.some((node) => node.type.startsWith("intermediate"))) throw new Error(`Événement intermédiaire absent : ${processDefinition.slug}`);
    if (workflow.documents.length === 0) throw new Error(`Document métier absent : ${processDefinition.slug}`);
    if (governance.sources.length === 0 || governance.facilityTypes.length === 0) throw new Error(`Traçabilité incomplète : ${processDefinition.slug}`);

    workflow.flows.forEach((flow) => {
      if (!nodeIds.has(flow.from) || !nodeIds.has(flow.to)) {
        throw new Error(`Flux invalide dans ${processDefinition.slug} : ${flow.from} → ${flow.to}`);
      }
    });
    workflow.documents.forEach((document) => {
      if (!nodeIds.has(document.linkedTo)) throw new Error(`Document non relié dans ${processDefinition.slug}`);
    });
  }

  console.log(`${processesSeed.length} fichiers BPMN enrichis, traçables et signés par manifeste valides (${warnings} avertissement(s)).`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
