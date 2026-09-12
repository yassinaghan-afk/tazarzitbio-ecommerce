import { NextResponse } from "next/server";

import { eliteDeliveryProvider } from "@/lib/delivery/elite/provider";
import { appendDeliveryLog } from "@/lib/delivery/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Elite Delivery webhook receiver.
 *
 * Until official documentation defines authentication and payload shape:
 * - All requests are rejected
 * - No order mutations occur
 * - No invented signature schemes are applied
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const verified = await eliteDeliveryProvider.verifyWebhook(req.headers, rawBody);

  await appendDeliveryLog({
    providerId: "elite",
    requestType: "webhook",
    success: false,
    errorCode: verified.errorCode || "WEBHOOK_REJECTED",
    message: "Webhook rejected — awaiting official Elite Delivery docs for verification.",
  });

  if (!verified.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Webhook not accepted",
        code: verified.errorCode || "WEBHOOK_UNAUTHORIZED",
      },
      { status: 401 },
    );
  }

  const result = await eliteDeliveryProvider.handleWebhook(req.headers, rawBody);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "elite",
    status: "awaiting_official_documentation",
  });
}
