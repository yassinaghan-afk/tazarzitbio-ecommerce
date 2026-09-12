import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

import type {
  AdExpenseRecord,
  AdminUserRecord,
  CashTransaction,
  ExpenseRecord,
  PartnerRecord,
  PartnerTransaction,
} from "@/lib/admin/ops-types";
import { roleHasPermission } from "@/lib/admin/permissions";
import { hashPassword, requireAdminSession } from "@/lib/admin/session";
import { logAudit } from "@/lib/server/audit";
import { readStore, updateStore } from "@/lib/server/store";

type Resource =
  | "expenses"
  | "ads"
  | "cash"
  | "partners"
  | "partner-txns"
  | "agents";

function id() {
  return crypto.randomUUID().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resource = (req.nextUrl.searchParams.get("resource") || "") as Resource;
  const store = await readStore();

  switch (resource) {
    case "expenses":
      if (!roleHasPermission(session.role, "expenses:read"))
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.json({ expenses: store.ops.expenses });
    case "ads":
      if (!roleHasPermission(session.role, "ads:read"))
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.json({ adExpenses: store.ops.adExpenses });
    case "cash":
      if (!roleHasPermission(session.role, "cash:read"))
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.json({
        cashTransactions: store.ops.cashTransactions,
        settings: store.ops.settings,
      });
    case "partners":
      if (!roleHasPermission(session.role, "partners:read"))
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.json({
        partners: store.ops.partners,
        partnerTransactions: store.ops.partnerTransactions,
      });
    case "agents":
      if (!roleHasPermission(session.role, "agents:read"))
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.json({
        agents: store.ops.adminUsers.map((u) => ({
          id: u.id,
          name: u.name,
          username: u.username,
          role: u.role,
          isActive: u.isActive,
          commissionPerConfirmed: u.commissionPerConfirmed,
          createdAt: u.createdAt,
        })),
      });
    default:
      return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { resource?: Resource; data?: Record<string, unknown> };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const resource = body.resource;
  const data = body.data ?? {};
  const now = new Date().toISOString();

  if (resource === "expenses") {
    if (!roleHasPermission(session.role, "expenses:write"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0)
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    const expense: ExpenseRecord = {
      id: id(),
      date: String(data.date || now.slice(0, 10)),
      amount,
      category: (data.category as ExpenseRecord["category"]) || "other",
      description: String(data.description || ""),
      paidBy: (data.paidBy as ExpenseRecord["paidBy"]) || "company",
      partnerId: data.partnerId ? String(data.partnerId) : undefined,
      paymentMethod: data.paymentMethod ? String(data.paymentMethod) : undefined,
      relatedOrderId: data.relatedOrderId ? String(data.relatedOrderId) : undefined,
      notes: data.notes ? String(data.notes) : undefined,
      allocation: data.allocation as Record<string, number> | undefined,
      createdBy: session.userId,
      createdAt: now,
    };
    await updateStore((prev) => {
      const partnerTxns = [...prev.ops.partnerTransactions];
      if (expense.partnerId && (expense.paidBy === "yassin" || expense.paidBy === "mohamed" || expense.paidBy === "shared")) {
        partnerTxns.unshift({
          id: id(),
          partnerId: expense.partnerId,
          type: "expense_paid",
          amount: expense.amount,
          date: expense.date,
          description: expense.description || expense.category,
          relatedExpenseId: expense.id,
          createdBy: session.userId,
          createdAt: now,
        });
      }
      return {
        ...prev,
        ops: {
          ...prev.ops,
          expenses: [expense, ...prev.ops.expenses],
          partnerTransactions: partnerTxns,
        },
      };
    });
    void logAudit(`Expense ${expense.amount} MAD`, "expense", expense.id);
    return NextResponse.json({ ok: true, expense });
  }

  if (resource === "ads") {
    if (!roleHasPermission(session.role, "ads:write"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0)
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    const ad: AdExpenseRecord = {
      id: id(),
      date: String(data.date || now.slice(0, 10)),
      platform: (data.platform as AdExpenseRecord["platform"]) || "meta",
      campaign: String(data.campaign || ""),
      amount,
      currency: String(data.currency || "MAD"),
      paidBy: (data.paidBy as AdExpenseRecord["paidBy"]) || "company",
      partnerId: data.partnerId ? String(data.partnerId) : undefined,
      notes: data.notes ? String(data.notes) : undefined,
      createdBy: session.userId,
      createdAt: now,
    };
    await updateStore((prev) => {
      const partnerTxns = [...prev.ops.partnerTransactions];
      if (ad.partnerId) {
        partnerTxns.unshift({
          id: id(),
          partnerId: ad.partnerId,
          type: "expense_paid",
          amount: ad.amount,
          date: ad.date,
          description: `Ad: ${ad.platform} ${ad.campaign}`.trim(),
          relatedExpenseId: ad.id,
          createdBy: session.userId,
          createdAt: now,
        });
      }
      return {
        ...prev,
        ops: {
          ...prev.ops,
          adExpenses: [ad, ...prev.ops.adExpenses],
          partnerTransactions: partnerTxns,
        },
      };
    });
    void logAudit(`Ad expense ${ad.amount} MAD`, "ad", ad.id);
    return NextResponse.json({ ok: true, ad });
  }

  if (resource === "cash") {
    if (!roleHasPermission(session.role, "cash:write"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0)
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    const direction = data.direction === "out" ? "out" : "in";
    const txn: CashTransaction = {
      id: id(),
      date: String(data.date || now.slice(0, 10)),
      amount,
      direction,
      type: (data.type as CashTransaction["type"]) || (direction === "in" ? "CASH_IN" : "CASH_OUT"),
      description: String(data.description || ""),
      personOrAccount: data.personOrAccount ? String(data.personOrAccount) : undefined,
      relatedOrderId: data.relatedOrderId ? String(data.relatedOrderId) : undefined,
      createdBy: session.userId,
      createdAt: now,
    };
    await updateStore((prev) => ({
      ...prev,
      ops: {
        ...prev.ops,
        cashTransactions: [txn, ...prev.ops.cashTransactions],
      },
    }));
    void logAudit(`Cash ${direction} ${amount} MAD`, "cash", txn.id);
    return NextResponse.json({ ok: true, txn });
  }

  if (resource === "partners") {
    if (!roleHasPermission(session.role, "partners:write"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const partners = Array.isArray(data.partners)
      ? (data.partners as PartnerRecord[])
      : null;
    if (!partners)
      return NextResponse.json({ error: "partners required" }, { status: 400 });
    await updateStore((prev) => ({
      ...prev,
      ops: { ...prev.ops, partners },
    }));
    void logAudit("Partners updated", "partner");
    return NextResponse.json({ ok: true, partners });
  }

  if (resource === "partner-txns") {
    if (!roleHasPermission(session.role, "partners:write"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0)
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    const txn: PartnerTransaction = {
      id: id(),
      partnerId: String(data.partnerId || ""),
      type: (data.type as PartnerTransaction["type"]) || "contribution",
      amount,
      date: String(data.date || now.slice(0, 10)),
      description: String(data.description || ""),
      createdBy: session.userId,
      createdAt: now,
    };
    if (!txn.partnerId)
      return NextResponse.json({ error: "partnerId required" }, { status: 400 });
    await updateStore((prev) => ({
      ...prev,
      ops: {
        ...prev.ops,
        partnerTransactions: [txn, ...prev.ops.partnerTransactions],
      },
    }));
    void logAudit(`Partner txn ${txn.type}`, "partner", txn.id);
    return NextResponse.json({ ok: true, txn });
  }

  if (resource === "agents") {
    if (!roleHasPermission(session.role, "agents:write"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const username = String(data.username || "").trim().toLowerCase();
    const password = String(data.password || "");
    const name = String(data.name || "").trim();
    if (!username || !password || !name)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const passwordHash = await hashPassword(password);
    const user: AdminUserRecord = {
      id: id(),
      name,
      username,
      passwordHash,
      role: (data.role as AdminUserRecord["role"]) || "confirmation_agent",
      isActive: true,
      commissionPerConfirmed:
        typeof data.commissionPerConfirmed === "number"
          ? data.commissionPerConfirmed
          : 10,
      createdAt: now,
    };
    const store = await updateStore((prev) => {
      if (prev.ops.adminUsers.some((u) => u.username === username)) {
        return prev;
      }
      return {
        ...prev,
        ops: { ...prev.ops, adminUsers: [user, ...prev.ops.adminUsers] },
      };
    });
    if (!store.ops.adminUsers.some((u) => u.id === user.id)) {
      return NextResponse.json({ error: "Username taken" }, { status: 409 });
    }
    void logAudit(`Agent created ${username}`, "agent", user.id);
    return NextResponse.json({
      ok: true,
      agent: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        commissionPerConfirmed: user.commissionPerConfirmed,
      },
    });
  }

  return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
}
