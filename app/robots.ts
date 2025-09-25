import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined;
  const appUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? vercelUrl ?? "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [`${appUrl}/sitemap.xml`],
  };
}
