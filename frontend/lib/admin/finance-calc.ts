import type { OrderRecord } from "@/lib/orders/types";
import type {
  AdExpenseRecord,
  CashTransaction,
  ExpenseRecord,
  OpsSettings,
  PartnerRecord,
  PartnerTransaction,
} from "@/lib/admin/ops-types";
import { safeNumber } from "@/lib/admin/money";

export interface DateRange {
  from: Date;
  to: Date;
}

export function resolveDatePreset(
  preset: string,
  customFrom?: string,
  customTo?: string,
): DateRange {
  const now = new Date();
  const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const endOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  };

  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { from: startOfDay(y), to: endOfDay(y) };
    }
    case "this_week": {
      const d = new Date(now);
      const day = d.getDay();
      const diff = day === 0 ? 6 : day - 1;
      d.setDate(d.getDate() - diff);
      return { from: startOfDay(d), to: endOfDay(now) };
    }
    case "this_month": {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: startOfDay(d), to: endOfDay(now) };
    }
    case "last_month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: startOfDay(from), to: endOfDay(to) };
    }
    case "this_year": {
      const d = new Date(now.getFullYear(), 0, 1);
      return { from: startOfDay(d), to: endOfDay(now) };
    }
    case "custom": {
      const from = customFrom ? new Date(customFrom) : startOfDay(now);
      const to = customTo ? new Date(customTo) : endOfDay(now);
      return { from: startOfDay(from), to: endOfDay(to) };
    }
    default:
      return { from: startOfDay(now), to: endOfDay(now) };
  }
}

export function inRange(iso: string, range: DateRange): boolean {
  const t = new Date(iso).getTime();
  return t >= range.from.getTime() && t <= range.to.getTime();
}

export interface OrderCostSnapshot {
  revenue: number;
  productCost: number;
  shippingCost: number;
  confirmationCommission: number;
  otherCosts: number;
  contribution: number;
}

/** Per-order contribution using catalog cost map (productId → unit cost). */
export function computeOrderContribution(
  order: OrderRecord,
  unitCostByProductId: Map<string, number>,
  commissionMad: number,
  commissionApplies: boolean,
): OrderCostSnapshot {
  const revenue = safeNumber(order.total);
  const productCost = order.products.reduce((sum, line) => {
    const unit = safeNumber(unitCostByProductId.get(line.productId));
    return sum + unit * safeNumber(line.quantity);
  }, 0);
  const shippingCost = safeNumber(order.shippingPrice);
  const confirmationCommission = commissionApplies ? safeNumber(commissionMad) : 0;
  const otherCosts = 0;
  const contribution =
    revenue - productCost - shippingCost - confirmationCommission - otherCosts;
  return {
    revenue,
    productCost,
    shippingCost,
    confirmationCommission,
    otherCosts,
    contribution: safeNumber(contribution),
  };
}

export interface FinanceKpis {
  totalSales: number;
  deliveredRevenue: number;
  pendingRevenue: number;
  productCosts: number;
  shippingCosts: number;
  confirmationCommissions: number;
  advertisingSpend: number;
  otherExpenses: number;
  /** advertisingSpend + otherExpenses (period) — no product COGS */
  totalExpenses: number;
  netProfit: number;
  cashOnHand: number;
  amountReceivable: number;
  amountPayable: number;
  orderCount: number;
  deliveredCount: number;
  /** Alias fields for older clients — same as totalSales / cashOnHand */
  totalRevenue: number;
  cashBalance: number;
}

export function computeFinanceKpis(input: {
  orders: OrderRecord[];
  range: DateRange;
  unitCostByProductId: Map<string, number>;
  settings: OpsSettings;
  adExpenses: AdExpenseRecord[];
  expenses: ExpenseRecord[];
  cashTransactions: CashTransaction[];
}): FinanceKpis {
  const {
    orders,
    range,
    unitCostByProductId,
    settings,
    adExpenses,
    expenses,
    cashTransactions,
  } = input;

  const inPeriod = orders.filter((o) => inRange(o.createdAt, range));
  let totalSales = 0;
  let deliveredRevenue = 0;
  let pendingRevenue = 0;
  let productCosts = 0;
  let shippingCosts = 0;
  let confirmationCommissions = 0;
  let deliveredCount = 0;
  let amountReceivable = 0;

  for (const order of inPeriod) {
    if (order.orderStatus === "cancelled") continue;
    const orderTotal = safeNumber(order.total);
    totalSales += orderTotal;
    const confirmed =
      order.confirmationStatus === "confirmed" ||
      order.orderStatus === "confirmed" ||
      order.orderStatus === "preparing" ||
      order.orderStatus === "shipped" ||
      order.orderStatus === "delivered";
    const commissionApplies =
      settings.commissionOn === "delivered"
        ? order.orderStatus === "delivered" || order.deliveryStatus === "delivered"
        : confirmed && order.confirmationStatus !== "cancelled" && order.confirmationStatus !== "refused";

    const commissionMad = safeNumber(
      order.confirmationCommission ?? settings.defaultCommissionPerConfirmed,
    );

    const snap = computeOrderContribution(
      order,
      unitCostByProductId,
      commissionMad,
      Boolean(order.assignedAgentId) && commissionApplies,
    );

    if (order.orderStatus === "delivered" || order.deliveryStatus === "delivered") {
      deliveredRevenue += orderTotal;
      deliveredCount += 1;
      productCosts += safeNumber(snap.productCost);
      shippingCosts += safeNumber(snap.shippingCost);
      confirmationCommissions += safeNumber(snap.confirmationCommission);
      if (
        order.paymentCollectionStatus !== "paid_to_company" &&
        order.orderStatus !== "returned"
      ) {
        amountReceivable += orderTotal;
      }
    } else if (order.orderStatus !== "returned") {
      pendingRevenue += orderTotal;
    }
  }

  const advertisingSpend = adExpenses
    .filter((e) => inRange(e.date, range))
    .reduce((s, e) => s + safeNumber(e.amount), 0);

  const otherExpenses = expenses
    .filter((e) => inRange(e.date, range) && e.category !== "advertising")
    .reduce((s, e) => s + safeNumber(e.amount), 0);

  const totalExpenses = advertisingSpend + otherExpenses;

  // Ads counted only via adExpenses (not duplicated from expenses category advertising).
  const netProfit =
    deliveredRevenue -
    productCosts -
    shippingCosts -
    confirmationCommissions -
    advertisingSpend -
    otherExpenses;

  const cashIn = cashTransactions
    .filter((t) => t.direction === "in")
    .reduce((s, t) => s + safeNumber(t.amount), 0);
  const cashOut = cashTransactions
    .filter((t) => t.direction === "out")
    .reduce((s, t) => s + safeNumber(t.amount), 0);
  const cashOnHand = safeNumber(settings.openingCash) + cashIn - cashOut;

  const amountPayable = confirmationCommissions;

  return {
    totalSales: safeNumber(totalSales),
    deliveredRevenue: safeNumber(deliveredRevenue),
    pendingRevenue: safeNumber(pendingRevenue),
    productCosts: safeNumber(productCosts),
    shippingCosts: safeNumber(shippingCosts),
    confirmationCommissions: safeNumber(confirmationCommissions),
    advertisingSpend: safeNumber(advertisingSpend),
    otherExpenses: safeNumber(otherExpenses),
    totalExpenses: safeNumber(totalExpenses),
    netProfit: safeNumber(netProfit),
    cashOnHand: safeNumber(cashOnHand),
    amountReceivable: safeNumber(amountReceivable),
    amountPayable: safeNumber(amountPayable),
    orderCount: inPeriod.length,
    deliveredCount,
    totalRevenue: safeNumber(totalSales),
    cashBalance: safeNumber(cashOnHand),
  };
}

export interface PartnerPosition {
  partnerId: string;
  name: string;
  ownershipPercent: number;
  contributed: number;
  expensesPaid: number;
  withdrawn: number;
  received: number;
  profitShare: number;
  netPosition: number;
}

export function computePartnerPositions(input: {
  partners: PartnerRecord[];
  partnerTransactions: PartnerTransaction[];
  netBusinessProfit: number;
  range: DateRange;
}): PartnerPosition[] {
  const { partners, partnerTransactions, netBusinessProfit, range } = input;
  return partners
    .filter((p) => p.isActive)
    .map((p) => {
      const txns = partnerTransactions.filter(
        (t) => t.partnerId === p.id && inRange(t.date, range),
      );
      const contributed = txns
        .filter((t) => t.type === "contribution")
        .reduce((s, t) => s + t.amount, 0);
      const expensesPaid = txns
        .filter((t) => t.type === "expense_paid")
        .reduce((s, t) => s + t.amount, 0);
      const withdrawn = txns
        .filter((t) => t.type === "withdrawal")
        .reduce((s, t) => s + t.amount, 0);
      const received = txns
        .filter((t) => t.type === "received")
        .reduce((s, t) => s + t.amount, 0);
      const profitShare = (netBusinessProfit * p.ownershipPercent) / 100;
      // Net position: what company owes partner ≈ profitShare + contributed + expensesPaid - withdrawn - received
      const netPosition =
        profitShare + contributed + expensesPaid - withdrawn - received;
      return {
        partnerId: p.id,
        name: p.name,
        ownershipPercent: p.ownershipPercent,
        contributed,
        expensesPaid,
        withdrawn,
        received,
        profitShare,
        netPosition,
      };
    });
}
