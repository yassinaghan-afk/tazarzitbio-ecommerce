import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

import { buildUnitCostMap } from "@/lib/admin/cost-map";
import {
  computeFinanceKpis,
  computePartnerPositions,
  resolveDatePreset,
} from "@/lib/admin/finance-calc";
import { safeNumber } from "@/lib/admin/money";
import { roleHasPermission } from "@/lib/admin/permissions";
import { requireAdminSession } from "@/lib/admin/session";
import { readStore } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session || !roleHasPermission(session.role, "finance:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sp = req.nextUrl.searchParams;
  const preset = sp.get("preset") || "this_month";
  const range = resolveDatePreset(
    preset,
    sp.get("from") ?? undefined,
    sp.get("to") ?? undefined,
  );

  const store = await readStore();
  const unitCostByProductId = await buildUnitCostMap(store);
  const kpis = computeFinanceKpis({
    orders: store.orders,
    range,
    unitCostByProductId,
    settings: store.ops.settings,
    adExpenses: store.ops.adExpenses,
    expenses: store.ops.expenses,
    cashTransactions: store.ops.cashTransactions,
  });

  const partners = computePartnerPositions({
    partners: store.ops.partners,
    partnerTransactions: store.ops.partnerTransactions,
    netBusinessProfit: kpis.netProfit,
    range,
  });

  const cashIn = store.ops.cashTransactions
    .filter((t) => t.direction === "in")
    .reduce((s, t) => s + safeNumber(t.amount), 0);
  const cashOut = store.ops.cashTransactions
    .filter((t) => t.direction === "out")
    .reduce((s, t) => s + safeNumber(t.amount), 0);
  const expectedCash = safeNumber(store.ops.settings.openingCash) + cashIn - cashOut;
  const actual = store.ops.settings.actualCashCounted;
  const cashDiff =
    typeof actual === "number" && Number.isFinite(actual)
      ? actual - expectedCash
      : null;

  return NextResponse.json({
    range: { from: range.from.toISOString(), to: range.to.toISOString(), preset },
    kpis,
    partners,
    cash: {
      opening: store.ops.settings.openingCash,
      cashIn,
      cashOut,
      expected: expectedCash,
      actual: actual ?? null,
      difference: cashDiff,
    },
    settings: store.ops.settings,
  });
}

/** Update ops settings / cash count (finance:write). */
export async function PATCH(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session || !roleHasPermission(session.role, "finance:write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let body: {
    openingCash?: number;
    actualCashCounted?: number;
    defaultCommissionPerConfirmed?: number;
    commissionOn?: "confirmed" | "delivered";
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { updateStore } = await import("@/lib/server/store");
  const { logAudit } = await import("@/lib/server/audit");
  const store = await updateStore((prev) => ({
    ...prev,
    ops: {
      ...prev.ops,
      settings: {
        ...prev.ops.settings,
        ...(typeof body.openingCash === "number"
          ? { openingCash: body.openingCash, openingCashDate: new Date().toISOString() }
          : {}),
        ...(typeof body.actualCashCounted === "number"
          ? {
              actualCashCounted: body.actualCashCounted,
              actualCashCountedAt: new Date().toISOString(),
            }
          : {}),
        ...(typeof body.defaultCommissionPerConfirmed === "number"
          ? { defaultCommissionPerConfirmed: body.defaultCommissionPerConfirmed }
          : {}),
        ...(body.commissionOn ? { commissionOn: body.commissionOn } : {}),
      },
    },
  }));
  void logAudit("Ops settings updated", "finance", crypto.randomUUID().slice(0, 8));
  return NextResponse.json({ settings: store.ops.settings });
}
