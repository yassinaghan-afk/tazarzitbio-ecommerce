import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Base webhook path without secret — rejected.
 * Configure Elite with:
 *   /api/webhooks/elite-delivery/<ELITE_DELIVERY_WEBHOOK_SECRET>
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "Webhook secret required in URL path",
      hint: "/api/webhooks/elite-delivery/<your-webhook-secret>",
    },
    { status: 401 },
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "elite",
    status: "configure_secret_path",
    path: "/api/webhooks/elite-delivery/<ELITE_DELIVERY_WEBHOOK_SECRET>",
  });
}
