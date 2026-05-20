import type { Product } from "./types";

const VARIANT_CONFIG = [
  { parentSlug: "almond-amlou", offerId: "almond-500", slug: "almond-amlou-500g" },
  { parentSlug: "almond-amlou", offerId: "almond-750", slug: "almond-amlou-750g" },
  { parentSlug: "pistachio-amlou", offerId: "pistachio-500", slug: "pistachio-amlou-500g" },
  { parentSlug: "pistachio-amlou", offerId: "pistachio-750", slug: "pistachio-amlou-750g" },
  { parentSlug: "argan-oil", offerId: "argan-500", slug: "argan-oil-500g" },
] as const;

export function expandCatalogWithVariants(catalog: Product[]): Product[] {
  const bySlug = new Map(catalog.map((p) => [p.slug, p]));
  const variants: Product[] = [];

  for (const cfg of VARIANT_CONFIG) {
    const parent = bySlug.get(cfg.parentSlug);
    const offer = parent?.offers.find((o) => o.id === cfg.offerId);
    if (!parent || !offer) continue;

    variants.push({
      ...parent,
      id: `${parent.id}--${cfg.slug}`,
      slug: cfg.slug,
      nameAr: `${parent.nameAr} — ${offer.label}`,
      weight: offer.weight,
      price: offer.economics.salePrice,
      offers: [offer],
      relatedSlugs: [
        cfg.parentSlug,
        ...parent.relatedSlugs.filter((s) => s !== cfg.slug),
      ].slice(0, 4),
    });
  }

  const nuts = bySlug.get("mixed-nuts-honey");
  if (nuts) {
    variants.push({
      ...nuts,
      id: "mixed-nuts",
      slug: "mixed-nuts",
      relatedSlugs: nuts.relatedSlugs,
    });
  }

  return [...catalog, ...variants];
}
