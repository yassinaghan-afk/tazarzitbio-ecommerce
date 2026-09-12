"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, Minus, Plus, ShoppingCart, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PlacedOrder } from "@/lib/checkout/types";
import { getMetaBrowserIds } from "@/lib/meta/browser";
import type { UpsellOrderResponse } from "@/lib/orders/types";
import {
  applyUpsellDiscount,
  UPSELL_DISCOUNT_PERCENT,
} from "@/lib/orders/upsell-pricing";
import type { PublicProduct } from "@/lib/products/types";
import { getListingProducts } from "@/lib/products/listing";
import {
  clearUpsellSelection,
  placedOrderFromApiOrder,
  readPlacedOrder,
  readUpsellSelection,
  withSearch,
  writePlacedOrder,
  writeUpsellSelection,
  type UpsellSelection,
} from "@/lib/upsell/session";
import {
  trackPurchase,
  trackUpsellAdd,
  trackUpsellComplete,
  trackUpsellSkip,
  trackUpsellView,
} from "@/lib/tracking/events";
import { cn } from "@/lib/utils";

function formatDh(n: number): string {
  return `${n} درهم`;
}

function productSize(product: PublicProduct, offerId?: string): string {
  const offer =
    (offerId ? product.offers.find((o) => o.id === offerId) : null) ??
    [...product.offers].sort((a, b) => a.price - b.price)[0] ??
    null;
  return (offer?.weight || product.weight || "").trim();
}

export function RoyalUpsellPage() {
  const router = useRouter();
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [selection, setSelection] = useState<UpsellSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const placed = readPlacedOrder();
    if (!placed?.id || !placed.upsellToken) {
      router.replace(withSearch(placed?.thankYouPath ?? "/thank-you"));
      return;
    }
    if (placed.upsellCompleted) {
      router.replace(withSearch(placed.thankYouPath ?? "/thank-you"));
      return;
    }
    setOrder(placed);
    setSelection(readUpsellSelection(placed.id));
    setHydrated(true);
    trackUpsellView({ orderId: placed.id });

    void fetch("/api/catalog")
      .then(async (res) => {
        if (!res.ok) throw new Error("catalog");
        const data = (await res.json()) as { products: PublicProduct[] };
        setProducts(getListingProducts(data.products ?? []));
      })
      .catch(() => setError("تعذر تحميل المنتجات. يمكنك التخطي وإتمام الطلب."))
      .finally(() => setLoading(false));
  }, [router]);

  const originalProductIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of order?.items ?? []) {
      if (!item.isUpsell && item.productId) ids.add(item.productId);
    }
    return ids;
  }, [order]);

  const offerProducts = useMemo(
    () => products.filter((p) => !originalProductIds.has(p.id)),
    [products, originalProductIds],
  );

  const originalSubtotal = useMemo(() => {
    if (!order) return 0;
    return order.items
      .filter((i) => !i.isUpsell)
      .reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  }, [order]);

  const upsellSubtotal = useMemo(
    () => selection.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    [selection],
  );

  const shippingFee = order?.shippingFee ?? 0;
  const finalTotal = originalSubtotal + upsellSubtotal + shippingFee;
  const hasUpsells = selection.length > 0;

  function persistSelection(next: UpsellSelection[]) {
    setSelection(next);
    if (order?.id) writeUpsellSelection(order.id, next);
  }

  function isSelected(productId: string): boolean {
    return selection.some((s) => s.productId === productId);
  }

  function toggleProduct(product: PublicProduct) {
    if (!order || busy) return;
    setError("");
    const offer =
      [...product.offers].sort((a, b) => a.price - b.price)[0] ?? null;
    if (!offer) return;

    if (isSelected(product.id)) {
      persistSelection(selection.filter((s) => s.productId !== product.id));
      return;
    }

    const listPrice = offer.price;
    const unitPrice = applyUpsellDiscount(listPrice);
    const weight = productSize(product, offer.id);
    const next: UpsellSelection = {
      productId: product.id,
      offerId: offer.id,
      quantity: 1,
      nameAr: product.nameAr,
      image: product.image,
      unitPrice,
      listUnitPrice: listPrice,
      offerLabel: offer.label,
      slug: product.slug,
      ...(weight ? { weight } : {}),
    };
    persistSelection([...selection, next]);
    trackUpsellAdd({
      orderId: order.id,
      productId: product.id,
      quantity: 1,
      value: unitPrice,
    });
  }

  function updateQty(productId: string, delta: number) {
    if (busy) return;
    persistSelection(
      selection
        .map((s) =>
          s.productId === productId
            ? { ...s, quantity: Math.min(20, Math.max(1, s.quantity + delta)) }
            : s,
        )
        .filter((s) => s.quantity > 0),
    );
  }

  async function callUpsell(
    action: "complete" | "skip",
  ): Promise<UpsellOrderResponse> {
    if (!order?.upsellToken) throw new Error("missing");
    const metaIds = getMetaBrowserIds();
    const res = await fetch(`/api/orders/${encodeURIComponent(order.id)}/upsell`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: order.upsellToken,
        action,
        items:
          action === "complete"
            ? selection.map((s) => ({
                productId: s.productId,
                offerId: s.offerId,
                quantity: s.quantity,
              }))
            : undefined,
        meta: {
          ...(metaIds.fbp ? { fbp: metaIds.fbp } : {}),
          ...(metaIds.fbc ? { fbc: metaIds.fbc } : {}),
          eventSourceUrl:
            typeof window !== "undefined" ? window.location.href : undefined,
        },
      }),
    });
    const data = (await res.json().catch(() => null)) as
      | (UpsellOrderResponse & { error?: string })
      | null;
    if (!res.ok || !data?.order || data.exportOk === false) {
      throw new Error(data?.error || "export_failed");
    }
    return data;
  }

  function firePurchase(next: PlacedOrder, eventId?: string) {
    trackPurchase({
      orderId: next.id,
      products: next.items.map((i) => ({
        productId: i.productId || i.slug || i.nameAr,
        slug: i.slug || "",
        name: i.nameAr,
        price: i.unitPrice,
        quantity: i.quantity,
      })),
      subtotal: next.subtotal,
      shipping: next.shippingFee,
      total: next.total,
      eventId,
    });
  }

  function goThankYou(updated: PlacedOrder) {
    const path = updated.thankYouPath ?? order?.thankYouPath ?? "/thank-you";
    if (order?.id) clearUpsellSelection(order.id);
    router.replace(withSearch(path));
  }

  async function finalize(action: "skip" | "complete") {
    if (!order || busy) return;
    setBusy(true);
    setError("");
    try {
      if (action === "skip") {
        trackUpsellSkip({ orderId: order.id });
      }
      const data = await callUpsell(action);
      const next = placedOrderFromApiOrder(data.order, {
        ...order,
        upsellCompleted: true,
      });
      writePlacedOrder(next);
      if (action === "complete" && selection.length > 0) {
        trackUpsellComplete({
          orderId: order.id,
          itemCount: selection.length,
          upsellTotal: upsellSubtotal,
        });
      }
      firePurchase(next, data.meta?.purchaseEventId);
      goThankYou(next);
    } catch {
      setBusy(false);
      setError(
        "ما قدرناش نأكدو الطلب دابا. حاول مرة أخرى — طلبك محفوظ وما غاديش يتسجل مرتين.",
      );
    }
  }

  async function onSkip() {
    await finalize("skip");
  }

  async function onContinue() {
    if (!order || busy) return;
    if (selection.length === 0) {
      await finalize("skip");
      return;
    }
    await finalize("complete");
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#faf6ef] text-sm text-neutral-500">
        كنحمّلو عرضك الخاص...
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-[#faf6ef] pb-36 text-[#1a2744]" dir="rtl">
      <div className="mx-auto w-full max-w-lg px-3 pt-6 sm:px-4">
        <div className="rounded-3xl border border-[#eadfce] bg-gradient-to-b from-[#fff8eb] to-white p-5 text-center shadow-[0_16px_40px_-28px_rgba(26,39,68,0.4)]">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#1a2744] text-amber-300">
            <Sparkles className="size-6" aria-hidden />
          </div>
          <h1 className="mt-3 text-xl font-extrabold leading-snug sm:text-2xl">
            عرض خاص قبل إتمام طلبك 👑
          </h1>
          <p className="mt-2 text-sm font-bold text-[#8a6a3a]">
            أضف منتجات أخرى إلى طلبك واستفد من -{UPSELL_DISCOUNT_PERCENT}%
          </p>
          <p className="mt-1 text-sm font-extrabold text-emerald-700">
            بدون مصاريف توصيل إضافية
          </p>
        </div>

        {error && (
          <p
            className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-5 space-y-3">
          {loading && (
            <p className="text-center text-sm text-neutral-500">كنحمّلو المنتجات...</p>
          )}
          {!loading &&
            offerProducts.map((product) => {
              const selected = isSelected(product.id);
              const offer =
                [...product.offers].sort((a, b) => a.price - b.price)[0] ?? null;
              const listPrice = offer?.price ?? product.price;
              const salePrice = applyUpsellDiscount(listPrice);
              const size = productSize(product, offer?.id);
              const selectedLine = selection.find((s) => s.productId === product.id);
              return (
                <article
                  key={product.id}
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-white transition-shadow",
                    selected
                      ? "border-emerald-500 shadow-[0_8px_24px_-16px_rgba(16,185,129,0.55)]"
                      : "border-[#eadfce]",
                  )}
                >
                  <div className="flex gap-3 p-3">
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-[#f3ebe0]">
                      <Image
                        src={product.image}
                        alt={product.nameAr}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                      <span className="absolute start-1.5 top-1.5 rounded-md bg-red-600 px-1.5 py-0.5 text-[11px] font-black tracking-wide text-white shadow-[0_0_12px_rgba(220,38,38,0.55)] ring-1 ring-white/40">
                        -{UPSELL_DISCOUNT_PERCENT}%
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-extrabold leading-snug">
                        {product.nameAr}
                      </h2>
                      {size ? (
                        <p className="mt-0.5 text-xs font-bold text-[#8a6a3a]">
                          {size}
                        </p>
                      ) : null}
                      <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
                        <span className="text-xs font-semibold text-neutral-400 line-through tabular-nums">
                          {formatDh(listPrice)}
                        </span>
                        <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white shadow-[0_0_8px_rgba(220,38,38,0.45)]">
                          -{UPSELL_DISCOUNT_PERCENT}%
                        </span>
                        <span className="text-base font-black tabular-nums text-emerald-700">
                          {formatDh(salePrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-t border-[#f0e6d8] px-3 py-2.5">
                    {selected && selectedLine && (
                      <div className="flex items-center gap-1 rounded-full border border-[#eadfce] bg-[#faf6ef] px-1">
                        <button
                          type="button"
                          aria-label="إنقاص"
                          disabled={busy}
                          className="flex size-8 items-center justify-center"
                          onClick={() => updateQty(product.id, -1)}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-bold tabular-nums">
                          {selectedLine.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="زيادة"
                          disabled={busy}
                          className="flex size-8 items-center justify-center"
                          onClick={() => updateQty(product.id, 1)}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => toggleProduct(product)}
                      className={cn(
                        "ms-auto flex min-h-11 min-w-[7.5rem] items-center justify-center gap-1.5 rounded-full px-4 text-sm font-extrabold text-white shadow-md",
                        selected
                          ? "bg-emerald-700 hover:bg-emerald-800"
                          : "bg-emerald-600 hover:bg-emerald-700",
                      )}
                    >
                      {selected ? (
                        <>
                          تمت الإضافة
                          <Check className="size-4" aria-hidden />
                        </>
                      ) : (
                        "إضافة"
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
        </div>

        <aside className="mt-6 rounded-2xl border border-[#eadfce] bg-white p-4 text-sm shadow-sm">
          <h3 className="font-extrabold">طلبك الحالي</h3>
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-neutral-500">المنتجات الأصلية</span>
              <span className="font-bold tabular-nums">{formatDh(originalSubtotal)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-neutral-500">إضافاتك</span>
              <span className="font-bold tabular-nums">{formatDh(upsellSubtotal)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-neutral-500">التوصيل</span>
              <span
                className={cn(
                  "font-bold",
                  shippingFee === 0 ? "text-emerald-600" : "tabular-nums",
                )}
              >
                {shippingFee === 0 ? "مجاناً" : formatDh(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between gap-3 border-t border-[#eadfce] pt-2 text-sm font-extrabold">
              <span>المجموع النهائي</span>
              <span className="tabular-nums text-red-600">{formatDh(finalTotal)}</span>
            </div>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-emerald-700">
            التوصيل يُحسب مرة واحدة فقط — ما كاينش توصيل إضافي على الإضافات.
          </p>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#eadfce] bg-white/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-2">
          <Button
            size="lg"
            disabled={busy}
            onClick={() => void onContinue()}
            className={cn(
              "min-h-12 w-full rounded-full font-extrabold text-white transition-shadow",
              hasUpsells
                ? "bg-emerald-500 shadow-[0_0_28px_rgba(16,185,129,0.55)] hover:bg-emerald-400"
                : "bg-emerald-600 shadow-[0_8px_20px_-10px_rgba(16,185,129,0.65)] hover:bg-emerald-500",
            )}
          >
            {busy ? (
              "جاري تأكيد الطلب..."
            ) : (
              <span className="inline-flex items-center gap-2">
                <ShoppingCart className="size-5" aria-hidden />
                متابعة وإتمام الطلب
                <span className="tabular-nums opacity-90">· {formatDh(finalTotal)}</span>
              </span>
            )}
          </Button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onSkip()}
            className="flex min-h-12 w-full items-center justify-center rounded-full bg-red-600 px-4 text-sm font-extrabold text-white shadow-md hover:bg-red-700 disabled:opacity-70"
          >
            تخطي وإتمام الطلب
          </button>
        </div>
      </div>
    </div>
  );
}
