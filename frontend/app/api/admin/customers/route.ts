import { type NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin/auth";
import type { OrderRecord } from "@/lib/orders/types";
import { logAudit } from "@/lib/server/audit";
import { readStore, updateStore } from "@/lib/server/store";

export interface CustomerSummary {
  phone: string;
  name: string;
  address: string;
  city: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
  note: string;
  orders: OrderRecord[];
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  const byPhone = new Map<string, CustomerSummary>();
  // orders are stored newest first
  for (const order of store.orders) {
    const phone = order.phone.trim();
    const existing = byPhone.get(phone);
    if (existing) {
      existing.orderCount += 1;
      if (order.orderStatus !== "cancelled" && order.orderStatus !== "returned") {
        existing.totalSpent += order.total;
      }
      existing.orders.push(order);
    } else {
      byPhone.set(phone, {
        phone,
        name: order.customerName,
        address: order.address,
        city: order.city ?? "",
        orderCount: 1,
        totalSpent:
          order.orderStatus === "cancelled" || order.orderStatus === "returned"
            ? 0
            : order.total,
        lastOrderAt: order.createdAt,
        note: store.customerNotes[phone] ?? "",
        orders: [order],
      });
    }
  }
  const customers = [...byPhone.values()].sort((a, b) =>
    b.lastOrderAt.localeCompare(a.lastOrderAt),
  );
  return NextResponse.json({ customers });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { phone?: string; note?: string };
  try {
    body = (await req.json()) as { phone?: string; note?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const phone = (body.phone ?? "").toString().trim();
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
  const note = (body.note ?? "").toString();
  await updateStore((prev) => {
    const customerNotes = { ...prev.customerNotes };
    if (note) customerNotes[phone] = note;
    else delete customerNotes[phone];
    return { ...prev, customerNotes };
  });
  void logAudit(`Customer note updated (${phone})`, "customer", phone);
  return NextResponse.json({ ok: true });
}
