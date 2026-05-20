import { type NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin/auth";
import type { CmsProductRecord } from "@/lib/admin/product-types";
import { buildCatalog } from "@/lib/products/catalog-base";
import { buildMergedCatalog, loadCmsCatalogState } from "@/lib/products/cms-catalog";
import { updateStore } from "@/lib/server/store";

function catalogProductToCms(product: ReturnType<typeof buildCatalog>[number]): CmsProductRecord {
  const now = new Date().toISOString();
  return {
    id: product.id,
    source: "catalog",
    slug: product.slug,
    nameAr: product.nameAr,
    nameFr: "",
    category: product.category,
    shortDescription: product.shortDescription,
    description: product.description,
    ingredients: product.ingredients,
    benefits: product.benefits,
    usageSuggestions: product.usageSuggestions,
    images: product.images,
    badges: product.badges,
    offers: product.offers.map((o) => ({
      id: o.id,
      label: o.label,
      weight: o.weight,
      sku: o.sku,
      salePrice: o.economics.salePrice,
      costPrice: o.economics.costPrice,
      stock: 0,
      hint: o.hint,
    })),
    isVisible: true,
    isBundle: product.category === "bundles",
    isFeatured: false,
    isBestseller: product.badges.includes("bestseller"),
    seoTitle: product.nameAr,
    seoDescription: product.shortDescription,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function mergeAdminView(
  base: CmsProductRecord,
  stored?: CmsProductRecord,
  hiddenIds: string[] = [],
  featuredSlugs: string[] = [],
): CmsProductRecord {
  const merged = stored ? { ...base, ...stored, offers: stored.offers.length ? stored.offers : base.offers } : base;
  return {
    ...merged,
    isVisible: hiddenIds.includes(base.id) ? false : merged.isVisible !== false,
    isFeatured: featuredSlugs.includes(merged.slug) || merged.isFeatured,
  };
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await loadCmsCatalogState();
  const baseCatalog = buildCatalog(state.pricingOverrides);
  const seen = new Set<string>();
  const adminProducts: CmsProductRecord[] = [];

  for (const product of baseCatalog) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    const base = catalogProductToCms(product);
    const stored = state.cmsProducts.find((p) => p.id === product.id);
    adminProducts.push(
      mergeAdminView(base, stored, state.hiddenCatalogIds, state.featuredProductSlugs),
    );
  }

  for (const custom of state.cmsProducts.filter((p) => p.source === "custom")) {
    adminProducts.push({
      ...custom,
      isFeatured:
        state.featuredProductSlugs.includes(custom.slug) || custom.isFeatured,
    });
  }

  const order = state.productOrder;
  if (order.length) {
    const rank = new Map(order.map((id, i) => [id, i]));
    adminProducts.sort((a, b) => (rank.get(a.id) ?? 9999) - (rank.get(b.id) ?? 9999));
  }

  return NextResponse.json({
    products: adminProducts,
    featuredProductSlugs: state.featuredProductSlugs,
    productOrder: state.productOrder,
    mergedCount: buildMergedCatalog(state).length,
  });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as CmsProductRecord;
  if (!body.id || !body.slug?.trim() || !body.nameAr?.trim()) {
    return NextResponse.json(
      { error: "id, slug, and nameAr are required" },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const record: CmsProductRecord = {
    ...body,
    slug: body.slug.trim().toLowerCase(),
    nameAr: body.nameAr.trim(),
    updatedAt: now,
    createdAt: body.createdAt || now,
    badges: body.isBestseller
      ? [...new Set([...body.badges, "bestseller" as const])]
      : body.badges.filter((b) => b !== "bestseller"),
  };

  const store = await updateStore((prev) => {
    const cmsProducts = [...prev.cmsProducts];
    let hiddenCatalogIds = [...prev.hiddenCatalogIds];
    let featuredProductSlugs = [...prev.featuredProductSlugs];

    const idx = cmsProducts.findIndex((p) => p.id === record.id);
    if (idx >= 0) {
      cmsProducts[idx] = record;
    } else {
      cmsProducts.push(record);
    }

    if (record.source === "catalog") {
      if (!record.isVisible) {
        if (!hiddenCatalogIds.includes(record.id)) hiddenCatalogIds.push(record.id);
      } else {
        hiddenCatalogIds = hiddenCatalogIds.filter((id) => id !== record.id);
      }
    }

    if (record.isFeatured) {
      if (!featuredProductSlugs.includes(record.slug)) {
        featuredProductSlugs.push(record.slug);
      }
    } else {
      featuredProductSlugs = featuredProductSlugs.filter((s) => s !== record.slug);
    }

    return { ...prev, cmsProducts, hiddenCatalogIds, featuredProductSlugs };
  });

  return NextResponse.json({ product: record, products: store.cmsProducts });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    productOrder?: string[];
    featuredProductSlugs?: string[];
  };

  const store = await updateStore((prev) => ({
    ...prev,
    productOrder: body.productOrder ?? prev.productOrder,
    featuredProductSlugs: body.featuredProductSlugs ?? prev.featuredProductSlugs,
  }));

  return NextResponse.json({
    productOrder: store.productOrder,
    featuredProductSlugs: store.featuredProductSlugs,
  });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const store = await updateStore((prev) => {
    const target = prev.cmsProducts.find((p) => p.id === id);

    if (target?.source === "custom") {
      return {
        ...prev,
        cmsProducts: prev.cmsProducts.filter((p) => p.id !== id),
        productOrder: prev.productOrder.filter((pid) => pid !== id),
        featuredProductSlugs: prev.featuredProductSlugs.filter(
          (s) => s !== target.slug,
        ),
      };
    }

    return {
      ...prev,
      cmsProducts: prev.cmsProducts.filter((p) => p.id !== id),
      hiddenCatalogIds: prev.hiddenCatalogIds.includes(id)
        ? prev.hiddenCatalogIds
        : [...prev.hiddenCatalogIds, id],
      productOrder: prev.productOrder.filter((pid) => pid !== id),
    };
  });

  return NextResponse.json({ ok: true, cmsProducts: store.cmsProducts });
}
