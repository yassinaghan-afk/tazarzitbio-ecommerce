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

const aiAllow = ["/", "/about", "/guide", "/amlou", "/llms.txt", "/sitemap.xml"];

const aiAgents = [
  "GPTBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Google-Extended",
  "ClaudeBot",
  "anthropic-ai",
  "Amazonbot",
  "Bytespider",
  "CCBot",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      ...aiAgents.map((userAgent) => ({
        userAgent,
        allow: aiAllow,
        disallow,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
