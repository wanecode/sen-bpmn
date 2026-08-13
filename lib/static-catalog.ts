import { categoriesSeed, processesSeed } from "@/lib/catalog-data";
import { governanceByProcess } from "@/lib/traceability-data";
import type { Category, ProcessSummary } from "@/lib/types";
import { workflowsByProcess } from "@/lib/workflow-data";

const categories: Category[] = categoriesSeed.map((category, index) => ({
  ...category,
  id: index + 1,
  processCount: processesSeed.filter((process) => process.categorySlug === category.slug).length,
}));

const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));

const processes: ProcessSummary[] = processesSeed
  .map((process, index) => {
    const category = categoryBySlug.get(process.categorySlug);
    const governance = governanceByProcess[process.slug];
    const workflow = workflowsByProcess[process.slug];

    if (!category) throw new Error(`Catégorie inconnue : ${process.categorySlug}`);
    if (!governance) throw new Error(`Traçabilité manquante : ${process.slug}`);
    if (!workflow) throw new Error(`Workflow manquant : ${process.slug}`);

    return {
      id: index + 1,
      slug: process.slug,
      title: process.title,
      shortTitle: process.shortTitle,
      description: process.description,
      owner: process.owner,
      audience: process.audience,
      duration: process.duration,
      version: process.version,
      tags: process.tags,
      fileName: `${process.slug}.bpmn`,
      nodeCount: workflow.nodes.length,
      laneCount: workflow.roles.length,
      workflowRevision: workflow.revision,
      facilityTypes: governance.facilityTypes,
      careLevel: governance.careLevel,
      territorialScope: governance.territorialScope,
      validationStatus: governance.validationStatus,
      validationDate: governance.validationDate,
      lastUpdated: governance.lastUpdated,
      sources: governance.sources,
      contributors: governance.contributors,
      category,
    } satisfies ProcessSummary;
  })
  .sort((left, right) => {
    const categoryOrder = left.category.sortOrder - right.category.sortOrder;
    return categoryOrder || left.title.localeCompare(right.title, "fr");
  });

export function getCategories(): Category[] {
  return categories;
}

export function getAllProcesses(): ProcessSummary[] {
  return processes;
}

export function getProcessSummary(slug: string): ProcessSummary | null {
  return processes.find((process) => process.slug === slug) ?? null;
}

export function getProcessesByCategory(categorySlug: string): ProcessSummary[] {
  return processes.filter((process) => process.category.slug === categorySlug);
}

export function getCategory(slug: string): Category | null {
  return categoryBySlug.get(slug) ?? null;
}
