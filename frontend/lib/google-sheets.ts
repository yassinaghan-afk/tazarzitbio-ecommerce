import type { OrderLineItem, OrderRecord } from "@/lib/orders/types";

type GoogleSheetsOrderRow = {
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

  return {
    orderId: order.orderId,
    createdAt: order.createdAt,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    city: "", // Not collected yet; reserved for future admin/DB model.
    productName: item.nameAr,
    sku: item.productId || item.offerId,
    variant: item.offerLabel,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: order.subtotal,
    shippingFee: order.shippingPrice,
    total: order.total,
    paymentMethod: order.paymentMethod,
    status: order.orderStatus,
    sourcePage,
  };
}

/**
 * Sends an order to Google Sheets via Apps Script webhook.
 *
 * - One row per product line item
 * - Never throw (caller must not block checkout)
 */
export async function sendOrderToGoogleSheet(
  order: OrderRecord,
  opts?: { sourcePage?: string },
): Promise<void> {
  const url = envWebhookUrl();
  if (!url) return;

  try {
    const rows = order.products.map((item) =>
      buildRow({ order, item, sourcePage: opts?.sourcePage }),
    );

    // Prefer sending as a batch payload. Apps Script can easily unpack {rows}.
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });

    if (!res.ok) {
      // Server-side only: do not block checkout.
      console.error("[google-sheets] webhook non-200", {
        status: res.status,
        statusText: res.statusText,
        orderId: order.orderId,
      });
    }
  } catch (err) {
    // Server-side only: do not block checkout.
    console.error("[google-sheets] webhook request failed", {
      orderId: order.orderId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

