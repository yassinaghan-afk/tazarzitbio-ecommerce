"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, Minus, Plus, ShoppingCart, Sparkles } from "lucide-react";

import { WeightOfferModal } from "@/components/catalog/weight-offer-modal";
import { Button } from "@/components/ui/button";
import type { PlacedOrder } from "@/lib/checkout/types";
import { getMetaBrowserIds } from "@/lib/meta/browser";
import type { UpsellOrderResponse } from "@/lib/orders/types";
import { UPSELL_DISCOUNT_PERCENT } from "@/lib/orders/upsell-pricing";
import type { PublicProduct, PublicProductOffer } from "@/lib/products/types";
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

function cheapestOffer(product: PublicProduct) {
  return [...product.offers].sort((a, b) => a.price - b.price)[0] ?? null;
}

function productSize(product: PublicProduct, offerId?: string): string {
  const offer =
    (offerId ? product.offers.find((o) => o.id === offerId) : null) ??
    cheapestOffer(product);
  return (offer?.weight || product.weight || "").trim();
}

export function RoyalUpsellPage() {
  const router = useRouter();
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [selection, setSelection] = useState<UpsellSelection[]>([]);
  /** Draft qty for cards not yet added (and seed when adding). */
  const [draftQty, setDraftQty] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [weightProduct, setWeightProduct] = useState<PublicProduct | null>(null);

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

  // Keep selection unit prices aligned with catalog (never apply a fake discount).
  useEffect(() => {
    if (!order?.id || products.length === 0 || selection.length === 0) return;
    const byId = new Map(products.map((p) => [p.id, p]));
    let changed = false;
    const next = selection.map((line) => {
      const product = byId.get(line.productId);
      if (!product) return line;
      const offer =
        product.offers.find((o) => o.id === line.offerId) ?? cheapestOffer(product);
      if (!offer) return line;
      const unitPrice = offer.price;
      const weight = productSize(product, offer.id);
      if (line.unitPrice === unitPrice && line.weight === weight) return line;
      changed = true;
      return {
        ...line,
        unitPrice,
        listUnitPrice: unitPrice,
        offerId: offer.id,
        offerLabel: offer.label,
        ...(weight ? { weight } : { weight: undefined }),
      };
    });
    if (changed) {
      setSelection(next);
      writeUpsellSelection(order.id, next);
    }
  }, [products, order?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- sync once catalog arrives

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

  function getQty(productId: string): number {
    const selected = selection.find((s) => s.productId === productId);
    if (selected) return selected.quantity;
    return draftQty[productId] ?? 1;
  }

  function changeQty(productId: string, delta: number) {
    if (busy) return;
    const selected = selection.find((s) => s.productId === productId);
    if (selected) {
      const qty = Math.min(20, Math.max(1, selected.quantity + delta));
      persistSelection(
        selection.map((s) => (s.productId === productId ? { ...s, quantity: qty } : s)),
      );
      return;
    }
    setDraftQty((prev) => ({
      ...prev,
      [productId]: Math.min(20, Math.max(1, (prev[productId] ?? 1) + delta)),
    }));
  }

  function addProductWithOffer(product: PublicProduct, offer: PublicProductOffer) {
    if (!order || busy) return;
    setError("");
    const unitPrice = offer.price;
    const weight = productSize(product, offer.id);
    const quantity = getQty(product.id);
    const next: UpsellSelection = {
      productId: product.id,
      offerId: offer.id,
      quantity,
      nameAr: product.nameAr,
      image: product.image,
      unitPrice,
      listUnitPrice: unitPrice,
      offerLabel: offer.label,
      slug: product.slug,
      ...(weight ? { weight } : {}),
    };
    // Replace existing line for same product if any
    const without = selection.filter((s) => s.productId !== product.id);
    persistSelection([...without, next]);
    trackUpsellAdd({
      orderId: order.id,
      productId: product.id,
      quantity,
      value: unitPrice * quantity,
    });
  }

  function toggleProduct(product: PublicProduct) {
    if (!order || busy) return;
    setError("");

    if (isSelected(product.id)) {
      persistSelection(selection.filter((s) => s.productId !== product.id));
      return;
    }

    if (product.offers.length > 1) {
      setWeightProduct(product);
      return;
    }

    const offer = cheapestOffer(product);
    if (!offer) return;
    addProductWithOffer(product, offer);
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
      <WeightOfferModal
        product={weightProduct}
        open={Boolean(weightProduct)}
        onClose={() => setWeightProduct(null)}
        confirmLabel="أضف إلى الطلب"
        onConfirmOffer={(offer) => {
          if (!weightProduct) return;
          addProductWithOffer(weightProduct, offer);
          setWeightProduct(null);
        }}
      />
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
              const selectedLine = selection.find((s) => s.productId === product.id);
              const offer =
                (selectedLine
                  ? product.offers.find((o) => o.id === selectedLine.offerId)
                  : null) ?? cheapestOffer(product);
              const price = selectedLine?.unitPrice ?? offer?.price ?? product.price;
              const size =
                selectedLine?.weight || productSize(product, offer?.id);
              const qty = getQty(product.id);
              return (
                <article
                  key={product.id}
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-white transition-shadow",
                    selected
                      ? "border-amber-500/70 shadow-[0_8px_24px_-16px_rgba(180,130,40,0.45)]"
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
                      <span
                        className="absolute start-1.5 top-1.5 rounded-md bg-red-600 px-1.5 py-0.5 text-[11px] font-black tracking-wide text-white shadow-[0_0_12px_rgba(220,38,38,0.55)] ring-1 ring-white/40"
                        aria-hidden
                      >
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
                          {product.offers.length > 1 && !selected
                            ? " · اضغط للإضافة واختيار الوزن"
                            : ""}
                        </p>
                      ) : product.offers.length > 1 && !selected ? (
                        <p className="mt-0.5 text-xs font-bold text-[#8a6a3a]">
                          أوزان متعددة — اضغط للإضافة واختيار الوزن
                        </p>
                      ) : null}
                      <p className="mt-1.5 text-lg font-black tabular-nums text-[#1a2744]">
                        {selected
                          ? formatDh(price)
                          : product.offers.length > 1
                            ? `ابتداءً من ${formatDh(price)}`
                            : formatDh(price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-[#f0e6d8] px-3 py-2.5">
                    <div className="flex items-center gap-1 rounded-full border border-[#eadfce] bg-[#faf6ef] px-1 shadow-sm">
                      <button
                        type="button"
                        aria-label="إنقاص الكمية"
                        disabled={busy || qty <= 1}
                        className="flex size-9 items-center justify-center disabled:opacity-40"
                        onClick={() => changeQty(product.id, -1)}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="min-w-7 text-center text-sm font-bold tabular-nums">
                        {qty}
                      </span>
                      <button
                        type="button"
                        aria-label="زيادة الكمية"
                        disabled={busy || qty >= 20}
                        className="flex size-9 items-center justify-center disabled:opacity-40"
                        onClick={() => changeQty(product.id, 1)}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>

                    <Button
                      type="button"
                      variant="gold"
                      disabled={busy}
                      onClick={() => toggleProduct(product)}
                      className={cn(
                        "ms-auto min-h-11 min-w-[7.5rem] rounded-full px-4 text-sm font-extrabold shadow-gold",
                        selected && "bg-[#c9a227] hover:bg-[#b8921f]",
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
                    </Button>
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
