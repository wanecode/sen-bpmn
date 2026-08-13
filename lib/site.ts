const fallbackUrl = "http://localhost:3000";

function normalizeSiteUrl(value: string | undefined) {
  try {
    return new URL(value || fallbackUrl).toString().replace(/\/$/, "");
  } catch {
    return fallbackUrl;
  }
}

function vercelUrl() {
  const hostname = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return hostname ? `https://${hostname}` : undefined;
}

export const siteConfig = {
  name: "SenBPMN",
  description: "Bibliothèque ouverte des processus hospitaliers sénégalais au format BPMN.",
  url: normalizeSiteUrl(process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? vercelUrl()),
};
