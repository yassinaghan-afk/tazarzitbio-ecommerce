import { NextResponse } from "next/server";

import { readStore } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/** Public: current shipping settings used by cart/checkout totals. */
export async function GET() {
  const store = await readStore();
  return NextResponse.json(
    { shippingSettings: store.shippingSettings },
    { headers: { "Cache-Control": "no-store" } },
  );
}
