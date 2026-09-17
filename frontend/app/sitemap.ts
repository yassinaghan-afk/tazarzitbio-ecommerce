import type { MetadataRoute } from "next";

import type { Language } from "@/lib/i18n/types";
import {
  AMLOU_ROYAL_PATH,
  AMLOU_ROYAL_SHOP_PATH,
  AMLOU_ROYAL_SLUG,
  getProductShopPath,
} from "@/lib/products/amlou-royal";
import { toPublicProduct } from "@/lib/products/catalog";
import { getMergedCatalog } from "@/lib/products/cms-catalog";
import { getListingProducts } from "@/lib/products/listing";
import { AMLOU_CITIES, amlouCityPath } from "@/lib/seo/amlou-cities";
import { SITE_URL, SEO_LOCALES, localizedPath } from "@/lib/seo/locale";
import { TOURIST_HUB_PATH } from "@/lib/seo/tourist-hub";

function entry(
  path: string,
  locale: Language,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  now: Date,
): MetadataRoute.Sitemap[number] {
  const loc = localizedPath(locale, path);
  return {
    url: loc === "/" ? SITE_URL : `${SITE_URL}${loc}`,
    lastModified: now,
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const catalog = await getMergedCatalog();
  const listing = getListingProducts(catalog.map(toPublicProduct));

  const bareStatic = [
    { path: "/", priority: 1, freq: "daily" as const },
    { path: "/products", priority: 0.9, freq: "daily" as const },
    { path: "/about", priority: 0.85, freq: "monthly" as const },
    { path: AMLOU_ROYAL_SHOP_PATH, priority: 0.95, freq: "weekly" as const },
    { path: "/amlou", priority: 0.95, freq: "weekly" as const },
    { path: TOURIST_HUB_PATH, priority: 0.9, freq: "weekly" as const },
    { path: "/guide", priority: 0.75, freq: "monthly" as const },
    { path: "/guide/amlou", priority: 0.8, freq: "monthly" as const },
    { path: "/guide/huile-argan", priority: 0.75, freq: "monthly" as const },
    {
      path: "/guide/miel-naturel-maroc",
      priority: 0.75,
      freq: "monthly" as const,
    },
  ];

  const staticEntries: MetadataRoute.Sitemap = [];
  for (const item of bareStatic) {
    for (const locale of SEO_LOCALES) {
      if (item.path.startsWith("/guide") && locale !== "ar") continue;
      staticEntries.push(
        entry(item.path, locale, item.priority, item.freq, now),
      );
    }
  }

  staticEntries.push({
    url: `${SITE_URL}${AMLOU_ROYAL_PATH}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  });
  staticEntries.push({
    url: `${SITE_URL}/royalfr`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  });

  const productEntries: MetadataRoute.Sitemap = [];
  for (const p of listing.filter((x) => x.slug !== AMLOU_ROYAL_SLUG)) {
    const path = getProductShopPath(p.slug);
    for (const locale of SEO_LOCALES) {
      productEntries.push(entry(path, locale, 0.85, "weekly", now));
    }
  }

  const cityEntries: MetadataRoute.Sitemap = [];
  for (const city of AMLOU_CITIES) {
    const path = amlouCityPath(city.slug);
    for (const locale of SEO_LOCALES) {
      cityEntries.push(entry(path, locale, 0.72, "monthly", now));
    }
  }

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

  return [
    ...staticEntries,
    ...productEntries,
    ...cityEntries,
    ...landingEntries,
  ];
}
