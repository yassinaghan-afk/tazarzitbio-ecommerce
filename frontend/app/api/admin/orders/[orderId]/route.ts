import { NextResponse } from "next/server";

import type { OrderStatus } from "@/lib/orders/types";
import { updateStore } from "@/lib/server/store";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  let body: { orderStatus?: OrderStatus } | null = null;
  try {
    body = (await req.json()) as { orderStatus?: OrderStatus };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const nextStatus = body?.orderStatus;
  if (
    !nextStatus ||
    !["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(
      nextStatus,
    )
  ) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const store = await updateStore((prev) => ({
    ...prev,
    orders: prev.orders.map((o) =>
      o.orderId === orderId ? { ...o, orderStatus: nextStatus } : o,
    ),
  }));

  const updated = store.orders.find((o) => o.orderId === orderId);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const store = await updateStore((prev) => ({
    ...prev,
    orders: prev.orders.filter((o) => o.orderId !== orderId),
  }));
  return NextResponse.json({ ok: true, remaining: store.orders.length });
}

