import type { MetadataRoute } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tazarzitbio.com"
).replace(/\/$/, "");

const disallow = [
  "/admin",
  "/admin/",
  "/api/",
  "/thank-you",
  "/upsell",
  "/royal/thank-you",
  "/royalfr/thank-you",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/guide", "/llms.txt", "/sitemap.xml"],
        disallow,
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/guide", "/llms.txt", "/sitemap.xml"],
        disallow,
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/guide", "/llms.txt", "/sitemap.xml"],
        disallow,
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/guide", "/llms.txt", "/sitemap.xml"],
        disallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
