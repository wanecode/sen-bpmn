import * as sqliteCatalog from "@/lib/db";
import * as staticCatalog from "@/lib/static-catalog";

const catalog = process.env.SEN_BPMN_STORAGE === "sqlite" ? sqliteCatalog : staticCatalog;

export const getCategories = catalog.getCategories;
export const getAllProcesses = catalog.getAllProcesses;
export const getProcessSummary = catalog.getProcessSummary;
export const getProcessesByCategory = catalog.getProcessesByCategory;
export const getCategory = catalog.getCategory;
