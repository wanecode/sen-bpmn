import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { categoriesSeed, processesSeed } from "@/lib/catalog-data";
import { governanceByProcess } from "@/lib/traceability-data";
import { workflowsByProcess } from "@/lib/workflow-data";
import type { Category, ProcessSummary, ValidationStatus } from "@/lib/types";

const dataDirectory = process.env.SEN_BPMN_DATA_DIR
  ? path.resolve(process.env.SEN_BPMN_DATA_DIR)
  : path.join(process.cwd(), "data");
const databasePath = process.env.SEN_BPMN_DATABASE_PATH
  ? path.resolve(process.env.SEN_BPMN_DATABASE_PATH)
  : path.join(dataDirectory, "catalogue.sqlite");

type CatalogRow = {
  id: number;
  slug: string;
  title: string;
  short_title: string;
  description: string;
  owner: string;
  audience: string;
  duration: string;
  version: string;
  tags: string;
  file_name: string;
  node_count: number;
  lane_count: number;
  workflow_revision: string;
  facility_types: string;
  care_level: string;
  territorial_scope: string;
  validation_status: ValidationStatus;
  validation_date: string | null;
  last_updated: string;
  sources: string;
  contributors: string;
  category_id: number;
  category_slug: string;
  category_name: string;
  category_description: string;
  category_color: string;
  category_icon: string;
  category_sort_order: number;
  process_count: number;
};

type CategoryRow = {
  id: number;
  slug: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  sort_order: number;
  process_count: number;
};

function initializeDatabase() {
  mkdirSync(dataDirectory, { recursive: true });
  mkdirSync(path.dirname(databasePath), { recursive: true });
  const database = new Database(databasePath);
  database.pragma("journal_mode = WAL");
  database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS processes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      short_title TEXT NOT NULL,
      description TEXT NOT NULL,
      owner TEXT NOT NULL,
      audience TEXT NOT NULL,
      duration TEXT NOT NULL,
      version TEXT NOT NULL,
      tags TEXT NOT NULL,
      file_name TEXT NOT NULL,
      node_count INTEGER NOT NULL DEFAULT 10,
      lane_count INTEGER NOT NULL DEFAULT 0,
      workflow_revision TEXT NOT NULL DEFAULT '1.0',
      facility_types TEXT NOT NULL DEFAULT '[]',
      care_level TEXT NOT NULL DEFAULT '',
      territorial_scope TEXT NOT NULL DEFAULT '',
      validation_status TEXT NOT NULL DEFAULT 'brouillon',
      validation_date TEXT,
      last_updated TEXT NOT NULL DEFAULT '',
      sources TEXT NOT NULL DEFAULT '[]',
      contributors TEXT NOT NULL DEFAULT '[]',
      category_id INTEGER NOT NULL REFERENCES categories(id)
    );
    CREATE INDEX IF NOT EXISTS idx_processes_category ON processes(category_id);
  `);

  const existingColumns = new Set(
    (database.prepare("PRAGMA table_info(processes)").all() as Array<{ name: string }>).map((column) => column.name),
  );
  const migrations: Record<string, string> = {
    lane_count: "INTEGER NOT NULL DEFAULT 0",
    workflow_revision: "TEXT NOT NULL DEFAULT '1.0'",
    facility_types: "TEXT NOT NULL DEFAULT '[]'",
    care_level: "TEXT NOT NULL DEFAULT ''",
    territorial_scope: "TEXT NOT NULL DEFAULT ''",
    validation_status: "TEXT NOT NULL DEFAULT 'brouillon'",
    validation_date: "TEXT",
    last_updated: "TEXT NOT NULL DEFAULT ''",
    sources: "TEXT NOT NULL DEFAULT '[]'",
    contributors: "TEXT NOT NULL DEFAULT '[]'",
  };
  Object.entries(migrations).forEach(([column, definition]) => {
    if (!existingColumns.has(column)) database.exec(`ALTER TABLE processes ADD COLUMN ${column} ${definition}`);
  });

  const syncCatalog = database.transaction(() => {
    const upsertCategory = database.prepare(`
      INSERT INTO categories (slug, name, description, color, icon, sort_order)
      VALUES (@slug, @name, @description, @color, @icon, @sortOrder)
      ON CONFLICT(slug) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        color = excluded.color,
        icon = excluded.icon,
        sort_order = excluded.sort_order
    `);
    categoriesSeed.forEach((category) => upsertCategory.run(category));

    const categoryIds = new Map<string, number>();
    const categoryRows = database.prepare("SELECT id, slug FROM categories").all() as Array<{
      id: number;
      slug: string;
    }>;
    categoryRows.forEach((category) => categoryIds.set(category.slug, category.id));

    const upsertProcess = database.prepare(`
      INSERT INTO processes (
        slug, title, short_title, description, owner, audience, duration,
        version, tags, file_name, node_count, lane_count, workflow_revision,
        facility_types, care_level, territorial_scope, validation_status,
        validation_date, last_updated, sources, contributors, category_id
      ) VALUES (
        @slug, @title, @shortTitle, @description, @owner, @audience, @duration,
        @version, @tags, @fileName, @nodeCount, @laneCount, @workflowRevision,
        @facilityTypes, @careLevel, @territorialScope, @validationStatus,
        @validationDate, @lastUpdated, @sources, @contributors, @categoryId
      )
      ON CONFLICT(slug) DO UPDATE SET
        title = excluded.title,
        short_title = excluded.short_title,
        description = excluded.description,
        owner = excluded.owner,
        audience = excluded.audience,
        duration = excluded.duration,
        version = excluded.version,
        tags = excluded.tags,
        file_name = excluded.file_name,
        node_count = excluded.node_count,
        lane_count = excluded.lane_count,
        workflow_revision = excluded.workflow_revision,
        facility_types = excluded.facility_types,
        care_level = excluded.care_level,
        territorial_scope = excluded.territorial_scope,
        validation_status = excluded.validation_status,
        validation_date = excluded.validation_date,
        last_updated = excluded.last_updated,
        sources = excluded.sources,
        contributors = excluded.contributors,
        category_id = excluded.category_id
    `);

    processesSeed.forEach((process) => {
      const categoryId = categoryIds.get(process.categorySlug);
      if (!categoryId) throw new Error(`Catégorie inconnue : ${process.categorySlug}`);
      const governance = governanceByProcess[process.slug];
      const workflow = workflowsByProcess[process.slug];
      if (!governance) throw new Error(`Traçabilité manquante : ${process.slug}`);
      if (!workflow) throw new Error(`Workflow manquant : ${process.slug}`);
      upsertProcess.run({
        ...process,
        tags: JSON.stringify(process.tags),
        fileName: `${process.slug}.bpmn`,
        nodeCount: workflow.nodes.length,
        laneCount: workflow.roles.length,
        workflowRevision: workflow.revision,
        facilityTypes: JSON.stringify(governance.facilityTypes),
        careLevel: governance.careLevel,
        territorialScope: governance.territorialScope,
        validationStatus: governance.validationStatus,
        validationDate: governance.validationDate,
        lastUpdated: governance.lastUpdated,
        sources: JSON.stringify(governance.sources),
        contributors: JSON.stringify(governance.contributors),
        categoryId,
      });
    });
  });

  syncCatalog();
  return database;
}

const globalDatabase = globalThis as typeof globalThis & {
  senBpmnDatabase?: Database.Database;
};

export function getDatabase() {
  if (!globalDatabase.senBpmnDatabase) {
    globalDatabase.senBpmnDatabase = initializeDatabase();
  }
  return globalDatabase.senBpmnDatabase;
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    color: row.color,
    icon: row.icon,
    sortOrder: row.sort_order,
    processCount: row.process_count,
  };
}

function mapProcess(row: CatalogRow): ProcessSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortTitle: row.short_title,
    description: row.description,
    owner: row.owner,
    audience: row.audience,
    duration: row.duration,
    version: row.version,
    tags: JSON.parse(row.tags) as string[],
    fileName: row.file_name,
    nodeCount: row.node_count,
    laneCount: row.lane_count,
    workflowRevision: row.workflow_revision,
    facilityTypes: JSON.parse(row.facility_types) as string[],
    careLevel: row.care_level,
    territorialScope: row.territorial_scope,
    validationStatus: row.validation_status,
    validationDate: row.validation_date,
    lastUpdated: row.last_updated,
    sources: JSON.parse(row.sources),
    contributors: JSON.parse(row.contributors),
    category: {
      id: row.category_id,
      slug: row.category_slug,
      name: row.category_name,
      description: row.category_description,
      color: row.category_color,
      icon: row.category_icon,
      sortOrder: row.category_sort_order,
      processCount: row.process_count,
    },
  };
}

const processQuery = `
  SELECT
    p.*,
    c.slug AS category_slug,
    c.name AS category_name,
    c.description AS category_description,
    c.color AS category_color,
    c.icon AS category_icon,
    c.sort_order AS category_sort_order,
    (SELECT COUNT(*) FROM processes cp WHERE cp.category_id = c.id) AS process_count
  FROM processes p
  JOIN categories c ON c.id = p.category_id
`;

export function getCategories(): Category[] {
  const rows = getDatabase().prepare(`
    SELECT c.*, COUNT(p.id) AS process_count
    FROM categories c
    LEFT JOIN processes p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY c.sort_order
  `).all() as CategoryRow[];
  return rows.map(mapCategory);
}

export function getAllProcesses(): ProcessSummary[] {
  const rows = getDatabase().prepare(`${processQuery} ORDER BY c.sort_order, p.title`).all() as CatalogRow[];
  return rows.map(mapProcess);
}

export function getProcessSummary(slug: string): ProcessSummary | null {
  const row = getDatabase().prepare(`${processQuery} WHERE p.slug = ?`).get(slug) as CatalogRow | undefined;
  return row ? mapProcess(row) : null;
}

export function getProcessesByCategory(categorySlug: string): ProcessSummary[] {
  const rows = getDatabase()
    .prepare(`${processQuery} WHERE c.slug = ? ORDER BY p.title`)
    .all(categorySlug) as CatalogRow[];
  return rows.map(mapProcess);
}

export function getCategory(slug: string): Category | null {
  const row = getDatabase().prepare(`
    SELECT c.*, COUNT(p.id) AS process_count
    FROM categories c
    LEFT JOIN processes p ON p.category_id = c.id
    WHERE c.slug = ?
    GROUP BY c.id
  `).get(slug) as CategoryRow | undefined;
  return row ? mapCategory(row) : null;
}
