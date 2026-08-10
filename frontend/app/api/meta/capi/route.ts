import { type NextRequest, NextResponse } from "next/server";

import { sendMetaCapiEvent, type MetaCapiEventName } from "@/lib/meta/capi";
import { isMetaCapiConfigured } from "@/lib/meta/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_EVENTS = new Set<MetaCapiEventName>([
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  // Purchase is intentionally NOT accepted from the browser — only /api/orders.
]);

/**
 * Forward browser-side ecommerce events to Meta CAPI with the same event_id
 * as the Pixel for deduplication. Token never leaves the server.
 *
 * Body: {
 *   eventName, eventId, eventSourceUrl?,
 *   customData?, userData?: { fbp?, fbc?, phone?, fullName?, city? }
 * }
 */
export async function POST(req: NextRequest) {
  if (!isMetaCapiConfigured()) {
    return NextResponse.json({ ok: false, skipped: true });
  }

  let body: {
    eventName?: string;
    eventId?: string;
    eventSourceUrl?: string;
    customData?: Record<string, unknown>;
    userData?: {
      fbp?: string;
      fbc?: string;
      phone?: string;
      fullName?: string;
      city?: string;
    };
  };

  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = body.eventName as MetaCapiEventName;
  const eventId = (body.eventId ?? "").toString().trim();
  if (!ALLOWED_EVENTS.has(eventName) || !eventId) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const fwd = req.headers.get("x-forwarded-for");
  const clientIp = fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
  const clientUserAgent = req.headers.get("user-agent") || "";

  const cd = body.customData ?? {};

  // Never block the browser — fire and return quickly if Graph is slow.
  const result = await sendMetaCapiEvent({
    eventName,
    eventId,
    eventSourceUrl: (body.eventSourceUrl ?? "").toString() || undefined,
    customData: {
      value: typeof cd.value === "number" ? cd.value : undefined,
      currency: typeof cd.currency === "string" ? cd.currency : undefined,
      content_ids: Array.isArray(cd.content_ids)
        ? (cd.content_ids as string[]).map(String)
        : undefined,
      content_name: typeof cd.content_name === "string" ? cd.content_name : undefined,
      content_type: typeof cd.content_type === "string" ? cd.content_type : undefined,
      contents: Array.isArray(cd.contents)
        ? (cd.contents as { id?: string; quantity?: number; item_price?: number }[]).map(
            (c) => ({
              id: String(c.id ?? ""),
              quantity: Number(c.quantity) || 1,
              item_price:
                typeof c.item_price === "number" ? c.item_price : undefined,
            }),
          )
        : undefined,
      num_items: typeof cd.num_items === "number" ? cd.num_items : undefined,
      order_id: typeof cd.order_id === "string" ? cd.order_id : undefined,
    },
    userData: {
      fbp: body.userData?.fbp,
      fbc: body.userData?.fbc,
      phone: body.userData?.phone,
      fullName: body.userData?.fullName,
      city: body.userData?.city,
      clientIp,
      clientUserAgent,
    },
  });

  return NextResponse.json({ ok: result.ok });
}
