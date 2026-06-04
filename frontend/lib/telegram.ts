import type { OrderLineItem, OrderRecord } from "@/lib/orders/types";

function envBotToken(): string {
  return (process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
}

function envChatId(): string {
  return (process.env.TELEGRAM_CHAT_ID ?? "").trim();
}

/** First segment of address (before comma) as city hint. */
export function extractCityFromAddress(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) return "—";
  const segment = trimmed.split(/[,،]/)[0]?.trim();
  return segment || trimmed;
}

function formatLineItem(item: OrderLineItem): string {
  const lineTotal = item.unitPrice * item.quantity;
  const variant = item.offerLabel ? ` (${item.offerLabel})` : "";
  return `• ${item.nameAr}${variant} × ${item.quantity} — ${lineTotal} MAD`;
}

export function formatOrderTelegramMessage(order: OrderRecord): string {
  const city = extractCityFromAddress(order.address);
  const products =
    order.products.length > 0
      ? order.products.map(formatLineItem).join("\n")
      : "—";

  return [
    "🛒 New Order",
    "",
    `Order ID: ${order.orderId}`,
    "",
    `Name: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `City: ${city}`,
    "",
    "Products:",
    products,
    "",
    "Total:",
    `${order.total} MAD`,
    "",
    "Status:",
    "New Order",
  ].join("\n");
}

/**
 * Sends an instant Telegram alert for a new order.
 * Never throws — checkout must not fail if Telegram is down or misconfigured.
 */
export async function sendOrderTelegramNotification(
  order: OrderRecord,
): Promise<void> {
  const token = envBotToken();
  const chatId = envChatId();

  if (!token || !chatId) {
    return;
  }

  const text = formatOrderTelegramMessage(order);
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Telegram notification error", {
        orderId: order.orderId,
        status: res.status,
        statusText: res.statusText,
        body: body.slice(0, 500),
      });
    }
  } catch (err) {
    console.error("Telegram notification error", {
      orderId: order.orderId,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
