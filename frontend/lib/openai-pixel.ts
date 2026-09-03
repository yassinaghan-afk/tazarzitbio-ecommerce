import { resolveOpenAIPixelId } from "@/lib/openai/pixel-id";
import { TRACKING_CURRENCY } from "@/lib/tracking/types";

type OpenAIQueue = {
  (...args: unknown[]): void;
  q?: unknown[][];
};

declare global {
  interface Window {
    oaiq?: OpenAIQueue;
  }
}

const recentEvents = new Map<string, number>();

function oaiq(...args: unknown[]): void {
  if (typeof window === "undefined" || typeof window.oaiq !== "function") return;
  window.oaiq(...args);
}

function measure(
  eventName: string,
  data: Record<string, unknown>,
  options?: Record<string, unknown>,
): void {
  if (options) {
    oaiq("measure", eventName, data, options);
    return;
  }
  oaiq("measure", eventName, data);
}

function shouldSkipRecentEvent(key: string, windowMs = 1200): boolean {
  const now = Date.now();
  const previous = recentEvents.get(key);
  recentEvents.set(key, now);
  return previous != null && now - previous < windowMs;
}

function buildContent(params: {
  id: string;
  name: string;
  contentType: string;
  quantity?: number;
  amount?: number;
}) {
  return {
    id: params.id,
    name: params.name,
    content_type: params.contentType,
    ...(params.quantity != null ? { quantity: params.quantity } : {}),
    ...(params.amount != null ? { amount: params.amount, currency: TRACKING_CURRENCY } : {}),
  };
}

/**
 * Official OpenAI Pixel bootstrap using the exact Ads Manager setup code.
 * The pixel is initialized once via next/script in the storefront shell.
 */
export function buildOpenAIPixelBootstrap(pixelId: string): string {
  const id = resolveOpenAIPixelId(pixelId);
  return `<script>!function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f)}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");oaiq("init",{pixelId:"${id}",debug:true});</script>`
    .replace(/^<script>|<\/script>$/g, "");
}

export function pageview(url?: string): void {
  const href =
    url ||
    (typeof window !== "undefined" ? window.location.href : "");
  const key = `page:${href}`;
  if (shouldSkipRecentEvent(key)) return;

  measure("page_viewed", {
    type: "contents",
    contents: [
      buildContent({
        id: href || "page",
        name:
          typeof document !== "undefined" && document.title
            ? document.title
            : "Page view",
        contentType: "page",
      }),
    ],
  });
}

export function trackViewContent(params: {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
  eventId?: string;
}): void {
  const quantity = params.quantity ?? 1;
  const amount = params.price * quantity;
  const key = `view:${params.eventId || `${params.productId}:${amount}:${quantity}`}`;
  if (shouldSkipRecentEvent(key)) return;

  measure(
    "contents_viewed",
    {
      type: "contents",
      amount,
      currency: TRACKING_CURRENCY,
      contents: [
        buildContent({
          id: params.productId,
          name: params.name,
          contentType: "product",
          quantity,
          amount: params.price,
        }),
      ],
    },
    params.eventId ? { event_id: params.eventId } : undefined,
  );
}

export function trackAddToCart(params: {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  eventId?: string;
}): void {
  const key = `atc:${params.eventId || `${params.productId}:${params.price}:${params.quantity}`}`;
  if (shouldSkipRecentEvent(key)) return;

  measure(
    "items_added",
    {
      type: "contents",
      amount: params.price * params.quantity,
      currency: TRACKING_CURRENCY,
      contents: [
        buildContent({
          id: params.productId,
          name: params.name,
          contentType: "product",
          quantity: params.quantity,
          amount: params.price,
        }),
      ],
    },
    params.eventId ? { event_id: params.eventId } : undefined,
  );
}

export function trackInitiateCheckout(params: {
  products: { productId: string; name: string; price: number; quantity: number }[];
  total: number;
  eventId?: string;
}): void {
  const key =
    params.eventId ||
    `checkout:${params.total}:${params.products
      .map((p) => `${p.productId}:${p.quantity}:${p.price}`)
      .join(",")}`;
  if (shouldSkipRecentEvent(key)) return;

  measure(
    "checkout_started",
    {
      type: "contents",
      amount: params.total,
      currency: TRACKING_CURRENCY,
      contents: params.products.map((p) =>
        buildContent({
          id: p.productId,
          name: p.name,
          contentType: "product",
          quantity: p.quantity,
          amount: p.price,
        }),
      ),
    },
    params.eventId ? { event_id: params.eventId } : undefined,
  );
}

/**
 * ChatGPT Ads custom conversion — base event `order_created`.
 * Equivalent to: oaiq("measure", "order_created", { type: "contents" })
 * Call only after the backend successfully creates the order (via trackPurchase in events.ts).
 */
export function trackPurchase(params: {
  orderId: string;
  products: { productId: string; name: string; price: number; quantity: number }[];
  total: number;
  eventId?: string;
}): void {
  const orderKey = `order_created:${params.orderId}`;
  if (shouldSkipRecentEvent(orderKey, 60_000)) return;

  measure(
    "order_created",
    {
      type: "contents",
      amount: params.total,
      currency: TRACKING_CURRENCY,
      contents: params.products.map((p) =>
        buildContent({
          id: p.productId,
          name: p.name,
          contentType: "product",
          quantity: p.quantity,
          amount: p.price,
        }),
      ),
    },
    {
      event_id:
        params.eventId ||
        `order_${params.orderId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40)}`,
    },
  );
}
