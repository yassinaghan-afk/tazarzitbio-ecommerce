"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Home, Package, Truck } from "lucide-react";

import type { PlacedOrder } from "@/lib/checkout/types";
import { LAST_ORDER_STORAGE_KEY } from "@/lib/checkout/types";
import { formatRoyalDh, withCurrentSearch } from "@/lib/royal/order-helpers";

export function RoyalThankYouClient() {
  const [hydrated, setHydrated] = useState(false);
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [homeHref, setHomeHref] = useState("/");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_ORDER_STORAGE_KEY);
      if (raw) setOrder(JSON.parse(raw) as PlacedOrder);
    } catch {
      setOrder(null);
    }
    setHomeHref(withCurrentSearch("/"));
    setHydrated(true);
  }, []);

  // Purchase/order_created is tracked only after POST /api/orders succeeds.
  // Do not fire conversion events on thank-you open/refresh.

  return (
    <div className="min-h-[70vh] bg-[#faf6ef] px-3 py-10 text-[#1a2744]" dir="rtl">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-[#eadfce] bg-white p-6 text-center shadow-[0_16px_40px_-24px_rgba(26,39,68,0.35)]">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 ring-2 ring-emerald-200">
            <CheckCircle2 className="size-9 text-emerald-600" aria-hidden />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold leading-snug">
            شكراً على طلبك ❤️
          </h1>
          <p className="mt-2 text-sm font-bold text-emerald-700">
            توصلنا بالطلب ديالك بنجاح.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            غادي نتاصلو بيك قريباً على الرقم اللي عطيتينا لتأكيد الطلب.
          </p>

          {!hydrated && (
            <p className="mt-6 text-sm text-neutral-500">كنحمّلو تفاصيل الطلب...</p>
          )}

          {hydrated && !order && (
            <div className="mt-6 rounded-2xl border border-[#eadfce] bg-[#faf6ef] p-4 text-sm text-neutral-600">
              ما لقيناش تفاصيل الطلب فهاد الجهاز. إلا كنتي صيفطتي الطلب، غادي نتاصلو بيك
              قريباً.
            </div>
          )}

          {hydrated && order && (
            <div className="mt-6 space-y-3 text-start">
              <div className="rounded-2xl border border-[#eadfce] bg-[#faf6ef] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                  رقم الطلب
                </p>
                <p className="mt-1 font-mono text-sm font-bold" dir="ltr">
                  {order.id}
                </p>
              </div>

              <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold text-neutral-500">
                  <Package className="size-3.5" aria-hidden />
                  تفاصيل العرض
                </p>
                <ul className="mt-2 space-y-2">
                  {order.items.map((item, i) => (
                    <li
                      key={`${item.nameAr}-${i}`}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span>
                        <span className="font-extrabold">{item.nameAr}</span>
                        <span className="mt-0.5 block text-xs text-neutral-500">
                          {item.offerLabel}
                        </span>
                      </span>
                      <span className="shrink-0 font-bold tabular-nums">
                        {formatRoyalDh(item.unitPrice)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 space-y-1.5 border-t border-[#eadfce] pt-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-neutral-500">التوصيل</span>
                    <span
                      className={
                        (order.shippingFee ?? 0) === 0
                          ? "font-bold text-emerald-600"
                          : "font-bold tabular-nums"
                      }
                    >
                      {(order.shippingFee ?? 0) === 0
                        ? "مجاناً"
                        : formatRoyalDh(order.shippingFee)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                <p className="flex items-center gap-1.5 font-extrabold text-emerald-800">
                  <Truck className="size-4" aria-hidden />
                  الدفع عند الاستلام (COD)
                </p>
                <p className="mt-1 text-xs leading-relaxed text-emerald-800/80">
                  ما خاصكش تخلص دابا. خلّص المبلغ عند التوصيل بعد ما تتأكد من الطلب.
                </p>
              </div>
            </div>
          )}

          <Link
            href={homeHref}
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1a2744] px-4 text-sm font-extrabold text-white hover:bg-[#243556]"
          >
            <Home className="size-4" aria-hidden />
            الرجوع للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
