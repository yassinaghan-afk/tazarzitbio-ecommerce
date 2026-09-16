import type { MetadataRoute } from "next";

import {
  AMLOU_ROYAL_PATH,
  AMLOU_ROYAL_SHOP_PATH,
  AMLOU_ROYAL_SLUG,
  getProductShopPath,
} from "@/lib/products/amlou-royal";
import { toPublicProduct } from "@/lib/products/catalog";
import { getMergedCatalog } from "@/lib/products/cms-catalog";
import { getListingProducts } from "@/lib/products/listing";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tazarzitbio.com"
).replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const catalog = await getMergedCatalog();
  const listing = getListingProducts(catalog.map(toPublicProduct));

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}${AMLOU_ROYAL_SHOP_PATH}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}${AMLOU_ROYAL_PATH}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/royalfr`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guide`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/guide/amlou`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/guide/huile-argan`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/guide/miel-naturel-maroc`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
  ];

  const productEntries: MetadataRoute.Sitemap = listing
    .filter((p) => p.slug !== AMLOU_ROYAL_SLUG)
    .map((p) => ({
      url: `${SITE_URL}${getProductShopPath(p.slug)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

  let landingEntries: MetadataRoute.Sitemap = [];
  try {
    const { readStore } = await import("@/lib/server/store");
    const store = await readStore();
    landingEntries = (store.landingPages ?? [])
      .filter((page) => page.isEnabled)
      .map((page) => ({
        url: `${SITE_URL}/lp/${page.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.65,
      }));
  } catch {
    landingEntries = [];
  }

  return [...staticEntries, ...productEntries, ...landingEntries];
}
