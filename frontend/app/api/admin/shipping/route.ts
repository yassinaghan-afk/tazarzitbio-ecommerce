import { type NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin/auth";
import { logAudit } from "@/lib/server/audit";
import { revalidatePublicContent } from "@/lib/server/revalidate";
import { readStore, updateStore } from "@/lib/server/store";
import {
  DEFAULT_SHIPPING_SETTINGS,
  type ShippingSettings,
} from "@/lib/shipping/settings";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({ shippingSettings: store.shippingSettings });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Partial<ShippingSettings>;
  try {
    body = (await req.json()) as Partial<ShippingSettings>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const num = (v: unknown, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };
  const shippingSettings: ShippingSettings = {
    defaultShippingPrice: num(
      body.defaultShippingPrice,
      DEFAULT_SHIPPING_SETTINGS.defaultShippingPrice,
    ),
    freeShippingMinimumAmount: num(
      body.freeShippingMinimumAmount,
      DEFAULT_SHIPPING_SETTINGS.freeShippingMinimumAmount,
    ),
    freeShippingMinimumProducts: Math.max(
      1,
      Math.round(
        num(
          body.freeShippingMinimumProducts,
          DEFAULT_SHIPPING_SETTINGS.freeShippingMinimumProducts,
        ),
      ),
    ),
    freeShippingByAmountEnabled: body.freeShippingByAmountEnabled !== false,
    freeShippingByQuantityEnabled: Boolean(body.freeShippingByQuantityEnabled),
    bundleFreeShippingEnabled: Boolean(body.bundleFreeShippingEnabled),
  };
  const store = await updateStore((prev) => ({ ...prev, shippingSettings }));
  void logAudit("Shipping settings updated", "shipping");
  revalidatePublicContent();
  return NextResponse.json({ shippingSettings: store.shippingSettings });
}
