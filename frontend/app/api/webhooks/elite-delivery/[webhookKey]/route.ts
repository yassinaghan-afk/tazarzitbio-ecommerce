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

  // Acknowledge quickly; processing is sync but lightweight (JSON store).
  const result = await applyEliteWebhook(payload);
  return NextResponse.json(
    { ok: true, duplicate: result.duplicate ?? false, orderId: result.orderId },
    { status: 200 },
  );
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ webhookKey: string }> },
) {
  const { webhookKey } = await ctx.params;
  const verified = await eliteDeliveryProvider.verifyWebhookWithSecret(
    new Headers(),
    JSON.stringify({ package_id: "ping", notif_type: "ChangeStatus", delivery_status: 0 }),
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
