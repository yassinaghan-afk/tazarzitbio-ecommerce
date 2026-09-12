"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, Minus, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PlacedOrder } from "@/lib/checkout/types";
import type { UpsellOrderResponse } from "@/lib/orders/types";
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
  trackUpsellAdd,
  trackUpsellComplete,
  trackUpsellSkip,
  trackUpsellView,
} from "@/lib/tracking/events";
import { cn } from "@/lib/utils";

function formatDh(n: number): string {
  return `${n} درهم`;
}

export function RoyalUpsellPage() {
  const router = useRouter();
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [selection, setSelection] = useState<UpsellSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [addedFlash, setAddedFlash] = useState(false);
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

  function persistSelection(next: UpsellSelection[]) {
    setSelection(next);
    if (order?.id) writeUpsellSelection(order.id, next);
  }

  function isSelected(productId: string): boolean {
    return selection.some((s) => s.productId === productId);
  }

  function toggleProduct(product: PublicProduct) {
    if (!order) return;
    setError("");
    const offer =
      [...product.offers].sort((a, b) => a.price - b.price)[0] ?? null;
    if (!offer) return;

    if (isSelected(product.id)) {
      persistSelection(selection.filter((s) => s.productId !== product.id));
      return;
    }

    const next: UpsellSelection = {
      productId: product.id,
      offerId: offer.id,
      quantity: 1,
      nameAr: product.nameAr,
      image: product.image,
      unitPrice: offer.price,
      offerLabel: offer.label,
      slug: product.slug,
    };
    persistSelection([...selection, next]);
    trackUpsellAdd({
      orderId: order.id,
      productId: product.id,
      quantity: 1,
      value: offer.price,
    });
  }

  function updateQty(productId: string, delta: number) {
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
    action: "sync" | "complete" | "skip",
  ): Promise<UpsellOrderResponse | null> {
    if (!order?.upsellToken) return null;
    const res = await fetch(`/api/orders/${encodeURIComponent(order.id)}/upsell`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: order.upsellToken,
        action,
        items: selection.map((s) => ({
          productId: s.productId,
          offerId: s.offerId,
          quantity: s.quantity,
        })),
      }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error || "failed");
    }
    return (await res.json()) as UpsellOrderResponse;
  }

  function goThankYou(updated?: PlacedOrder) {
    const path = updated?.thankYouPath ?? order?.thankYouPath ?? "/thank-you";
    if (order?.id) clearUpsellSelection(order.id);
    router.replace(withSearch(path));
  }

  async function onSkip() {
    if (!order || busy) return;
    setBusy(true);
    setError("");
    trackUpsellSkip({ orderId: order.id });
    try {
      const data = await callUpsell("skip");
      if (data?.order) {
        const next = placedOrderFromApiOrder(data.order, {
          ...order,
          upsellCompleted: true,
        });
        writePlacedOrder(next);
        goThankYou(next);
        return;
      }
    } catch {
      // Original order must never be blocked by upsell failure.
    }
    writePlacedOrder({ ...order, upsellCompleted: true });
    goThankYou({ ...order, upsellCompleted: true });
  }

  async function onContinue() {
    if (!order || busy) return;
    if (selection.length === 0) {
      await onSkip();
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await callUpsell("complete");
      if (!data?.order) throw new Error("failed");
      const next = placedOrderFromApiOrder(data.order, {
        ...order,
        upsellCompleted: true,
      });
      writePlacedOrder(next);
      trackUpsellComplete({
        orderId: order.id,
        itemCount: selection.length,
        upsellTotal: upsellSubtotal,
      });
      setAddedFlash(true);
      window.setTimeout(() => goThankYou(next), 700);
    } catch {
      setBusy(false);
      setError("ما قدرناش نزيدو المنتجات دابا. حاول مرة أخرى أو اضغط تخطي.");
    }
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#faf6ef] text-sm text-neutral-500">
        كنحمّلو عرضك الخاص...
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-[#faf6ef] pb-28 text-[#1a2744]" dir="rtl">
      <div className="mx-auto w-full max-w-lg px-3 pt-6 sm:px-4">
        <div className="rounded-3xl border border-[#eadfce] bg-gradient-to-b from-[#fff8eb] to-white p-5 text-center shadow-[0_16px_40px_-28px_rgba(26,39,68,0.4)]">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#1a2744] text-amber-300">
            <Sparkles className="size-6" aria-hidden />
          </div>
          <h1 className="mt-3 text-xl font-extrabold leading-snug sm:text-2xl">
            لحظة واحدة قبل ما نكمل طلبك 👑
          </h1>
          <p className="mt-2 text-sm font-bold text-[#8a6a3a]">
            عندك فرصة تزيد منتجات أخرى لطلبك بثمنها فقط
          </p>
          <p className="mt-1 text-sm font-extrabold text-emerald-700">
            بدون مصاريف توصيل إضافية
          </p>
          <p className="mt-3 text-xs leading-relaxed text-neutral-600">
            المنتجات التالية يمكن إضافتها مباشرة إلى نفس طلبك، ولن تدفع أي توصيل
            إضافي.
          </p>
        </div>

        {addedFlash && (
          <p
            className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-center text-sm font-bold text-emerald-700"
            role="status"
          >
            تمت إضافة المنتجات إلى طلبك ✓
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-700" role="alert">
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
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-[#f3ebe0]">
                      <Image
                        src={product.image}
                        alt={product.nameAr}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-extrabold leading-snug">
                        {product.nameAr}
                      </h2>
                      {product.shortDescription && (
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-neutral-500">
                          {product.shortDescription}
                        </p>
                      )}
                      <p className="mt-1.5 text-base font-extrabold tabular-nums text-[#1a2744]">
                        {offer ? formatDh(offer.price) : formatDh(product.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-t border-[#f0e6d8] px-3 py-2.5">
                    {selected && selectedLine && (
                      <div className="flex items-center gap-1 rounded-full border border-[#eadfce] bg-[#faf6ef] px-1">
                        <button
                          type="button"
                          aria-label="إنقاص"
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
                          className="flex size-8 items-center justify-center"
                          onClick={() => updateQty(product.id, 1)}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleProduct(product)}
                      className={cn(
                        "ms-auto flex min-h-11 min-w-[7.5rem] items-center justify-center gap-1.5 rounded-full px-4 text-sm font-extrabold text-white",
                        selected
                          ? "bg-emerald-600 hover:bg-emerald-700"
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
              <span className="text-neutral-500">المنتجات المضافة</span>
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
          {selection.length > 0 && (
            <Button
              size="lg"
              disabled={busy}
              onClick={() => void onContinue()}
              className="min-h-12 w-full rounded-full bg-[#1a2744] font-extrabold text-white hover:bg-[#243556]"
            >
              {busy ? "كنكمّلو الطلب..." : `متابعة وإتمام الطلب · ${formatDh(finalTotal)}`}
            </Button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void onSkip()}
            className="flex min-h-12 w-full items-center justify-center rounded-full bg-red-600 px-4 text-sm font-extrabold text-white hover:bg-red-700 disabled:opacity-70"
          >
            تخطي والانتقال لإتمام الطلب
          </button>
        </div>
      </div>
    </div>
  );
}
