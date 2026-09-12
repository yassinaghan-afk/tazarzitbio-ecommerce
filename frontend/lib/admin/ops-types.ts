/**
 * Operations / Finance / CRM types for the TazarzitBio admin.
 * Appended to the existing file-backed store — no fake seed amounts.
 */

export type AdminRole = "admin" | "manager" | "confirmation_agent";

export type ConfirmationStatus =
  | "pending_confirmation"
  | "called"
  | "confirmed"
  | "no_answer"
  | "callback_requested"
  | "wrong_number"
  | "cancelled"
  | "refused"
  | "needs_review";

export type DeliveryStatus =
  | "new"
  | "pending_confirmation"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "returned"
  | "cancelled"
  | "failed_delivery"
  | "refused";

export type PaymentCollectionStatus =
  | "not_collected"
  | "collected_by_courier"
  | "pending_payout"
  | "paid_to_company";

export type PaidBy = "yassin" | "mohamed" | "shared" | "company";

export type ExpenseCategory =
  | "advertising"
  | "products_inventory"
  | "shipping"
  | "confirmation"
  | "packaging"
  | "salaries"
  | "software"
  | "operations"
  | "other";

export type AdPlatform = "meta" | "tiktok" | "google" | "other";

export type FinancialTxnType =
  | "ORDER_REVENUE"
  | "PRODUCT_COST"
  | "SHIPPING_COST"
  | "CONFIRMATION_COMMISSION"
  | "AD_EXPENSE"
  | "OTHER_EXPENSE"
  | "CASH_IN"
  | "CASH_OUT"
  | "PARTNER_CONTRIBUTION"
  | "PARTNER_WITHDRAWAL"
  | "DELIVERY_PAYOUT"
  | "REFUND"
  | "OTHER_INCOME";

export type PartnerTxnType =
  | "contribution"
  | "expense_paid"
  | "withdrawal"
  | "received"
  | "allocation";

export interface AdminUserRecord {
  id: string;
  name: string;
  username: string;
  /** SHA-256 hex of password */
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  /** Fixed MAD per confirmed order (confirmation agents) */
  commissionPerConfirmed: number;
  createdAt: string;
}

export interface PartnerRecord {
  id: string;
  name: string;
  /** Ownership / profit share 0–100 */
  ownershipPercent: number;
  isActive: boolean;
}

export interface PartnerTransaction {
  id: string;
  partnerId: string;
  type: PartnerTxnType;
  amount: number;
  date: string;
  description: string;
  relatedExpenseId?: string;
  relatedOrderId?: string;
  createdBy?: string;
  createdAt: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  paidBy: PaidBy;
  /** Partner id when paidBy is yassin/mohamed */
  partnerId?: string;
  paymentMethod?: string;
  relatedOrderId?: string;
  notes?: string;
  /** Allocation percents keyed by partner id — must sum ~100 when shared */
  allocation?: Record<string, number>;
  createdBy?: string;
  createdAt: string;
}

export interface AdExpenseRecord {
  id: string;
  date: string;
  platform: AdPlatform;
  campaign: string;
  amount: number;
  currency: string;
  paidBy: PaidBy;
  partnerId?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface CashTransaction {
  id: string;
  date: string;
  amount: number;
  /** positive = in, negative = out — amount always stored positive with direction */
  direction: "in" | "out";
  type: FinancialTxnType;
  description: string;
  personOrAccount?: string;
  relatedOrderId?: string;
  createdBy?: string;
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  type: FinancialTxnType;
  amount: number;
  date: string;
  description: string;
  relatedOrderId?: string;
  relatedExpenseId?: string;
  partnerId?: string;
  createdBy?: string;
  createdAt: string;
  /** Immutable once written */
  locked?: boolean;
}

export interface OrderStatusHistoryEntry {
  id: string;
  field: "orderStatus" | "confirmationStatus" | "deliveryStatus" | "paymentCollectionStatus" | "assignment";
  previousValue: string;
  newValue: string;
  userId?: string;
  userName?: string;
  note?: string;
  at: string;
}

export interface OrderTimelineEvent {
  id: string;
  action: string;
  userId?: string;
  userName?: string;
  note?: string;
  at: string;
}

export interface OpsSettings {
  /** Default fixed commission MAD per confirmed order */
  defaultCommissionPerConfirmed: number;
  /** Commission trigger */
  commissionOn: "confirmed" | "delivered";
  /** Cash reconciliation opening balance (manual) */
  openingCash: number;
  openingCashDate?: string;
  /** Last counted cash */
  actualCashCounted?: number;
  actualCashCountedAt?: string;
}

export interface OpsState {
  settings: OpsSettings;
  partners: PartnerRecord[];
  partnerTransactions: PartnerTransaction[];
  expenses: ExpenseRecord[];
  adExpenses: AdExpenseRecord[];
  cashTransactions: CashTransaction[];
  financialTransactions: FinancialTransaction[];
  adminUsers: AdminUserRecord[];
}

export const DEFAULT_OPS_SETTINGS: OpsSettings = {
  defaultCommissionPerConfirmed: 10,
  commissionOn: "confirmed",
  openingCash: 0,
};

/** Seed partners with ZERO balances — names only, no fake money. */
export const DEFAULT_PARTNERS: PartnerRecord[] = [
  { id: "partner-yassin", name: "Yassin", ownershipPercent: 50, isActive: true },
  { id: "partner-mohamed", name: "Mohamed", ownershipPercent: 50, isActive: true },
];

export const DEFAULT_OPS_STATE: OpsState = {
  settings: DEFAULT_OPS_SETTINGS,
  partners: DEFAULT_PARTNERS,
  partnerTransactions: [],
  expenses: [],
  adExpenses: [],
  cashTransactions: [],
  financialTransactions: [],
  adminUsers: [],
};

export const CONFIRMATION_STATUSES: ConfirmationStatus[] = [
  "pending_confirmation",
  "called",
  "confirmed",
  "no_answer",
  "callback_requested",
  "wrong_number",
  "cancelled",
  "refused",
  "needs_review",
];

export const DELIVERY_STATUSES: DeliveryStatus[] = [
  "new",
  "pending_confirmation",
  "confirmed",
  "preparing",
  "shipped",
  "in_transit",
  "delivered",
  "returned",
  "cancelled",
  "failed_delivery",
  "refused",
];

export const PAYMENT_COLLECTION_STATUSES: PaymentCollectionStatus[] = [
  "not_collected",
  "collected_by_courier",
  "pending_payout",
  "paid_to_company",
];

/** Permissions granted per role (server-enforced). */
export type AdminPermission =
  // Orders
  | "orders:read"
  | "orders:write"
  | "orders:all" // see all orders, not only assigned
  | "orders:delete"
  | "orders:assign"
  | "orders:change_status"
  // Customers
  | "customers:read"
  | "customers:write"
  | "customers:delete"
  | "customers:view_phone"
  | "customers:view_address"
  | "customers:view_notes"
  // Products
  | "products:read"
  | "products:write"
  | "products:delete"
  | "products:view_cost"
  // Delivery
  | "delivery:read"
  | "delivery:create_shipment"
  | "delivery:update_status"
  | "delivery:view_financials"
  // Finance
  | "finance:read"
  | "finance:write"
  | "finance:view_profit"
  | "finance:view_cash"
  // Partners
  | "partners:read"
  | "partners:write"
  | "partners:view_balances"
  // Cash
  | "cash:read"
  | "cash:write"
  // Ads
  | "ads:read"
  | "ads:write"
  | "ads:delete"
  // Expenses
  | "expenses:read"
  | "expenses:write"
  | "expenses:delete"
  // Agents / team
  | "agents:read"
  | "agents:write"
  | "team:view"
  | "team:invite"
  | "team:edit_permissions"
  | "team:remove_member"
  // Reports
  | "reports:read"
  | "reports:export"
  // Audit
  | "audit:read"
  // Settings & content
  | "settings:view"
  | "settings:write"
  | "content:write";

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  admin: [
    "orders:read", "orders:write", "orders:all", "orders:delete", "orders:assign", "orders:change_status",
    "customers:read", "customers:write", "customers:delete",
    "customers:view_phone", "customers:view_address", "customers:view_notes",
    "products:read", "products:write", "products:delete", "products:view_cost",
    "delivery:read", "delivery:create_shipment", "delivery:update_status", "delivery:view_financials",
    "finance:read", "finance:write", "finance:view_profit", "finance:view_cash",
    "partners:read", "partners:write", "partners:view_balances",
    "cash:read", "cash:write",
    "ads:read", "ads:write", "ads:delete",
    "expenses:read", "expenses:write", "expenses:delete",
    "agents:read", "agents:write",
    "team:view", "team:invite", "team:edit_permissions", "team:remove_member",
    "reports:read", "reports:export",
    "audit:read",
    "settings:view", "settings:write",
    "content:write",
  ],
  manager: [
    "orders:read", "orders:write", "orders:all", "orders:assign", "orders:change_status",
    "customers:read", "customers:write",
    "customers:view_phone", "customers:view_address", "customers:view_notes",
    "products:read", "products:write", "products:view_cost",
    "delivery:read", "delivery:create_shipment", "delivery:update_status",
    "finance:read", "finance:view_profit",
    "partners:read",
    "ads:read",
    "expenses:read",
    "agents:read",
    "team:view",
    "reports:read",
    "settings:view",
  ],
  confirmation_agent: [
    "orders:read", "orders:write", "orders:change_status",
    "customers:read", "customers:view_phone", "customers:view_address",
    "delivery:read",
    "settings:view",
  ],
};
