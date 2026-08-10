import { NextResponse } from "next/server";

import { validateCoupon } from "@/lib/server/promotions";

export const dynamic = "force-dynamic";

/**
 * Public: validate a coupon code for the current cart.
 * Body: { code: string, subtotal: number }
 */
export async function POST(req: Request) {
  let body: { code?: string; subtotal?: number };
  try {
    body = (await req.json()) as { code?: string; subtotal?: number };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const code = (body.code ?? "").toString();
  const subtotal = Number(body.subtotal) || 0;
  const result = await validateCoupon(code, subtotal);
  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
