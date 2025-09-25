import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
