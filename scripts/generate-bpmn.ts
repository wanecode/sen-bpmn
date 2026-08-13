import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { processesSeed } from "../lib/catalog-data";
import { governanceByProcess } from "../lib/traceability-data";
import { workflowsByProcess } from "../lib/workflow-data";
import type { WorkflowNode, WorkflowSpec } from "../lib/types";

const outputDirectory = path.join(process.cwd(), "data", "bpmn");
const laneHeight = 220;
const columnWidth = 180;

type Bounds = { x: number; y: number; width: number; height: number };

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function safeId(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_]/g, "_");
}

function elementId(processKey: string, localId: string) {
  return `${safeId(localId)}_${processKey}`;
}

function typeTag(type: WorkflowNode["type"]) {
  const tags: Partial<Record<WorkflowNode["type"], string>> = {
    task: "task",
    userTask: "userTask",
    manualTask: "manualTask",
    serviceTask: "serviceTask",
    exclusiveGateway: "exclusiveGateway",
    parallelGateway: "parallelGateway",
  };
  return tags[type];
}

function nodeBounds(workflow: WorkflowSpec) {
  const bounds = new Map<string, Bounds>();
  const groups = new Map<string, WorkflowNode[]>();

  workflow.nodes.filter((node) => !node.attachedTo).forEach((node) => {
    const key = `${node.lane}:${node.column}`;
    groups.set(key, [...(groups.get(key) ?? []), node]);
  });

  groups.forEach((nodes) => {
    nodes.forEach((node, index) => {
      const x = 60 + node.column * columnWidth;
      const laneTop = 30 + node.lane * laneHeight;
      const duplicateOffset = nodes.length > 1 ? (index === 0 ? 20 : 120) : 68;

      if (["start", "end", "intermediateTimer", "intermediateMessage"].includes(node.type)) {
        bounds.set(node.id, { x, y: laneTop + duplicateOffset + 18, width: 36, height: 36 });
      } else if (["exclusiveGateway", "parallelGateway"].includes(node.type)) {
        bounds.set(node.id, { x, y: laneTop + duplicateOffset + 10, width: 50, height: 50 });
      } else if (node.type === "subProcess") {
        bounds.set(node.id, { x, y: laneTop + duplicateOffset, width: 150, height: 86 });
      } else {
        bounds.set(node.id, { x, y: laneTop + duplicateOffset + 5, width: 140, height: 74 });
      }
    });
  });

  workflow.nodes.filter((node) => node.attachedTo).forEach((node) => {
    const parent = bounds.get(node.attachedTo!);
    if (!parent) throw new Error(`Élément d’attache inconnu : ${node.attachedTo}`);
    bounds.set(node.id, {
      x: parent.x + parent.width - 18,
      y: parent.y + parent.height - 15,
      width: 30,
      height: 30,
    });
  });

  return bounds;
}

function renderNode(
  node: WorkflowNode,
  processKey: string,
  incoming: Map<string, string[]>,
  outgoing: Map<string, string[]>,
) {
  const id = elementId(processKey, node.id);
  const refs = [
    ...(incoming.get(node.id) ?? []).map((flow) => `      <bpmn:incoming>${flow}</bpmn:incoming>`),
    ...(outgoing.get(node.id) ?? []).map((flow) => `      <bpmn:outgoing>${flow}</bpmn:outgoing>`),
  ].join("\n");
  const name = xmlEscape(node.name);

  if (node.type === "start") {
    return `    <bpmn:startEvent id="${id}" name="${name}">\n${refs}\n    </bpmn:startEvent>`;
  }
  if (node.type === "end") {
    return `    <bpmn:endEvent id="${id}" name="${name}">\n${refs}\n    </bpmn:endEvent>`;
  }
  if (node.type === "intermediateTimer") {
    return `    <bpmn:intermediateCatchEvent id="${id}" name="${name}">\n${refs}\n      <bpmn:timerEventDefinition id="Definition_temps_${id}" />\n    </bpmn:intermediateCatchEvent>`;
  }
  if (node.type === "intermediateMessage") {
    return `    <bpmn:intermediateCatchEvent id="${id}" name="${name}">\n${refs}\n      <bpmn:messageEventDefinition id="Definition_message_${id}" messageRef="Message_${processKey}" />\n    </bpmn:intermediateCatchEvent>`;
  }
  if (node.type === "boundaryError" || node.type === "boundaryTimer") {
    const definition = node.type === "boundaryError"
      ? `<bpmn:errorEventDefinition id="Definition_erreur_${id}" errorRef="Erreur_${processKey}" />`
      : `<bpmn:timerEventDefinition id="Definition_temps_${id}" />`;
    return `    <bpmn:boundaryEvent id="${id}" name="${name}" attachedToRef="${elementId(processKey, node.attachedTo!)}" cancelActivity="true">\n${refs}\n      ${definition}\n    </bpmn:boundaryEvent>`;
  }
  if (node.type === "subProcess") {
    const start = `Debut_interne_${id}`;
    const task = `Etapes_internes_${id}`;
    const end = `Fin_interne_${id}`;
    const flow1 = `Flux_interne_1_${id}`;
    const flow2 = `Flux_interne_2_${id}`;
    return `    <bpmn:subProcess id="${id}" name="${name}">\n${refs}
      <bpmn:startEvent id="${start}"><bpmn:outgoing>${flow1}</bpmn:outgoing></bpmn:startEvent>
      <bpmn:task id="${task}" name="Exécuter les étapes détaillées"><bpmn:incoming>${flow1}</bpmn:incoming><bpmn:outgoing>${flow2}</bpmn:outgoing></bpmn:task>
      <bpmn:endEvent id="${end}"><bpmn:incoming>${flow2}</bpmn:incoming></bpmn:endEvent>
      <bpmn:sequenceFlow id="${flow1}" sourceRef="${start}" targetRef="${task}" />
      <bpmn:sequenceFlow id="${flow2}" sourceRef="${task}" targetRef="${end}" />
    </bpmn:subProcess>`;
  }

  const tag = typeTag(node.type);
  if (!tag) throw new Error(`Type BPMN non pris en charge : ${node.type}`);
  return `    <bpmn:${tag} id="${id}" name="${name}">\n${refs}\n    </bpmn:${tag}>`;
}

function edgeWaypoints(source: Bounds, target: Bounds) {
  const sourceX = source.x + source.width;
  const sourceY = source.y + source.height / 2;
  const targetX = target.x;
  const targetY = target.y + target.height / 2;

  if (targetX > sourceX + 15) {
    if (Math.abs(sourceY - targetY) < 4) return [[sourceX, sourceY], [targetX, targetY]];
    const middleX = sourceX + (targetX - sourceX) / 2;
    return [[sourceX, sourceY], [middleX, sourceY], [middleX, targetY], [targetX, targetY]];
  }

  const loopY = Math.max(source.y + source.height, target.y + target.height) + 34;
  return [[sourceX, sourceY], [sourceX + 28, sourceY], [sourceX + 28, loopY], [targetX - 28, loopY], [targetX - 28, targetY], [targetX, targetY]];
}

function makeBpmn(processDefinition: (typeof processesSeed)[number], workflow: WorkflowSpec) {
  const processKey = safeId(processDefinition.slug);
  const processId = `Processus_${processKey}`;
  const maxColumn = Math.max(...workflow.nodes.map((node) => node.column), ...workflow.documents.map((document) => document.column));
  const planeWidth = 190 + (maxColumn + 1) * columnWidth;
  const bounds = nodeBounds(workflow);
  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();

  const flowIds = workflow.flows.map((flow, index) => {
    const id = `Flux_${index + 1}_${processKey}`;
    incoming.set(flow.to, [...(incoming.get(flow.to) ?? []), id]);
    outgoing.set(flow.from, [...(outgoing.get(flow.from) ?? []), id]);
    return id;
  });

  const lanes = workflow.roles.map((role, laneIndex) => {
    const laneNodes = workflow.nodes
      .filter((node) => node.lane === laneIndex)
      .map((node) => `        <bpmn:flowNodeRef>${elementId(processKey, node.id)}</bpmn:flowNodeRef>`)
      .join("\n");
    return `      <bpmn:lane id="Couloir_${laneIndex + 1}_${processKey}" name="${xmlEscape(role)}">\n${laneNodes}\n      </bpmn:lane>`;
  }).join("\n");

  const nodes = workflow.nodes.map((node) => renderNode(node, processKey, incoming, outgoing)).join("\n");
  const sequenceFlows = workflow.flows.map((flow, index) => {
    const label = flow.label ? ` name="${xmlEscape(flow.label)}"` : "";
    return `    <bpmn:sequenceFlow id="${flowIds[index]}"${label} sourceRef="${elementId(processKey, flow.from)}" targetRef="${elementId(processKey, flow.to)}" />`;
  }).join("\n");

  const documents = workflow.documents.map((document) => {
    const objectId = `Objet_${safeId(document.id)}_${processKey}`;
    const referenceId = `Document_${safeId(document.id)}_${processKey}`;
    return `    <bpmn:dataObject id="${objectId}" />
    <bpmn:dataObjectReference id="${referenceId}" name="${xmlEscape(document.name)}" dataObjectRef="${objectId}" />
    <bpmn:association id="Association_${safeId(document.id)}_${processKey}" sourceRef="${referenceId}" targetRef="${elementId(processKey, document.linkedTo)}" associationDirection="One" />`;
  }).join("\n");

  const laneShapes = workflow.roles.map((_, laneIndex) =>
    `      <bpmndi:BPMNShape id="Forme_Couloir_${laneIndex + 1}_${processKey}" bpmnElement="Couloir_${laneIndex + 1}_${processKey}" isHorizontal="true"><dc:Bounds x="20" y="${30 + laneIndex * laneHeight}" width="${planeWidth}" height="${laneHeight}" /></bpmndi:BPMNShape>`,
  ).join("\n");

  const nodeShapes = workflow.nodes.map((node) => {
    const box = bounds.get(node.id)!;
    const expanded = node.type === "subProcess" ? " isExpanded=\"false\"" : "";
    const marker = ["exclusiveGateway", "parallelGateway"].includes(node.type) ? " isMarkerVisible=\"true\"" : "";
    return `      <bpmndi:BPMNShape id="Forme_${elementId(processKey, node.id)}" bpmnElement="${elementId(processKey, node.id)}"${expanded}${marker}><dc:Bounds x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" /></bpmndi:BPMNShape>`;
  }).join("\n");

  const documentShapes = workflow.documents.map((document) => {
    const linked = bounds.get(document.linkedTo)!;
    const x = linked.x + linked.width - 20;
    const laneBottom = 30 + (document.lane + 1) * laneHeight;
    const y = Math.min(linked.y + linked.height + 12, laneBottom - 58);
    return `      <bpmndi:BPMNShape id="Forme_Document_${safeId(document.id)}_${processKey}" bpmnElement="Document_${safeId(document.id)}_${processKey}"><dc:Bounds x="${x}" y="${y}" width="36" height="48" /></bpmndi:BPMNShape>`;
  }).join("\n");

  const flowEdges = workflow.flows.map((flow, index) => {
    const source = bounds.get(flow.from)!;
    const target = bounds.get(flow.to)!;
    const waypoints = edgeWaypoints(source, target)
      .map(([x, y]) => `<di:waypoint x="${Math.round(x)}" y="${Math.round(y)}" />`)
      .join("");
    const label = flow.label
      ? `<bpmndi:BPMNLabel><dc:Bounds x="${Math.round((source.x + target.x) / 2)}" y="${Math.round(Math.min(source.y, target.y) - 20)}" width="70" height="18" /></bpmndi:BPMNLabel>`
      : "";
    return `      <bpmndi:BPMNEdge id="Arete_${flowIds[index]}" bpmnElement="${flowIds[index]}">${waypoints}${label}</bpmndi:BPMNEdge>`;
  }).join("\n");

  const associationEdges = workflow.documents.map((document) => {
    const linked = bounds.get(document.linkedTo)!;
    const docX = linked.x + linked.width - 2;
    const laneBottom = 30 + (document.lane + 1) * laneHeight;
    const docY = Math.min(linked.y + linked.height + 36, laneBottom - 34);
    return `      <bpmndi:BPMNEdge id="Arete_Association_${safeId(document.id)}_${processKey}" bpmnElement="Association_${safeId(document.id)}_${processKey}"><di:waypoint x="${docX}" y="${docY}" /><di:waypoint x="${linked.x + linked.width / 2}" y="${linked.y + linked.height}" /></bpmndi:BPMNEdge>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_${processKey}" targetNamespace="https://sen-bpmn.org/processus">
  <bpmn:message id="Message_${processKey}" name="Message métier" />
  <bpmn:error id="Erreur_${processKey}" name="Exception de processus" errorCode="EXCEPTION" />
  <bpmn:process id="${processId}" name="${xmlEscape(processDefinition.title)}" isExecutable="false">
    <bpmn:documentation>${xmlEscape(processDefinition.description)} Révision du modèle : ${workflow.revision}.</bpmn:documentation>
    <bpmn:laneSet id="Ensemble_couloirs_${processKey}">
${lanes}
    </bpmn:laneSet>
${nodes}
${sequenceFlows}
${documents}
  </bpmn:process>
  <bpmndi:BPMNDiagram id="Diagramme_${processKey}">
    <bpmndi:BPMNPlane id="Plan_${processKey}" bpmnElement="${processId}">
${laneShapes}
${nodeShapes}
${documentShapes}
${flowEdges}
${associationEdges}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;
}

async function main() {
  await mkdir(outputDirectory, { recursive: true });

  const generated = processesSeed.map((processDefinition) => {
    const workflow = workflowsByProcess[processDefinition.slug];
    if (!workflow) throw new Error(`Workflow manquant : ${processDefinition.slug}`);
    return { processDefinition, workflow, xml: makeBpmn(processDefinition, workflow) };
  });

  await Promise.all(
    generated.map(({ processDefinition, xml }) =>
      writeFile(
        path.join(outputDirectory, `${processDefinition.slug}.bpmn`),
        xml,
        "utf8",
      ),
    ),
  );

  const manifest = {
    schemaVersion: 1,
    generatedFrom: ["lib/catalog-data.ts", "lib/workflow-data.ts", "lib/traceability-data.ts"],
    processes: generated
      .map(({ processDefinition, workflow, xml }) => {
        const governance = governanceByProcess[processDefinition.slug];
        if (!governance) throw new Error(`Traçabilité manquante : ${processDefinition.slug}`);
        return {
          slug: processDefinition.slug,
          title: processDefinition.title,
          file: `${processDefinition.slug}.bpmn`,
          modelVersion: processDefinition.version,
          workflowRevision: workflow.revision,
          validationStatus: governance.validationStatus,
          validationDate: governance.validationDate,
          lastUpdated: governance.lastUpdated,
          nodeCount: workflow.nodes.length,
          laneCount: workflow.roles.length,
          sha256: createHash("sha256").update(xml).digest("hex"),
        };
      })
      .sort((left, right) => left.slug.localeCompare(right.slug, "fr")),
  };

  await writeFile(
    path.join(outputDirectory, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  console.log(`${processesSeed.length} fichiers BPMN enrichis et leur manifeste générés dans ${outputDirectory}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
