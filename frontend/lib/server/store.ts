import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import type { OrderRecord } from "@/lib/orders/types";
import {
  DEFAULT_SHIPPING_SETTINGS,
  type ShippingSettings,
} from "@/lib/shipping/settings";
import type { PricingOverrides } from "@/lib/products/admin-storage";
import type {
  Banner,
  HomepageContent,
  LandingPage,
  AdminProductData,
  CmsProductRecord,
  AnnouncementBarConfig,
} from "@/lib/admin/types";
import { DEFAULT_ANNOUNCEMENT_BAR, normalizeAnnouncementBar } from "@/lib/admin/announcement-bar";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/admin/types";

export interface PersistedStore {
  version: 1;
  orders: OrderRecord[];
  shippingSettings: ShippingSettings;
  pricingOverrides: PricingOverrides;
  productOverrides: AdminProductData[];
  cmsProducts: CmsProductRecord[];
  hiddenCatalogIds: string[];
  featuredProductSlugs: string[];
  productOrder: string[];
  landingPages: LandingPage[];
  homepageContent: HomepageContent;
  banners: Banner[];
  announcementBar: AnnouncementBarConfig;
}

const STORE_PATH = path.join(process.cwd(), "data", "store.json");

const DEFAULT_STORE: PersistedStore = {
  version: 1,
  orders: [],
  shippingSettings: DEFAULT_SHIPPING_SETTINGS,
  pricingOverrides: {},
  productOverrides: [],
  cmsProducts: [],
  hiddenCatalogIds: [],
  featuredProductSlugs: [],
  productOrder: [],
  landingPages: [],
  homepageContent: DEFAULT_HOMEPAGE_CONTENT,
  banners: [],
  announcementBar: DEFAULT_ANNOUNCEMENT_BAR,
};

async function ensureDir() {
  const dir = path.dirname(STORE_PATH);
  await fs.mkdir(dir, { recursive: true });
}

export async function readStore(): Promise<PersistedStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<PersistedStore>;
    return {
      ...DEFAULT_STORE,
      ...parsed,
      orders: Array.isArray(parsed.orders) ? (parsed.orders as OrderRecord[]) : [],
      shippingSettings:
        (parsed.shippingSettings as ShippingSettings | undefined) ??
        DEFAULT_SHIPPING_SETTINGS,
      pricingOverrides:
        (parsed.pricingOverrides as PricingOverrides | undefined) ?? {},
      productOverrides: Array.isArray(parsed.productOverrides)
        ? (parsed.productOverrides as AdminProductData[])
        : [],
      cmsProducts: Array.isArray(parsed.cmsProducts)
        ? (parsed.cmsProducts as CmsProductRecord[])
        : [],
      hiddenCatalogIds: Array.isArray(parsed.hiddenCatalogIds)
        ? (parsed.hiddenCatalogIds as string[])
        : [],
      featuredProductSlugs: Array.isArray(parsed.featuredProductSlugs)
        ? (parsed.featuredProductSlugs as string[])
        : [],
      productOrder: Array.isArray(parsed.productOrder)
        ? (parsed.productOrder as string[])
        : [],
      landingPages: Array.isArray(parsed.landingPages)
        ? (parsed.landingPages as LandingPage[])
        : [],
      homepageContent:
        (parsed.homepageContent as HomepageContent | undefined) ??
        DEFAULT_HOMEPAGE_CONTENT,
      banners: Array.isArray(parsed.banners) ? (parsed.banners as Banner[]) : [],
      announcementBar:
        parsed.announcementBar != null
          ? normalizeAnnouncementBar(
              parsed.announcementBar as Partial<AnnouncementBarConfig>,
            )
          : DEFAULT_ANNOUNCEMENT_BAR,
    };
  } catch {
    return DEFAULT_STORE;
  }
}

async function writeStore(next: PersistedStore): Promise<void> {
  await ensureDir();
  const tmp = `${STORE_PATH}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
  await fs.rename(tmp, STORE_PATH);
}

export async function updateStore(
  fn: (prev: PersistedStore) => PersistedStore,
): Promise<PersistedStore> {
  const prev = await readStore();
  const next = fn(prev);
  await writeStore(next);
  return next;
}

