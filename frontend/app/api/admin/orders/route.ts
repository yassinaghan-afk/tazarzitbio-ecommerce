import { type NextRequest, NextResponse } from "next/server";

import { roleHasPermission } from "@/lib/admin/permissions";
import { requireAdminSession } from "@/lib/admin/session";
import { readStore } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session || !roleHasPermission(session.role, "orders:read")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  let orders = store.orders;

  // Confirmation agents only see assigned orders
  if (!roleHasPermission(session.role, "orders:all")) {
    orders = orders.filter((o) => o.assignedAgentId === session.userId);
  }

  // Agents must not receive financial extras beyond order total (needed for confirmation)
  if (session.role === "confirmation_agent") {
    orders = orders.map((o) => ({
      ...o,
      productCostSnapshot: undefined,
      confirmationCommission: undefined,
    }));
  }

  // Pagination
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(sp.get("pageSize") || 50)));
  const q = (sp.get("q") || "").trim().toLowerCase();
  const status = sp.get("status") || "";
  const confirmationStatus = sp.get("confirmationStatus") || "";
  const deliveryStatus = sp.get("deliveryStatus") || "";
  const agentId = sp.get("agentId") || "";
  const deliveryCompany = sp.get("deliveryCompany") || "";
  const trackingNumber = (sp.get("trackingNumber") || "").trim().toLowerCase();
  const shipmentId = (sp.get("shipmentId") || "").trim().toLowerCase();

  let filtered = orders;
  if (q) {
    filtered = filtered.filter(
      (o) =>
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        (o.address || "").toLowerCase().includes(q) ||
        (o.city || "").toLowerCase().includes(q) ||
        (o.shipment?.trackingNumber || "").toLowerCase().includes(q) ||
        (o.shipment?.externalShipmentId || "").toLowerCase().includes(q),
    );
  }
  if (status) filtered = filtered.filter((o) => o.orderStatus === status);
  if (confirmationStatus)
    filtered = filtered.filter((o) => o.confirmationStatus === confirmationStatus);
  if (deliveryStatus)
    filtered = filtered.filter(
      (o) =>
        o.deliveryStatus === deliveryStatus ||
        o.shipment?.internalStatus === deliveryStatus,
    );
  if (deliveryCompany) {
    filtered = filtered.filter((o) => o.shipment?.providerId === deliveryCompany);
  }
  if (trackingNumber) {
    filtered = filtered.filter((o) =>
      (o.shipment?.trackingNumber || "").toLowerCase().includes(trackingNumber),
    );
  }
  if (shipmentId) {
    filtered = filtered.filter((o) =>
      (o.shipment?.externalShipmentId || "").toLowerCase().includes(shipmentId),
    );
  }
  if (agentId && roleHasPermission(session.role, "orders:all")) {
    filtered = filtered.filter((o) => o.assignedAgentId === agentId);
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);

  return NextResponse.json({
    orders: slice,
    total,
    page,
    pageSize,
    agents: roleHasPermission(session.role, "agents:read")
      ? store.ops.adminUsers
          .filter((u) => u.role === "confirmation_agent" && u.isActive)
          .map((u) => ({ id: u.id, name: u.name }))
      : [],
  });
}
