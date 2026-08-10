import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import type { OrderRecord } from "@/lib/orders/types";
import {
  DEFAULT_SHIPPING_SETTINGS,
  FREE_SHIPPING_THRESHOLD_MAD,
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
import {
  DEFAULT_HOME_SECTIONS,
  DEFAULT_NAVIGATION,
  DEFAULT_SITE_SETTINGS,
  type AuditLogEntry,
  type CategoryRecord,
  type FaqRecord,
  type HomeSectionConfig,
  type MediaAssetMeta,
  type NavigationSettings,
  type Promotion,
  type ReviewRecord,
  type SiteSettings,
} from "@/lib/admin/cms-types";
import {
  DEFAULT_TRACKING_SETTINGS,
  normalizeTrackingSettings,
} from "@/lib/tracking/settings";
import type { TrackingSettings } from "@/lib/tracking/types";

function normalizeShippingSettings(
  raw?: ShippingSettings | null,
): ShippingSettings {
  if (!raw) return DEFAULT_SHIPPING_SETTINGS;
  const amount = raw.freeShippingMinimumAmount;
  const migratedAmount =
    amount === 399 || amount === 499 ? FREE_SHIPPING_THRESHOLD_MAD : amount;
  return {
    ...DEFAULT_SHIPPING_SETTINGS,
    ...raw,
    freeShippingMinimumAmount:
      migratedAmount ?? DEFAULT_SHIPPING_SETTINGS.freeShippingMinimumAmount,
  };
}

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
  homeSections: HomeSectionConfig[];
  banners: Banner[];
  announcementBar: AnnouncementBarConfig;
  trackingSettings: TrackingSettings;
  categories: CategoryRecord[];
  reviews: ReviewRecord[];
  faqs: FaqRecord[];
  navigation: NavigationSettings;
  siteSettings: SiteSettings;
  promotions: Promotion[];
  auditLogs: AuditLogEntry[];
  /** admin notes about customers, keyed by phone number */
  customerNotes: Record<string, string>;
  /** alt text and metadata for media library files, keyed by url */
  mediaMeta: MediaAssetMeta[];
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
  homeSections: DEFAULT_HOME_SECTIONS,
  banners: [],
  announcementBar: DEFAULT_ANNOUNCEMENT_BAR,
  trackingSettings: DEFAULT_TRACKING_SETTINGS,
  categories: [],
  reviews: [],
  faqs: [],
  navigation: DEFAULT_NAVIGATION,
  siteSettings: DEFAULT_SITE_SETTINGS,
  promotions: [],
  auditLogs: [],
  customerNotes: {},
  mediaMeta: [],
};

function normalizeHomeSections(raw: unknown): HomeSectionConfig[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_HOME_SECTIONS;
  const known = new Set(DEFAULT_HOME_SECTIONS.map((s) => s.id));
  const seen = new Set<string>();
  const sections = (raw as HomeSectionConfig[]).filter((s) => {
    if (!s || !known.has(s.id) || seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
  // append any newly added sections missing from stored config
  for (const def of DEFAULT_HOME_SECTIONS) {
    if (!seen.has(def.id)) sections.push(def);
  }
  return sections;
}

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
      shippingSettings: normalizeShippingSettings(
        parsed.shippingSettings as ShippingSettings | undefined,
      ),
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
      trackingSettings: normalizeTrackingSettings(
        parsed.trackingSettings as Partial<TrackingSettings> | undefined,
      ),
      homeSections: normalizeHomeSections(parsed.homeSections),
      categories: Array.isArray(parsed.categories)
        ? (parsed.categories as CategoryRecord[])
        : [],
      reviews: Array.isArray(parsed.reviews)
        ? (parsed.reviews as ReviewRecord[])
        : [],
      faqs: Array.isArray(parsed.faqs) ? (parsed.faqs as FaqRecord[]) : [],
      navigation: {
        ...DEFAULT_NAVIGATION,
        ...((parsed.navigation as NavigationSettings | undefined) ?? {}),
      },
      siteSettings: {
        ...DEFAULT_SITE_SETTINGS,
        ...((parsed.siteSettings as SiteSettings | undefined) ?? {}),
      },
      promotions: Array.isArray(parsed.promotions)
        ? (parsed.promotions as Promotion[])
        : [],
      auditLogs: Array.isArray(parsed.auditLogs)
        ? (parsed.auditLogs as AuditLogEntry[])
        : [],
      customerNotes:
        parsed.customerNotes && typeof parsed.customerNotes === "object"
          ? (parsed.customerNotes as Record<string, string>)
          : {},
      mediaMeta: Array.isArray(parsed.mediaMeta)
        ? (parsed.mediaMeta as MediaAssetMeta[])
        : [],
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

