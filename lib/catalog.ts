import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  getProcessSummary,
  getProcessesByCategory,
} from "@/lib/catalog-store";
import type { ProcessDetail } from "@/lib/types";

export async function readProcessXml(fileName: string) {
  const safeFileName = path.basename(fileName);
  const bpmnDirectory = process.env.SEN_BPMN_BPMN_DIR
    ? path.resolve(process.env.SEN_BPMN_BPMN_DIR)
    : path.join(process.cwd(), "data", "bpmn");
  return readFile(path.join(bpmnDirectory, safeFileName), "utf8");
}

export async function getProcessDetail(slug: string): Promise<ProcessDetail | null> {
  const process = getProcessSummary(slug);
  if (!process) return null;

  const [xml, categoryProcesses] = await Promise.all([
    readProcessXml(process.fileName),
    Promise.resolve(getProcessesByCategory(process.category.slug)),
  ]);

  return {
    ...process,
    xml,
    related: categoryProcesses.filter((item) => item.slug !== slug).slice(0, 3),
  };
}
