import { type NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin/auth";
import { ORDER_STATUS_IDS, type OrderStatus } from "@/lib/orders/types";
import { logAudit } from "@/lib/server/audit";
import { updateStore } from "@/lib/server/store";

interface PatchBody {
  orderStatus?: OrderStatus;
  adminNote?: string;
  customerNote?: string;
  city?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  if (!(await isAdminRequest(req))) {
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

  const store = await updateStore((prev) => ({
    ...prev,
    orders: prev.orders.map((o) =>
      o.orderId === orderId
        ? {
            ...o,
            ...(nextStatus ? { orderStatus: nextStatus } : {}),
            ...(body?.adminNote !== undefined
              ? { adminNote: body.adminNote.toString() }
              : {}),
            ...(body?.customerNote !== undefined
              ? { customerNote: body.customerNote.toString() }
              : {}),
            ...(body?.city !== undefined ? { city: body.city.toString() } : {}),
          }
        : o,
    ),
  }));

  const updated = store.orders.find((o) => o.orderId === orderId);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (nextStatus) {
    void logAudit(`Order ${orderId} marked ${nextStatus}`, "order", orderId);
  } else {
    void logAudit(`Order ${orderId} updated`, "order", orderId);
  }
  return NextResponse.json({ order: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orderId } = await params;
  const store = await updateStore((prev) => ({
    ...prev,
    orders: prev.orders.filter((o) => o.orderId !== orderId),
  }));
  void logAudit(`Order ${orderId} deleted`, "order", orderId);
  return NextResponse.json({ ok: true, remaining: store.orders.length });
}
