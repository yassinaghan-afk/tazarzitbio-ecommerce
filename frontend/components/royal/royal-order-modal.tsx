"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Phone,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";

import { LAST_ORDER_STORAGE_KEY } from "@/lib/checkout/types";
import {
  hasCheckoutErrors,
  normalizeMoroccanPhone,
  validateCheckoutForm,
} from "@/lib/checkout/validation";
import { getMetaBrowserIds } from "@/lib/meta/browser";
import type { CreateOrderResponse } from "@/lib/orders/types";
import {
  AMLOU_ROYAL_DEFAULT_OFFER_ID,
  AMLOU_ROYAL_ID,
  AMLOU_ROYAL_IMAGE,
  AMLOU_ROYAL_BENEFITS_IMAGE,
  AMLOU_ROYAL_NAME_AR,
  AMLOU_ROYAL_OFFERS,
  AMLOU_ROYAL_SLUG,
  getAmlouRoyalOffer,
  type AmlouRoyalOffer,
} from "@/lib/products/amlou-royal";
import {
  formatRoyalDh,
  withCurrentSearch,
} from "@/lib/royal/order-helpers";
import { trackInitiateCheckout, trackPurchase } from "@/lib/tracking/events";
import { cn } from "@/lib/utils";

type Step = "offers" | "form";

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

function OfferCard({
  item,
  selected,
  onSelect,
}: {
  item: AmlouRoyalOffer;
  selected: boolean;
  onSelect: () => void;
}) {
  const savings =
    item.originalPrice != null && item.originalPrice > item.price
      ? item.originalPrice - item.price
      : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border bg-white text-start transition-all",
        selected
          ? "border-red-500 ring-2 ring-red-500/40 shadow-[0_8px_24px_-12px_rgba(220,38,38,0.45)]"
          : "border-[#e5d9c8] hover:border-[#cbb895]",
      )}
    >
      {(item.recommended || item.bestValue || item.giftAr) && (
        <div className="absolute end-2 top-2 z-10 flex flex-wrap justify-end gap-1">
          {item.recommended && (
            <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
              الأكثر طلباً
            </span>
          )}
          {item.bestValue && (
            <span className="rounded-md bg-[#1a2744] px-2 py-0.5 text-[10px] font-bold text-white">
              أفضل قيمة
            </span>
          )}
          {item.giftAr && (
            <span className="royal-gift-badge rounded-md bg-gradient-to-l from-amber-400 via-yellow-300 to-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-[#5c3d0a]">
              {item.giftAr}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-3 p-3">
        <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-[#f3ebe0]">
          <Image
            src={AMLOU_ROYAL_IMAGE}
            alt={AMLOU_ROYAL_NAME_AR}
            fill
            sizes="72px"
            className="object-cover"
          />
          {selected && (
            <span className="absolute inset-0 flex items-center justify-center bg-red-600/20">
              <span className="flex size-7 items-center justify-center rounded-full bg-red-600 text-white">
                <Check className="size-4" aria-hidden />
              </span>
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 pe-1">
          <p className="text-sm font-extrabold text-[#1a2744]">{item.titleAr}</p>
          <p className="mt-0.5 text-xs font-semibold text-[#8a6a3a]">
            {item.weightAr}
          </p>
          <p
            className={cn(
              "mt-1 text-xs font-bold",
              item.freeShipping ? "text-emerald-600" : "text-neutral-500",
            )}
          >
            {item.freeShipping
              ? "التوصيل مجاناً لجميع المدن"
              : `+ ${item.shippingFee} درهم توصيل`}
          </p>
          {savings > 0 && (
            <p className="mt-0.5 text-[11px] font-bold text-red-600">
              توفير {formatRoyalDh(savings)}
            </p>
          )}
        </div>

        <div className="shrink-0 self-center text-end">
          <p className="text-lg font-extrabold tabular-nums text-[#1a2744]">
            {formatRoyalDh(item.price)}
          </p>
          {item.originalPrice != null && (
            <p className="text-xs tabular-nums text-neutral-400 line-through">
              {formatRoyalDh(item.originalPrice)}
            </p>
          )}
        </div>
      </div>

      <div
        className={cn(
          "border-t px-3 py-2 text-center text-xs font-extrabold",
          selected
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-[#f0e6d8] bg-[#faf6ef] text-[#1a2744]",
        )}
      >
        {selected ? "تم اختيار هاد العرض ✓" : "اختيار هاد العرض"}
      </div>
    </button>
  );
}

export function RoyalOrderModal({
  open,
  onClose,
  initialOfferId = AMLOU_ROYAL_DEFAULT_OFFER_ID,
}: {
  open: boolean;
  onClose: () => void;
  initialOfferId?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("offers");
  const [offerId, setOfferId] = useState(initialOfferId);
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

  useEffect(() => {
    if (!open) return;
    setStep("offers");
    setOfferId(initialOfferId);
    setSubmitError("");
    setErrors({});
    setSubmitting(false);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, initialOfferId]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validateForm(): FormErrors {
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

  function goToForm() {
    if (!getAmlouRoyalOffer(offerId)) {
      setSubmitError("هاد العرض ما بقاش متاح. اختار عرض آخر.");
      return;
    }
    setSubmitError("");
    setStep("form");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitError("");
    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (hasCheckoutErrors(nextErrors)) return;

    if (!getAmlouRoyalOffer(offerId)) {
      setSubmitError("هاد العرض ما بقاش متاح. رجّع واختَر عرض آخر.");
      setStep("offers");
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

      onClose();
      router.push(withCurrentSearch("/royal/thank-you"));
    } catch {
      setSubmitting(false);
      setSubmitError("مشكلة فالشبكة. تأكد من الاتصال وحاول مرة أخرى.");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="إغلاق"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-[#1a2744]/55 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={step === "offers" ? "اختر العرض" : "معلومات الطلب"}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 48 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[90] mx-auto flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-[#e5d9c8] bg-[#faf6ef] shadow-2xl sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:max-h-[90dvh] sm:-translate-y-1/2 sm:rounded-3xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#eadfce] bg-white/80 px-4 py-3 backdrop-blur-md">
              <div className="min-w-0">
                {step === "form" ? (
                  <button
                    type="button"
                    onClick={() => setStep("offers")}
                    className="flex items-center gap-1 text-sm font-bold text-[#1a2744]"
                  >
                    <ArrowRight className="size-4" aria-hidden />
                    رجوع للعروض
                  </button>
                ) : (
                  <h2 className="text-base font-extrabold text-[#1a2744]">
                    اختر العرض المناسب ليك
                  </h2>
                )}
                <p className="mt-0.5 text-[11px] font-semibold text-neutral-500">
                  {step === "offers"
                    ? "خطوة 1 من 2 · الدفع عند الاستلام"
                    : "خطوة 2 من 2 · كمّل معلوماتك"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق"
                className="flex size-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              {step === "offers" ? (
                <div className="space-y-3">
                  {AMLOU_ROYAL_OFFERS.map((item) => (
                    <OfferCard
                      key={item.id}
                      item={item}
                      selected={item.id === offer.id}
                      onSelect={() => setOfferId(item.id)}
                    />
                  ))}
                </div>
              ) : (
                <form id="royal-order-form" onSubmit={onSubmit} noValidate>
                  <div className="mb-4 overflow-hidden rounded-2xl border border-[#e5d9c8] bg-white">
                    <div className="flex gap-3 p-3">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[#f3ebe0]">
                        <Image
                          src={AMLOU_ROYAL_IMAGE}
                          alt={AMLOU_ROYAL_NAME_AR}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold text-[#1a2744]">
                          {AMLOU_ROYAL_NAME_AR}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-[#8a6a3a]">
                          {offer.titleAr} · {offer.weightAr}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep("offers")}
                        className="self-start text-[11px] font-bold text-red-600 underline"
                      >
                        تغيير
                      </button>
                    </div>
                    <div className="space-y-1.5 border-t border-[#f0e6d8] bg-[#faf6ef]/80 px-3 py-2.5 text-xs">
                      <div className="flex justify-between gap-3">
                        <span className="text-neutral-500">ثمن المنتوج</span>
                        <span className="font-bold tabular-nums">
                          {formatRoyalDh(offer.price)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-neutral-500">التوصيل</span>
                        <span
                          className={cn(
                            "font-bold",
                            shippingFee === 0
                              ? "text-emerald-600"
                              : "tabular-nums",
                          )}
                        >
                          {shippingFee === 0
                            ? "مجاناً"
                            : formatRoyalDh(shippingFee)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Field
                      id="royal-modal-name"
                      label="الاسم الكامل"
                      value={form.fullName}
                      onChange={(v) => updateField("fullName", v)}
                      error={errors.fullName}
                      autoComplete="name"
                      placeholder="مثال: فاطمة الزهراء"
                    />
                    <Field
                      id="royal-modal-phone"
                      label="رقم الهاتف"
                      type="tel"
                      inputMode="tel"
                      dir="ltr"
                      value={form.phone}
                      onChange={(v) => updateField("phone", v)}
                      error={errors.phone}
                      autoComplete="tel"
                      placeholder="06XXXXXXXX"
                    />
                    <div>
                      <label
                        htmlFor="royal-modal-address"
                        className="mb-1 block text-xs font-bold text-[#1a2744]"
                      >
                        العنوان
                      </label>
                      <textarea
                        id="royal-modal-address"
                        rows={3}
                        value={form.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        placeholder="المدينة، الحي، أو العنوان الكامل…"
                        autoComplete="street-address"
                        className={cn(
                          "w-full resize-none rounded-xl border bg-white px-3.5 py-2.5 text-sm leading-relaxed",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30",
                          errors.address ? "border-red-400" : "border-[#e5d9c8]",
                        )}
                      />
                      {errors.address && (
                        <p
                          className="mt-1 text-xs font-medium text-red-600"
                          role="alert"
                        >
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <ul className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-neutral-600">
                    <li className="rounded-xl bg-white px-2 py-2 ring-1 ring-[#eadfce]">
                      <Truck className="mx-auto mb-1 size-3.5 text-emerald-600" />
                      توصيل مجاني
                    </li>
                    <li className="rounded-xl bg-white px-2 py-2 ring-1 ring-[#eadfce]">
                      <ShieldCheck className="mx-auto mb-1 size-3.5 text-[#1a2744]" />
                      دفع عند الاستلام
                    </li>
                    <li className="rounded-xl bg-white px-2 py-2 ring-1 ring-[#eadfce]">
                      <Phone className="mx-auto mb-1 size-3.5 text-red-600" />
                      نتصلو بيك للتأكيد
                    </li>
                  </ul>

                  {submitError && (
                    <p
                      className="mt-3 text-center text-xs font-semibold text-red-600"
                      role="alert"
                    >
                      {submitError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-red-600 px-4 text-base font-extrabold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Lock className="size-4 opacity-80" aria-hidden />
                    {submitting ? "كنسجّلو الطلب..." : "تأكيد الطلب"}
                  </button>
                  <p className="mt-2 text-center text-[11px] font-semibold text-neutral-500">
                    الدفع عند الاستلام · غادي نتصلو بيك باش نأكدو الطلب
                  </p>

                  <div className="mt-3 w-full overflow-hidden rounded-xl">
                    <Image
                      src={AMLOU_ROYAL_BENEFITS_IMAGE}
                      alt="أملو ملكي — مكونات مختارة بعناية من قلب المغرب"
                      width={1080}
                      height={1920}
                      sizes="(max-width: 640px) 100vw, 512px"
                      className="h-auto w-full"
                    />
                  </div>
                </form>
              )}
            </div>

            {step === "offers" && (
              <div className="shrink-0 border-t border-[#eadfce] bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
                {submitError && (
                  <p
                    className="mb-2 text-center text-xs font-semibold text-red-600"
                    role="alert"
                  >
                    {submitError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={goToForm}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-red-600 px-4 text-base font-extrabold text-white shadow-sm hover:bg-red-700"
                >
                  متابعة الطلب
                  <ArrowLeft className="size-4" aria-hidden />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  dir,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-bold text-[#1a2744]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        dir={dir}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-11 w-full rounded-xl border bg-white px-3.5 text-sm",
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
