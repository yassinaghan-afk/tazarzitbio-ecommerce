"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft } from "lucide-react";

import { LAST_ORDER_STORAGE_KEY } from "@/lib/checkout/types";
import type { CreateOrderResponse } from "@/lib/orders/types";
import { getMetaBrowserIds } from "@/lib/meta/browser";
import {
  AMLOU_ROYAL_DEFAULT_OFFER_ID,
  AMLOU_ROYAL_ID,
  AMLOU_ROYAL_IMAGE,
  AMLOU_ROYAL_BENEFITS_IMAGE,
  AMLOU_ROYAL_NAME_AR,
  AMLOU_ROYAL_OFFERS,
  AMLOU_ROYAL_SLUG,
  getAmlouRoyalOffer,
} from "@/lib/products/amlou-royal";
import {
  hasCheckoutErrors,
  normalizeMoroccanPhone,
  validateCheckoutForm,
} from "@/lib/checkout/validation";
import {
  formatRoyalDh,
  withCurrentSearch,
} from "@/lib/royal/order-helpers";
import { trackInitiateCheckout, trackPurchase } from "@/lib/tracking/events";
import { cn } from "@/lib/utils";

type FormState = {
  fullName: string;
  phone: string;
  address: string;
};

type FormErrors = {
  fullName?: string;
  phone?: string;
  address?: string;
};

function CompactField({
  id,
  name,
  type = "text",
  inputMode,
  autoComplete,
  dir,
  placeholder,
  value,
  onChange,
  error,
  label,
}: {
  id: string;
  name: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  dir?: "ltr" | "rtl";
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  label?: string;
}) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1 block text-xs font-bold text-[#1a2744]">
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        dir={dir}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30",
          error ? "border-red-400" : "border-[#e5d9c8]",
        )}
      />
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function RoyalOrderSection({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const [offerId, setOfferId] = useState<string>(AMLOU_ROYAL_DEFAULT_OFFER_ID);
  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const offer = useMemo(
    () => getAmlouRoyalOffer(offerId) ?? AMLOU_ROYAL_OFFERS[1]!,
    [offerId],
  );

  const shippingFee = offer.shippingFee;
  const total = offer.price + shippingFee;

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): FormErrors {
    const next = validateCheckoutForm({
      fullName: form.fullName,
      phone: form.phone,
      address: form.address,
    });
    const royalErrors: FormErrors = {};
    if (next.fullName) {
      royalErrors.fullName = next.fullName.includes("3")
        ? "كتب الاسم الكامل (3 حروف على الأقل)"
        : "الاسم الكامل ضروري";
    }
    if (next.phone) {
      royalErrors.phone = next.phone.includes("صحيح")
        ? "دخل رقم مغربي صحيح (06 أو 07)"
        : "رقم الهاتف ضروري";
    }
    if (next.address) {
      royalErrors.address = "كتب العنوان (المدينة، الحي، أو العنوان الكامل)";
    }
    return royalErrors;
  }

  async function onConfirmClick(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitError("");
    const nextErrors = validate();
    setErrors(nextErrors);
    if (hasCheckoutErrors(nextErrors)) return;

    if (!getAmlouRoyalOffer(offerId)) {
      setSubmitError("هاد العرض ما بقاش متاح. اختار عرض آخر.");
      return;
    }

    trackInitiateCheckout({
      products: [
        {
          productId: AMLOU_ROYAL_ID,
          slug: AMLOU_ROYAL_SLUG,
          name: AMLOU_ROYAL_NAME_AR,
          price: offer.price,
          quantity: offer.bottles,
        },
      ],
      subtotal: offer.price,
      total,
    });

    setSubmitting(true);

    const phone = normalizeMoroccanPhone(form.phone);
    const offerLabel = `${offer.titleAr} · ${offer.weightAr}`;
    const customerNote = [
      `الوزن: ${offer.weightAr}`,
      `العرض: ${offer.titleAr}`,
      offer.giftAr ? "هدية: نعم" : null,
    ]
      .filter(Boolean)
      .join(" | ");
    const metaIds = getMetaBrowserIds();
    const fullAddress = form.address.trim();

    const payload = {
      customerName: form.fullName.trim(),
      phone,
      address: fullAddress,
      customerNote,
      products: [
        {
          productId: AMLOU_ROYAL_ID,
          slug: AMLOU_ROYAL_SLUG,
          nameAr: AMLOU_ROYAL_NAME_AR,
          image: AMLOU_ROYAL_IMAGE,
          offerId: offer.id,
          offerLabel,
          unitPrice: offer.price,
          quantity: 1,
        },
      ],
      subtotal: offer.price,
      shippingPrice: shippingFee,
      total,
      meta: {
        ...(metaIds.fbp ? { fbp: metaIds.fbp } : {}),
        ...(metaIds.fbc ? { fbc: metaIds.fbc } : {}),
        eventSourceUrl:
          typeof window !== "undefined" ? window.location.href : undefined,
      },
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setSubmitting(false);
        setSubmitError("ما قدرناش نسجّلو الطلب. حاول مرة أخرى.");
        return;
      }
      const data = (await res.json()) as CreateOrderResponse;
      const orderId = data.order?.orderId;
      if (!orderId) {
        setSubmitting(false);
        setSubmitError("ما قدرناش نسجّلو الطلب. حاول مرة أخرى.");
        return;
      }

      sessionStorage.setItem(
        LAST_ORDER_STORAGE_KEY,
        JSON.stringify({
          id: orderId,
          placedAt: data.order.createdAt,
          customer: {
            fullName: form.fullName.trim(),
            phone,
            address: fullAddress,
          },
          items: [
            {
              nameAr: AMLOU_ROYAL_NAME_AR,
              offerLabel,
              quantity: offer.bottles,
              unitPrice: offer.price,
              slug: AMLOU_ROYAL_SLUG,
            },
          ],
          subtotal: data.order.subtotal,
          shippingFee: data.order.shippingPrice,
          total: data.order.total,
          shippingLabelFr:
            data.order.shippingPrice === 0
              ? "Livraison gratuite"
              : `Frais de livraison: ${data.order.shippingPrice} MAD`,
          shippingLabelAr:
            data.order.shippingPrice === 0
              ? "التوصيل مجاناً"
              : `+ ${data.order.shippingPrice} درهم توصيل`,
        }),
      );

      trackPurchase({
        orderId,
        products: [
          {
            productId: AMLOU_ROYAL_ID,
            slug: AMLOU_ROYAL_SLUG,
            name: AMLOU_ROYAL_NAME_AR,
            price: offer.price,
            quantity: offer.bottles,
          },
        ],
        subtotal: data.order.subtotal,
        shipping: data.order.shippingPrice,
        total: data.order.total,
        eventId: data.meta?.purchaseEventId,
      });

      router.push(withCurrentSearch("/royal/thank-you"));
    } catch {
      setSubmitting(false);
      setSubmitError("مشكلة فالشبكة. تأكد من الاتصال وحاول مرة أخرى.");
    }
  }

  const content = (
    <>
      <h2 className="text-center text-[1.05rem] font-extrabold leading-snug text-[#1a2744]">
        اختر العرض المناسب لك 👇
      </h2>

      <p
        role="status"
        className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-2 text-center text-xs font-bold leading-snug text-red-700"
      >
        <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
        <span>⚠️ آخر فرصة للطلب! السعر الحالي متاح لفترة محدودة</span>
      </p>

      <div className="mt-3 space-y-2">
        {AMLOU_ROYAL_OFFERS.map((item) => {
          const selected = item.id === offer.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setOfferId(item.id)}
              aria-pressed={selected}
              className={cn(
                "relative w-full rounded-xl border bg-white px-3 py-2.5 text-start transition-colors",
                selected && item.recommended
                  ? "border-red-500 bg-red-50/40 ring-1 ring-red-500"
                  : selected
                    ? "border-[#1a2744] ring-1 ring-[#1a2744]"
                    : "border-[#e5d9c8]",
                (item.recommended || item.bestValue) && "pt-5",
              )}
            >
              {item.recommended && (
                <span className="absolute end-3 top-0 -translate-y-1/2 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  🔥 الأكثر طلباً
                </span>
              )}
              {item.bestValue && (
                <span className="absolute end-3 top-0 flex -translate-y-1/2 items-center gap-1.5">
                  <span className="rounded-md bg-[#1a2744] px-2 py-0.5 text-[10px] font-bold text-white">
                    🏆 أفضل قيمة
                  </span>
                  {item.giftAr && (
                    <span className="royal-gift-badge rounded-md bg-gradient-to-l from-amber-400 via-yellow-300 to-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-[#5c3d0a] shadow-[0_0_12px_rgba(251,191,36,0.85)]">
                      {item.giftAr}
                    </span>
                  )}
                </span>
              )}

              <div className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border-2",
                    selected
                      ? item.recommended
                        ? "border-red-600"
                        : "border-[#1a2744]"
                      : "border-neutral-300",
                  )}
                  aria-hidden
                >
                  {selected && (
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        item.recommended ? "bg-red-600" : "bg-[#1a2744]",
                      )}
                    />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold leading-tight text-[#1a2744]">
                    {item.titleAr}
                  </p>
                  <p className="mt-0.5 text-sm font-bold tabular-nums text-[#8a6a3a]">
                    {item.weightAr}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs font-semibold",
                      item.freeShipping ? "text-emerald-600" : "text-neutral-500",
                    )}
                  >
                    {item.freeShipping
                      ? "🎁 التوصيل مجاناً"
                      : `+ ${item.shippingFee} DH توصيل`}
                  </p>
                </div>

                <div className="shrink-0 text-end leading-none">
                  <p className="whitespace-nowrap text-lg font-extrabold tabular-nums text-[#1a2744]">
                    {formatRoyalDh(item.price)}
                  </p>
                  {item.originalPrice != null && (
                    <p className="mt-0.5 whitespace-nowrap text-xs tabular-nums text-neutral-400 line-through">
                      {formatRoyalDh(item.originalPrice)}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-center text-[11px] font-semibold text-neutral-500">
        العرض المحدد: {offer.titleAr} · {offer.weightAr} · {formatRoyalDh(offer.price)}
      </p>

      <form
        onSubmit={onConfirmClick}
        className="mt-3 rounded-xl border border-[#e5d9c8] bg-white p-3 shadow-[0_6px_20px_-12px_rgba(58,42,24,0.2)]"
        noValidate
      >
        <p className="mb-2.5 text-center text-sm font-extrabold text-[#1a2744]">
          المرجو إدخال معلوماتك أسفله لإتمام الطلب
        </p>

        <div className="mb-3 rounded-xl border border-[#f0e6d8] bg-[#faf6ef] px-3 py-2 text-xs">
          <div className="flex justify-between gap-2">
            <span className="text-neutral-500">العرض</span>
            <span className="font-bold">
              {offer.titleAr} · {offer.weightAr}
            </span>
          </div>
          <div className="mt-1 flex justify-between gap-2">
            <span className="text-neutral-500">التوصيل</span>
            <span className="font-bold text-emerald-600">
              {shippingFee === 0 ? "مجاناً" : formatRoyalDh(shippingFee)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <CompactField
            id="royal-name"
            name="fullName"
            label="الاسم الكامل"
            autoComplete="name"
            placeholder="الاسم الكامل"
            value={form.fullName}
            onChange={(v) => updateField("fullName", v)}
            error={errors.fullName}
          />
          <CompactField
            id="royal-phone"
            name="phone"
            label="رقم الهاتف"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="رقم الهاتف"
            value={form.phone}
            onChange={(v) => updateField("phone", v)}
            error={errors.phone}
          />
          <div>
            <label
              htmlFor="royal-address"
              className="mb-1 block text-xs font-bold text-[#1a2744]"
            >
              العنوان
            </label>
            <textarea
              id="royal-address"
              name="address"
              rows={3}
              autoComplete="street-address"
              placeholder="المدينة، الحي، أو العنوان الكامل…"
              aria-label="العنوان"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              className={cn(
                "w-full resize-none rounded-xl border bg-white px-3.5 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30",
                errors.address ? "border-red-400" : "border-[#e5d9c8]",
              )}
            />
            {errors.address && (
              <p className="mt-1 text-xs font-medium text-red-600" role="alert">
                {errors.address}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-red-600 px-4 text-base font-extrabold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span>
            {submitting ? "كنسجّلو الطلب..." : "تأكيد الطلب"}
          </span>
          <span className="flex size-7 items-center justify-center rounded-full bg-white/20">
            <ArrowLeft className="size-4" aria-hidden />
          </span>
        </button>
        {submitError && (
          <p className="mt-2 text-center text-xs font-semibold text-red-600" role="alert">
            {submitError}
          </p>
        )}
        <p className="mt-2 text-center text-[11px] font-semibold text-neutral-500">
          الدفع عند الاستلام · غادي نتصلو بيك باش نأكدو الطلب
        </p>
      </form>

      <div className="mt-3 w-full">
        <Image
          src={AMLOU_ROYAL_BENEFITS_IMAGE}
          alt="أملو ملكي — مكونات مختارة بعناية من قلب المغرب"
          width={1080}
          height={1920}
          sizes="(max-width: 1024px) 100vw, 480px"
          className="h-auto w-full rounded-xl"
        />
      </div>
    </>
  );

  if (embedded) {
    return <div className="mt-0">{content}</div>;
  }

  return (
    <section id="order" className="scroll-mt-24 bg-[#faf6ef] pb-6 pt-1">
      <div className="mx-auto w-full max-w-md px-3">{content}</div>
    </section>
  );
}
