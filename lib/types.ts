export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  sortOrder: number;
  processCount: number;
};

export type ProcessSummary = {
  id: number;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  owner: string;
  audience: string;
  duration: string;
  version: string;
  tags: string[];
  fileName: string;
  nodeCount: number;
  laneCount: number;
  workflowRevision: string;
  facilityTypes: string[];
  careLevel: string;
  territorialScope: string;
  validationStatus: ValidationStatus;
  validationDate: string | null;
  lastUpdated: string;
  sources: SourceReference[];
  contributors: Contributor[];
  category: Category;
};

export type ProcessDetail = ProcessSummary & {
  xml: string;
  related: ProcessSummary[];
};

export type CategorySeed = Omit<Category, "id" | "processCount">;

export type ProcessSeed = Omit<
  ProcessSummary,
  | "id"
  | "category"
  | "tags"
  | "fileName"
  | "nodeCount"
  | "laneCount"
  | "workflowRevision"
  | "facilityTypes"
  | "careLevel"
  | "territorialScope"
  | "validationStatus"
  | "validationDate"
  | "lastUpdated"
  | "sources"
  | "contributors"
> & {
  categorySlug: string;
  tags: string[];
  steps: [string, string, string];
  decision: string;
  yesLabel: string;
  noLabel: string;
  yesStep: string;
  noStep: string;
  finalStep: string;
};

export type ValidationStatus = "brouillon" | "en_relecture" | "valide";

export type SourceReference = {
  title: string;
  organization: string;
  url: string;
  year: string;
};

export type Contributor = {
  name: string;
  role: string;
};

export type ProcessGovernance = {
  facilityTypes: string[];
  careLevel: string;
  territorialScope: string;
  validationStatus: ValidationStatus;
  validationDate: string | null;
  lastUpdated: string;
  sources: SourceReference[];
  contributors: Contributor[];
};

export type WorkflowNodeType =
  | "start"
  | "end"
  | "task"
  | "userTask"
  | "manualTask"
  | "serviceTask"
  | "exclusiveGateway"
  | "parallelGateway"
  | "intermediateTimer"
  | "intermediateMessage"
  | "subProcess"
  | "boundaryError"
  | "boundaryTimer";

export type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  name: string;
  lane: number;
  column: number;
  attachedTo?: string;
};

export type WorkflowFlow = {
  from: string;
  to: string;
  label?: string;
};

export type WorkflowDocument = {
  id: string;
  name: string;
  linkedTo: string;
  lane: number;
  column: number;
};

export type WorkflowSpec = {
  revision: string;
  roles: string[];
  nodes: WorkflowNode[];
  flows: WorkflowFlow[];
  documents: WorkflowDocument[];
};
