import { NextResponse } from "next/server";

import {
  eliteDeliveryProvider,
  parseEliteWebhookPayload,
} from "@/lib/delivery/elite/provider";
import {
  appendDeliveryLog,
  applyEliteWebhook,
} from "@/lib/delivery/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Elite Delivery webhook (secret path).
 *
 * Configure in Elite panel as:
 *   https://YOUR_DOMAIN/api/webhooks/elite-delivery/<WEBHOOK_SECRET>
 *
 * Docs: no HMAC — secret URL is the recommended protection.
 * Returns HTTP 200 quickly after validation + atomic local apply.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ webhookKey: string }> },
) {
  const { webhookKey } = await ctx.params;
  const rawBody = await req.text();

  const verified = await eliteDeliveryProvider.verifyWebhookWithSecret(
    req.headers,
    rawBody,
    webhookKey,
  );

  if (!verified.ok) {
    await appendDeliveryLog({
      providerId: "elite",
      requestType: "webhook",
      success: false,
      errorCode: verified.errorCode || "WEBHOOK_REJECTED",
      message: "Webhook rejected",
    });
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const payload = parseEliteWebhookPayload(rawBody);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  // Valid payload → process atomically then ACK 200 (Elite may retry on non-2xx).
  try {
    const result = await applyEliteWebhook(payload);
    return NextResponse.json(
      {
        ok: true,
        duplicate: result.duplicate ?? false,
        unmatched: result.unmatched ?? false,
        orderId: result.orderId,
      },
      { status: 200 },
    );
  } catch (err) {
    await appendDeliveryLog({
      providerId: "elite",
      requestType: "webhook",
      externalShipmentId: payload.package_id,
      success: false,
      errorCode: "WEBHOOK_APPLY_FAILED",
      message: err instanceof Error ? err.message.slice(0, 180) : "Apply failed",
    });
    // Still 200 so Elite does not hammer retries for transient store issues —
    // event can be re-sent manually / investigated in webhook logs.
    return NextResponse.json(
      { ok: false, error: "Processing error logged" },
      { status: 200 },
    );
  }
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ webhookKey: string }> },
) {
  const { webhookKey } = await ctx.params;
  const verified = await eliteDeliveryProvider.verifyWebhookWithSecret(
    new Headers(),
    JSON.stringify({
      package_id: "ping",
      notif_type: "ChangeStatus",
      delivery_status: 0,
    }),
    webhookKey,
  );
  return NextResponse.json({
    ok: verified.ok,
    provider: "elite",
    hint: verified.ok
      ? "Webhook endpoint ready"
      : "Invalid or missing webhook secret",
  });
}
