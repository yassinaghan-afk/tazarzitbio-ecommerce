import type { OrderLineItem, OrderRecord } from "@/lib/orders/types";

export type GoogleSheetsOrderRow = {
  orderId: string;
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  productName: string;
  sku: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  status: string;
  sourcePage: string;
  /** Optional extras — safe for Apps Script if columns ignore unknown keys */
  weight?: string;
  isUpsell?: boolean;
  listUnitPrice?: number;
};

function envWebhookUrl(): string {
  return (process.env.GOOGLE_SHEETS_WEBHOOK_URL ?? "").trim();
}

function buildRow(params: {
  order: OrderRecord;
  item: OrderLineItem;
  sourcePage?: string;
}): GoogleSheetsOrderRow {
  const { order, item } = params;
  const sourcePage = (params.sourcePage ?? "").trim();
  const weight = (item.weight ?? "").trim();
  const variant = weight
    ? item.offerLabel.includes(weight)
      ? item.offerLabel
      : `${item.offerLabel} — ${weight}`.trim()
    : item.offerLabel;

  return {
    orderId: order.orderId,
    createdAt: order.createdAt,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    city: (order.city ?? "").trim(),
    productName: item.nameAr,
    sku: item.productId || item.slug || item.offerId,
    variant,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: order.subtotal,
    shippingFee: order.shippingPrice,
    total: order.total,
    paymentMethod: order.paymentMethod,
    status: order.orderStatus,
    sourcePage,
    ...(weight ? { weight } : {}),
    ...(item.isUpsell ? { isUpsell: true } : {}),
    ...(typeof item.listUnitPrice === "number"
      ? { listUnitPrice: item.listUnitPrice }
      : {}),
  };
}

async function postRowToWebhook(
  url: string,
  row: GoogleSheetsOrderRow,
  orderId: string,
  index: number,
): Promise<boolean> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
    redirect: "follow",
  });

  console.log(`Google Sheets response status: ${res.status}`, {
    orderId,
    rowIndex: index,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Google Sheets error", {
      orderId,
      rowIndex: index,
      status: res.status,
      statusText: res.statusText,
      body: body.slice(0, 500),
    });
    return false;
  }

  return true;
}

/**
 * Sends a FINALIZED order to Google Sheets via Apps Script webhook.
 * One HTTP POST per product line.
 * Returns true when all rows succeed (or webhook is not configured).
 * Returns false on network/HTTP failure so callers can retry safely.
 */
export async function sendOrderToGoogleSheet(
  order: OrderRecord,
  opts?: { sourcePage?: string },
): Promise<boolean> {
  const url = envWebhookUrl();
  const urlExists = url.length > 0;

  console.log(`Google Sheets webhook URL exists: ${urlExists}`);

  if (!urlExists) {
    // Dev / misconfig: treat as success so local checkout can complete.
    return true;
  }

  const rows = order.products.map((item) =>
    buildRow({ order, item, sourcePage: opts?.sourcePage }),
  );

  if (rows.length === 0) {
    console.error("Google Sheets error", {
      orderId: order.orderId,
      message: "Order has no line items to export",
    });
    return false;
  }

  console.log("Sending order to Google Sheets", {
    orderId: order.orderId,
    rowCount: rows.length,
  });

  try {
    for (let i = 0; i < rows.length; i++) {
      const ok = await postRowToWebhook(url, rows[i], order.orderId, i);
      if (!ok) return false;
    }
    return true;
  } catch (err) {
    console.error("Google Sheets error", {
      orderId: order.orderId,
      message: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
