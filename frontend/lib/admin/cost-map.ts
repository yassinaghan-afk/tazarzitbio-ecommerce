import type { PersistedStore } from "@/lib/server/store";
import { getMergedCatalog } from "@/lib/products/cms-catalog";

/** Build productId → unit costPrice from catalog + CMS. */
export async function buildUnitCostMap(
  store?: PersistedStore,
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  try {
    const catalog = await getMergedCatalog();
    for (const product of catalog) {
      const lowest = [...product.offers].sort(
        (a, b) => a.economics.salePrice - b.economics.salePrice,
      )[0];
      if (lowest) {
        map.set(product.id, lowest.economics.costPrice ?? 0);
      }
      for (const offer of product.offers) {
        map.set(`${product.id}:${offer.id}`, offer.economics.costPrice ?? 0);
      }
    }
  } catch {
    /* fall through */
  }
  if (store) {
    for (const p of store.cmsProducts) {
      for (const o of p.offers ?? []) {
        if (typeof o.costPrice === "number") {
          map.set(p.id, Math.min(map.get(p.id) ?? o.costPrice, o.costPrice));
          map.set(`${p.id}:${o.id}`, o.costPrice);
        }
      }
    }
  }
  return map;
}

export function lineUnitCost(
  map: Map<string, number>,
  productId: string,
  offerId?: string,
): number {
  if (offerId) {
    const keyed = map.get(`${productId}:${offerId}`);
    if (typeof keyed === "number") return keyed;
  }
  return map.get(productId) ?? 0;
}
