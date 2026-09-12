import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

import type {
  ConfirmationStatus,
  DeliveryStatus,
  OrderStatusHistoryEntry,
  OrderTimelineEvent,
  PaymentCollectionStatus,
} from "@/lib/admin/ops-types";
import {
  CONFIRMATION_STATUSES,
  DELIVERY_STATUSES,
  PAYMENT_COLLECTION_STATUSES,
} from "@/lib/admin/ops-types";
import { roleHasPermission } from "@/lib/admin/permissions";
import { requireAdminSession } from "@/lib/admin/session";
import { buildUnitCostMap, lineUnitCost } from "@/lib/admin/cost-map";
import { ORDER_STATUS_IDS, type OrderStatus } from "@/lib/orders/types";
import { logAudit } from "@/lib/server/audit";
import { readStore, updateStore } from "@/lib/server/store";

interface PatchBody {
  orderStatus?: OrderStatus;
  adminNote?: string;
  customerNote?: string;
  city?: string;
  confirmationStatus?: ConfirmationStatus;
  deliveryStatus?: DeliveryStatus;
  paymentCollectionStatus?: PaymentCollectionStatus;
  assignedAgentId?: string | null;
  confirmationNotes?: string;
  timelineNote?: string;
}

function hist(
  field: OrderStatusHistoryEntry["field"],
  previousValue: string,
  newValue: string,
  session: { userId: string; userName: string },
  note?: string,
): OrderStatusHistoryEntry {
  return {
    id: crypto.randomUUID().slice(0, 8),
    field,
    previousValue,
    newValue,
    userId: session.userId,
    userName: session.userName,
    note,
    at: new Date().toISOString(),
  };
}

function event(
  action: string,
  session: { userId: string; userName: string },
  note?: string,
): OrderTimelineEvent {
  return {
    id: crypto.randomUUID().slice(0, 8),
    action,
    userId: session.userId,
    userName: session.userName,
    note,
    at: new Date().toISOString(),
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await requireAdminSession(req);
  if (!session || !roleHasPermission(session.role, "orders:read")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orderId } = await params;
  const store = await readStore();
  const order = store.orders.find((o) => o.orderId === orderId);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    !roleHasPermission(session.role, "orders:all") &&
    order.assignedAgentId !== session.userId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const unitCosts = await buildUnitCostMap(store);
  const productCost = order.products.reduce(
    (s, line) =>
      s + lineUnitCost(unitCosts, line.productId, line.offerId) * line.quantity,
    0,
  );
  const agent = order.assignedAgentId
    ? store.ops.adminUsers.find((u) => u.id === order.assignedAgentId)
    : null;
  const commission =
    order.confirmationCommission ??
    agent?.commissionPerConfirmed ??
    store.ops.settings.defaultCommissionPerConfirmed;

  const finance =
    session.role === "confirmation_agent"
      ? null
      : {
          revenue: order.total,
          productCost: order.productCostSnapshot ?? productCost,
          shippingCost: order.shippingPrice,
          confirmationCommission:
            order.confirmationStatus === "confirmed" ? commission : 0,
          contribution:
            order.total -
            (order.productCostSnapshot ?? productCost) -
            order.shippingPrice -
            (order.confirmationStatus === "confirmed" ? commission : 0),
        };

  return NextResponse.json({ order, finance });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await requireAdminSession(req);
  if (!session || !roleHasPermission(session.role, "orders:write")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orderId } = await params;
  let body: PatchBody | null = null;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const nextStatus = body?.orderStatus;
  if (nextStatus && !ORDER_STATUS_IDS.includes(nextStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (
    body?.confirmationStatus &&
    !CONFIRMATION_STATUSES.includes(body.confirmationStatus)
  ) {
    return NextResponse.json({ error: "Invalid confirmation status" }, { status: 400 });
  }
  if (body?.deliveryStatus && !DELIVERY_STATUSES.includes(body.deliveryStatus)) {
    return NextResponse.json({ error: "Invalid delivery status" }, { status: 400 });
  }
  if (
    body?.paymentCollectionStatus &&
    !PAYMENT_COLLECTION_STATUSES.includes(body.paymentCollectionStatus)
  ) {
    return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
  }

  // Agents cannot assign themselves freely to other orders or edit payment/finance fields
  const isAgent = session.role === "confirmation_agent";
  if (isAgent) {
    if (body?.assignedAgentId !== undefined || body?.paymentCollectionStatus) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const storeBefore = await readStore();
  const existing = storeBefore.orders.find((o) => o.orderId === orderId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (isAgent && existing.assignedAgentId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (isAgent && body?.assignedAgentId === null) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const unitCosts = await buildUnitCostMap(storeBefore);
  const productCost = existing.products.reduce(
    (s, line) =>
      s + lineUnitCost(unitCosts, line.productId, line.offerId) * line.quantity,
    0,
  );

  const store = await updateStore((prev) => ({
    ...prev,
    orders: prev.orders.map((o) => {
      if (o.orderId !== orderId) return o;
      const history = [...(o.statusHistory ?? [])];
      const timeline = [...(o.timeline ?? [])];
      const patch: typeof o = { ...o, updatedAt: new Date().toISOString() };

      if (nextStatus && nextStatus !== o.orderStatus) {
        history.unshift(
          hist("orderStatus", o.orderStatus, nextStatus, session, body?.timelineNote),
        );
        timeline.unshift(event(`Status → ${nextStatus}`, session, body?.timelineNote));
        patch.orderStatus = nextStatus;
      }
      if (body?.confirmationStatus && body.confirmationStatus !== o.confirmationStatus) {
        history.unshift(
          hist(
            "confirmationStatus",
            o.confirmationStatus ?? "",
            body.confirmationStatus,
            session,
            body.confirmationNotes,
          ),
        );
        timeline.unshift(
          event(`Confirmation → ${body.confirmationStatus}`, session, body.confirmationNotes),
        );
        patch.confirmationStatus = body.confirmationStatus;
        if (body.confirmationStatus === "confirmed") {
          const agent = o.assignedAgentId
            ? prev.ops.adminUsers.find((u) => u.id === o.assignedAgentId)
            : null;
          patch.confirmationCommission =
            agent?.commissionPerConfirmed ??
            prev.ops.settings.defaultCommissionPerConfirmed;
          patch.productCostSnapshot = productCost;
        }
      }
      if (body?.deliveryStatus && body.deliveryStatus !== o.deliveryStatus) {
        history.unshift(
          hist(
            "deliveryStatus",
            o.deliveryStatus ?? "",
            body.deliveryStatus,
            session,
          ),
        );
        timeline.unshift(event(`Delivery → ${body.deliveryStatus}`, session));
        patch.deliveryStatus = body.deliveryStatus;
      }
      if (
        body?.paymentCollectionStatus &&
        body.paymentCollectionStatus !== o.paymentCollectionStatus &&
        !isAgent
      ) {
        history.unshift(
          hist(
            "paymentCollectionStatus",
            o.paymentCollectionStatus ?? "",
            body.paymentCollectionStatus,
            session,
          ),
        );
        timeline.unshift(
          event(`Payment → ${body.paymentCollectionStatus}`, session),
        );
        patch.paymentCollectionStatus = body.paymentCollectionStatus;
      }
      if (body?.assignedAgentId !== undefined && !isAgent) {
        const agentId = body.assignedAgentId;
        const agent = agentId
          ? prev.ops.adminUsers.find((u) => u.id === agentId)
          : null;
        history.unshift(
          hist(
            "assignment",
            o.assignedAgentId ?? "",
            agentId ?? "",
            session,
          ),
        );
        timeline.unshift(
          event(
            agent ? `Assigned to ${agent.name}` : "Unassigned",
            session,
          ),
        );
        patch.assignedAgentId = agentId || undefined;
        patch.assignedAgentName = agent?.name;
      }
      if (body?.adminNote !== undefined && !isAgent) {
        patch.adminNote = body.adminNote.toString();
      }
      if (body?.customerNote !== undefined) {
        patch.customerNote = body.customerNote.toString();
      }
      if (body?.city !== undefined && !isAgent) {
        patch.city = body.city.toString();
      }
      if (body?.confirmationNotes !== undefined) {
        patch.confirmationNotes = body.confirmationNotes.toString();
        timeline.unshift(event("Confirmation note", session, body.confirmationNotes));
      }

      patch.statusHistory = history.slice(0, 100);
      patch.timeline = timeline.slice(0, 100);
      return patch;
    }),
  }));

  const updated = store.orders.find((o) => o.orderId === orderId)!;
  void logAudit(`Order ${orderId} updated`, "order", orderId);
  return NextResponse.json({ order: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await requireAdminSession(req);
  if (!session || !roleHasPermission(session.role, "orders:all")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { orderId } = await params;
  const store = await updateStore((prev) => ({
    ...prev,
    orders: prev.orders.filter((o) => o.orderId !== orderId),
  }));
  void logAudit(`Order ${orderId} deleted`, "order", orderId);
  return NextResponse.json({ ok: true, remaining: store.orders.length });
}
