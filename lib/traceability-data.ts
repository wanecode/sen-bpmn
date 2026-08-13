import type { ProcessGovernance, SourceReference } from "@/lib/types";

const PNDSS: SourceReference = {
  title: "Plan national de développement sanitaire et social 2019–2028",
  organization: "Ministère de la Santé et de l’Action sociale du Sénégal",
  url: "https://www.sante.gouv.sn/publications/plan-national-de-d%C3%A9veloppement-sanitaire-et-social-2019-2028",
  year: "2019",
};

const REFORME_HOSPITALIERE: SourceReference = {
  title: "Réforme hospitalière — présentation des lois et décrets",
  organization: "République du Sénégal",
  url: "https://informationsanitaire.sec.gouv.sn/dataset/85ff71e8-9530-4c20-a733-c42994554368/resource/e7703018-99e5-44f3-b23f-b6596cc47a2a/download/reforme-hospitaliaire-presentation-lois-et-decret.pdf",
  year: "1998–2003",
};

const CARTE_SANITAIRE: SourceReference = {
  title: "Carte sanitaire du Sénégal",
  organization: "Ministère de la Santé et de l’Action sociale du Sénégal",
  url: "https://informationsanitaire.sec.gouv.sn/dataset/carte-sanitaire",
  year: "2019",
};

const IITT: SourceReference = {
  title: "Interagency Integrated Triage Tool",
  organization: "OMS, CICR et MSF",
  url: "https://www.who.int/tools/triage",
  year: "2024",
};

const EMERGENCY_TOOLKIT: SourceReference = {
  title: "Emergency Care Toolkit",
  organization: "Organisation mondiale de la Santé",
  url: "https://www.who.int/teams/integrated-health-services/clinical-services-and-systems/emergency-and-critical-care/emergency-care-toolkit",
  year: "2025",
};

const PATIENT_SAFETY: SourceReference = {
  title: "Patient safety",
  organization: "Organisation mondiale de la Santé",
  url: "https://www.who.int/news-room/fact-sheets/detail/patient-safety",
  year: "2023",
};

const MATERNAL_HEALTH: SourceReference = {
  title: "WHO recommendations on maternal health — 2e édition",
  organization: "Organisation mondiale de la Santé",
  url: "https://www.who.int/publications/b/59332",
  year: "2025",
};

const ANTENATAL_CARE: SourceReference = {
  title: "WHO recommendations on antenatal care for a positive pregnancy experience",
  organization: "Organisation mondiale de la Santé",
  url: "https://www.who.int/publications/i/item/9789241549912/",
  year: "2016–2022",
};

const LAB_QUALITY: SourceReference = {
  title: "Laboratory quality management system: handbook",
  organization: "Organisation mondiale de la Santé",
  url: "https://www.who.int/publications-detail-redirect/9789241548274",
  year: "2011",
};

const IMAGING_QUALITY: SourceReference = {
  title: "Quality systems for medical imaging",
  organization: "Organisation mondiale de la Santé",
  url: "https://www.who.int/publications-detail-redirect/quality-systems-for-medical-imaging",
  year: "2014",
};

const HAND_HYGIENE: SourceReference = {
  title: "Hand hygiene: why, how and when?",
  organization: "Organisation mondiale de la Santé",
  url: "https://www.who.int/publications/m/item/hand-hygiene-why-how-when",
  year: "2009",
};

const HEALTHCARE_WASTE: SourceReference = {
  title: "Health-care waste",
  organization: "Organisation mondiale de la Santé",
  url: "https://www.who.int/news-room/fact-sheets/detail/health-care-waste",
  year: "2024",
};

const SAFETY_SOLUTIONS: SourceReference = {
  title: "Patient safety solutions",
  organization: "Organisation mondiale de la Santé",
  url: "https://www.who.int/teams/integrated-health-services/patient-safety/research/patient-safety-solutions",
  year: "2007",
};

const common = {
  validationStatus: "brouillon" as const,
  validationDate: null,
  lastUpdated: "2026-08-13",
  contributors: [
    { name: "Équipe éditoriale SenBPMN", role: "Modélisation initiale" },
    { name: "À désigner par l’établissement", role: "Relecture et validation métier" },
  ],
};

function governance(
  facilityTypes: string[],
  careLevel: string,
  territorialScope: string,
  sources: SourceReference[],
): ProcessGovernance {
  return { ...common, facilityTypes, careLevel, territorialScope, sources };
}

const hospital = ["EPS de niveau 1", "EPS de niveau 2", "EPS de niveau 3", "Hôpital privé participant au service public"];
const ambulatory = ["Centre de santé", "EPS de niveau 1", "EPS de niveau 2", "EPS de niveau 3", "Clinique privée"];
const maternity = ["Centre de santé avec SONUB", "EPS avec SONUC", "Maternité privée autorisée"];

export const governanceByProcess: Record<string, ProcessGovernance> = {
  "accueil-triage-urgences": governance(hospital, "Secondaire et tertiaire", "Service d’urgences", [PNDSS, IITT, EMERGENCY_TOOLKIT]),
  "prise-en-charge-urgence-vitale": governance(hospital, "Secondaire et tertiaire", "Urgences, réanimation et plateau technique", [IITT, EMERGENCY_TOOLKIT, PATIENT_SAFETY]),
  "orientation-apres-urgences": governance(hospital, "Secondaire et tertiaire", "Établissement et réseau de référence", [REFORME_HOSPITALIERE, EMERGENCY_TOOLKIT, PNDSS]),
  "prise-rendez-vous-consultation": governance(ambulatory, "Primaire à tertiaire", "Établissement", [PNDSS, CARTE_SANITAIRE, PATIENT_SAFETY]),
  "consultation-externe": governance(ambulatory, "Primaire à tertiaire", "Unité de consultation", [PNDSS, REFORME_HOSPITALIERE, PATIENT_SAFETY]),
  "reference-contre-reference": governance(["Poste de santé", "Centre de santé", ...hospital], "Tous niveaux", "District, région et niveau national", [REFORME_HOSPITALIERE, CARTE_SANITAIRE, PNDSS]),
  "admission-hospitalisation": governance(hospital, "Secondaire et tertiaire", "Établissement", [REFORME_HOSPITALIERE, PATIENT_SAFETY, PNDSS]),
  "parcours-patient-hospitalise": governance(hospital, "Secondaire et tertiaire", "Unité d’hospitalisation", [REFORME_HOSPITALIERE, PATIENT_SAFETY, SAFETY_SOLUTIONS]),
  "sortie-hospitalisation": governance(hospital, "Secondaire et tertiaire", "Établissement et soins de proximité", [REFORME_HOSPITALIERE, SAFETY_SOLUTIONS, PNDSS]),
  "consultation-prenatale": governance(maternity, "Primaire à tertiaire", "District sanitaire", [ANTENATAL_CARE, MATERNAL_HEALTH, PNDSS]),
  "accouchement-voie-basse": governance(maternity, "Primaire à tertiaire selon le risque", "Maternité", [MATERNAL_HEALTH, PATIENT_SAFETY, PNDSS]),
  "urgence-obstetricale": governance(["Centre de santé avec SONUB", "EPS avec SONUC"], "Secondaire et tertiaire", "Réseau obstétrical de référence", [MATERNAL_HEALTH, EMERGENCY_TOOLKIT, PNDSS]),
  "demande-analyse-laboratoire": governance(["Centre de santé avec laboratoire", ...hospital], "Primaire à tertiaire", "Laboratoire et services prescripteurs", [LAB_QUALITY, PATIENT_SAFETY, PNDSS]),
  "circuit-prelevement-biologique": governance(["Poste ou centre de santé avec prélèvement", ...hospital], "Tous niveaux", "Site de prélèvement et laboratoire", [LAB_QUALITY, SAFETY_SOLUTIONS, PNDSS]),
  "demande-imagerie-medicale": governance(["Centre de santé équipé", ...hospital], "Secondaire et tertiaire", "Imagerie et services prescripteurs", [IMAGING_QUALITY, PATIENT_SAFETY, PNDSS]),
  "prescription-medicament": governance(ambulatory, "Tous niveaux", "Établissement", [PATIENT_SAFETY, SAFETY_SOLUTIONS, PNDSS]),
  "dispensation-medicaments": governance(["Pharmacie hospitalière", ...hospital], "Secondaire et tertiaire", "Pharmacie et unités de soins", [PATIENT_SAFETY, SAFETY_SOLUTIONS, PNDSS]),
  "reapprovisionnement-pharmacie": governance(["Dépôt de district", "Pharmacie hospitalière", ...hospital], "District à national", "Chaîne d’approvisionnement", [PNDSS, PATIENT_SAFETY, LAB_QUALITY]),
  "identification-patient": governance(["Poste de santé", "Centre de santé", ...hospital], "Tous niveaux", "Tout point de contact", [PATIENT_SAFETY, SAFETY_SOLUTIONS, REFORME_HOSPITALIERE]),
  "prise-en-charge-couverture-maladie": governance(ambulatory, "Tous niveaux", "Admissions, caisse et service social", [PNDSS, REFORME_HOSPITALIERE, CARTE_SANITAIRE]),
  "gestion-dossier-medical": governance(hospital, "Secondaire et tertiaire", "Établissement", [REFORME_HOSPITALIERE, PATIENT_SAFETY, PNDSS]),
  "hygiene-des-mains": governance(["Toute structure de santé"], "Tous niveaux", "Point de soin", [HAND_HYGIENE, PATIENT_SAFETY, PNDSS]),
  "gestion-dechets-soins": governance(["Toute structure de santé"], "Tous niveaux", "Site de soins et filière d’élimination", [HEALTHCARE_WASTE, PATIENT_SAFETY, PNDSS]),
  "declaration-evenement-indesirable": governance(["Toute structure de santé"], "Tous niveaux", "Établissement et gouvernance qualité", [PATIENT_SAFETY, SAFETY_SOLUTIONS, PNDSS]),
};
