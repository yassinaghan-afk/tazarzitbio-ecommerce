import { type NextRequest, NextResponse } from "next/server";

import { DELIVERY_STATUSES } from "@/lib/admin/ops-types";
import { roleHasPermission } from "@/lib/admin/permissions";
import { requireAdminSession } from "@/lib/admin/session";
import { toPublicDeliveryConfig } from "@/lib/delivery/secrets";
import {
  computeDeliveryOverview,
  refreshOrderDelivery,
  sendOrderToDelivery,
} from "@/lib/delivery/service";
import { normalizeDeliveryState } from "@/lib/delivery/types";
import { resolveDatePreset } from "@/lib/admin/finance-calc";
import { logAudit } from "@/lib/server/audit";
import { readStore, updateStore } from "@/lib/server/store";

/** GET settings / overview / logs — never returns raw secrets. */
export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session || !roleHasPermission(session.role, "orders:read")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const view = req.nextUrl.searchParams.get("view") || "settings";
  const store = await readStore();
  const delivery = normalizeDeliveryState(store.delivery);

  if (view === "settings") {
    if (!roleHasPermission(session.role, "settings:write") && session.role !== "admin") {
      // managers may read that elite exists but not edit — allow finance/settings readers
      if (!roleHasPermission(session.role, "finance:read")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    return NextResponse.json({
      elite: toPublicDeliveryConfig(delivery.providers.elite),
      internalStatuses: DELIVERY_STATUSES,
      note: "API endpoints and auth scheme will be wired only after official Elite Delivery documentation is provided.",
    });
  }

  if (view === "overview") {
    if (!roleHasPermission(session.role, "finance:read") && session.role !== "admin" && session.role !== "manager") {
      // allow orders:all to see operational counts
      if (!roleHasPermission(session.role, "orders:all")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    const preset = req.nextUrl.searchParams.get("preset") || "this_month";
    const range = resolveDatePreset(
      preset,
      req.nextUrl.searchParams.get("from") ?? undefined,
      req.nextUrl.searchParams.get("to") ?? undefined,
    );
    const overview = computeDeliveryOverview(store.orders, range);
    return NextResponse.json({
      overview,
      range: { from: range.from.toISOString(), to: range.to.toISOString(), preset },
    });
  }

  if (view === "logs") {
    if (!roleHasPermission(session.role, "audit:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({
      logs: delivery.integrationLogs.slice(0, 100),
    });
  }

  return NextResponse.json({ error: "Unknown view" }, { status: 400 });
}

/** Update Elite Delivery config (secrets write-only). */
export async function PUT(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session || !roleHasPermission(session.role, "settings:write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    enabled?: boolean;
    baseUrl?: string;
    accountId?: string;
    apiKey?: string;
    webhookSecret?: string;
    clearApiKey?: boolean;
    clearWebhookSecret?: boolean;
    statusMap?: Record<string, string>;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const store = await updateStore((prev) => {
    const delivery = normalizeDeliveryState(prev.delivery);
    const elite = delivery.providers.elite;
    const nextSecrets = { ...elite.secrets };
    if (body.clearApiKey) delete nextSecrets.apiKey;
    else if (typeof body.apiKey === "string" && body.apiKey.trim()) {
      nextSecrets.apiKey = body.apiKey.trim();
    }
    if (body.clearWebhookSecret) delete nextSecrets.webhookSecret;
    else if (typeof body.webhookSecret === "string" && body.webhookSecret.trim()) {
      nextSecrets.webhookSecret = body.webhookSecret.trim();
    }

    const statusMap: Record<string, (typeof DELIVERY_STATUSES)[number]> = {
      ...elite.config.statusMap,
    };
    if (body.statusMap && typeof body.statusMap === "object") {
      for (const [k, v] of Object.entries(body.statusMap)) {
        if (DELIVERY_STATUSES.includes(v as (typeof DELIVERY_STATUSES)[number])) {
          statusMap[k] = v as (typeof DELIVERY_STATUSES)[number];
        }
      }
    }

    return {
      ...prev,
      delivery: {
        ...delivery,
        providers: {
          ...delivery.providers,
          elite: {
            config: {
              ...elite.config,
              enabled: body.enabled ?? elite.config.enabled,
              baseUrl:
                body.baseUrl !== undefined
                  ? body.baseUrl.trim()
                  : elite.config.baseUrl,
              accountId:
                body.accountId !== undefined
                  ? body.accountId.trim()
                  : elite.config.accountId,
              statusMap,
              updatedAt: new Date().toISOString(),
              apiKeyConfigured: Boolean(nextSecrets.apiKey),
              webhookSecretConfigured: Boolean(nextSecrets.webhookSecret),
            },
            secrets: nextSecrets,
          },
        },
      },
    };
  });

  void logAudit("Elite Delivery settings updated", "delivery", session.userId);
  return NextResponse.json({
    elite: toPublicDeliveryConfig(store.delivery.providers.elite),
  });
}

/** Actions: send | refresh */
export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session || !roleHasPermission(session.role, "orders:write")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role === "confirmation_agent") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { action?: string; orderId?: string; providerId?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderId = (body.orderId || "").trim();
  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  if (body.action === "send") {
    const result = await sendOrderToDelivery(orderId, body.providerId || "elite", {
      userId: session.userId,
      userName: session.userName,
    });
    const status = result.ok ? 200 : result.errorCode === "API_DOCS_REQUIRED" ? 503 : 400;
    return NextResponse.json(result, { status });
  }

  if (body.action === "refresh") {
    const result = await refreshOrderDelivery(orderId, body.providerId || "elite");
    const status = result.ok ? 200 : result.errorCode === "API_DOCS_REQUIRED" ? 503 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
