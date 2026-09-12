import { type NextRequest, NextResponse } from "next/server";

import { normalizeMoroccanPhone } from "@/lib/admin/phone";
import { roleHasPermission } from "@/lib/admin/permissions";
import { requireAdminSession } from "@/lib/admin/session";
import type { OrderRecord } from "@/lib/orders/types";
import { logAudit } from "@/lib/server/audit";
import { readStore, updateStore } from "@/lib/server/store";

export interface CustomerSummary {
  phone: string;
  phoneKey: string;
  name: string;
  address: string;
  city: string;
  orderCount: number;
  deliveredCount: number;
  cancelledCount: number;
  returnedCount: number;
  totalSpent: number;
  firstOrderAt: string;
  lastOrderAt: string;
  customerType: "new" | "returning" | "vip";
  note: string;
  orders: {
    orderId: string;
    createdAt: string;
    total: number;
    orderStatus: string;
    sequenceLabel: string;
  }[];
}

function customerType(delivered: number, total: number): "new" | "returning" | "vip" {
  if (delivered >= 5 || total >= 5) return "vip";
  if (total >= 2) return "returning";
  return "new";
}

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session || !roleHasPermission(session.role, "customers:read")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  const byPhone = new Map<string, { summary: CustomerSummary; raw: OrderRecord[] }>();

  // oldest → newest for sequence labels
  const chronological = [...store.orders].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  for (const order of chronological) {
    const phoneKey = normalizeMoroccanPhone(order.phone);
    if (!phoneKey) continue;
    const existing = byPhone.get(phoneKey);
    if (existing) {
      existing.raw.push(order);
      existing.summary.orderCount += 1;
      if (order.orderStatus === "delivered") existing.summary.deliveredCount += 1;
      if (order.orderStatus === "cancelled") existing.summary.cancelledCount += 1;
      if (order.orderStatus === "returned") existing.summary.returnedCount += 1;
      if (order.orderStatus !== "cancelled" && order.orderStatus !== "returned") {
        existing.summary.totalSpent += order.total;
      }
      existing.summary.lastOrderAt = order.createdAt;
      existing.summary.name = order.customerName;
      existing.summary.address = order.address;
      existing.summary.city = order.city ?? existing.summary.city;
      existing.summary.phone = order.phone;
    } else {
      byPhone.set(phoneKey, {
        raw: [order],
        summary: {
          phone: order.phone,
          phoneKey,
          name: order.customerName,
          address: order.address,
          city: order.city ?? "",
          orderCount: 1,
          deliveredCount: order.orderStatus === "delivered" ? 1 : 0,
          cancelledCount: order.orderStatus === "cancelled" ? 1 : 0,
          returnedCount: order.orderStatus === "returned" ? 1 : 0,
          totalSpent:
            order.orderStatus === "cancelled" || order.orderStatus === "returned"
              ? 0
              : order.total,
          firstOrderAt: order.createdAt,
          lastOrderAt: order.createdAt,
          customerType: "new",
          note:
            store.customerNotes[phoneKey] ||
            store.customerNotes[order.phone.trim()] ||
            "",
          orders: [],
        },
      });
    }
  }

  const customers: CustomerSummary[] = [...byPhone.values()].map(({ summary, raw }) => {
    const orders = raw.map((o, idx) => {
      const n = idx + 1;
      return {
        orderId: o.orderId,
        createdAt: o.createdAt,
        total: o.total,
        orderStatus: o.orderStatus,
        sequenceLabel:
          n === 1 ? "New Customer" : `Returning — Order #${n}`,
      };
    });
    // newest first for display
    orders.reverse();
    return {
      ...summary,
      customerType: customerType(summary.deliveredCount, summary.orderCount),
      orders,
    };
  });

  customers.sort((a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt));

  // Agents: strip totals if we want — keep basic CRM for calling
  if (session.role === "confirmation_agent") {
    return NextResponse.json({
      customers: customers.map((c) => ({
        ...c,
        totalSpent: undefined,
        note: c.note,
      })),
    });
  }

  return NextResponse.json({ customers });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session || !roleHasPermission(session.role, "customers:write")) {
    // agents can still write notes on customers they contact — allow customers:read holders to patch notes
    if (!session || !roleHasPermission(session.role, "customers:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  let body: { phone?: string; note?: string };
  try {
    body = (await req.json()) as { phone?: string; note?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const phoneRaw = (body.phone ?? "").toString().trim();
  const phoneKey = normalizeMoroccanPhone(phoneRaw) || phoneRaw;
  if (!phoneKey) return NextResponse.json({ error: "phone required" }, { status: 400 });
  const note = (body.note ?? "").toString();
  await updateStore((prev) => {
    const customerNotes = { ...prev.customerNotes };
    if (note) customerNotes[phoneKey] = note;
    else delete customerNotes[phoneKey];
    return { ...prev, customerNotes };
  });
  void logAudit(`Customer note updated (${phoneKey})`, "customer", phoneKey);
  return NextResponse.json({ ok: true });
}
