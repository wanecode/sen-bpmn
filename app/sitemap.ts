import type { MetadataRoute } from "next";
import { getAllProcesses, getCategories } from "@/lib/catalog-store";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/a-propos`, changeFrequency: "monthly", priority: 0.6 },
    ...getCategories().map((category) => ({ url: `${baseUrl}/categories/${category.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...getAllProcesses().map((process) => ({ url: `${baseUrl}/processus/${process.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
