"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { LAST_ORDER_STORAGE_KEY } from "@/lib/checkout/types";
import type { CreateOrderResponse } from "@/lib/orders/types";
import { getMetaBrowserIds } from "@/lib/meta/browser";
import {
  AMLOU_ROYAL_DEFAULT_OFFER_ID,
  AMLOU_ROYAL_ID,
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
  AMLOU_ROYAL_FR_NAME,
  AMLOU_ROYAL_FR_OFFERS,
  AMLOU_ROYAL_FR_THANK_YOU,
  formatRoyalFrDh,
  royalFrCopy as t,
  type RoyalFrOfferId,
} from "@/lib/royal/fr-copy";
import { withCurrentSearch } from "@/lib/royal/order-helpers";
import { trackInitiateCheckout } from "@/lib/tracking/events";
import { cn } from "@/lib/utils";

type FormState = { fullName: string; phone: string; address: string };
type FormErrors = { fullName?: string; phone?: string; address?: string };

function frOffer(id: string) {
  return AMLOU_ROYAL_FR_OFFERS[id as RoyalFrOfferId] ?? AMLOU_ROYAL_FR_OFFERS["royal-2"];
}

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

export function RoyalFrOrderSection({ embedded = false }: { embedded?: boolean }) {
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
  const labels = frOffer(offer.id);
  const shippingFee = offer.shippingFee;
  const total = offer.price + shippingFee;

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): FormErrors {
    const next = validateCheckoutForm({
      fullName: form.fullName,
      phone: form.phone,
      address: form.address,
    });
    const out: FormErrors = {};
    if (next.fullName) {
      out.fullName = next.fullName.includes("3") ? t.errNameShort : t.errNameRequired;
    }
    if (next.phone) {
      out.phone = next.phone.includes("صحيح") || next.phone.toLowerCase().includes("valid")
        ? t.errPhoneInvalid
        : t.errPhoneRequired;
    }
    if (next.address) out.address = t.errAddress;
    return out;
  }

  async function onConfirmClick(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitError("");
    const nextErrors = validate();
    setErrors(nextErrors);
    if (hasCheckoutErrors(nextErrors)) return;

    if (!getAmlouRoyalOffer(offerId)) {
      setSubmitError(t.errOfferGone);
      return;
    }

    trackInitiateCheckout({
      products: [
        {
          productId: AMLOU_ROYAL_ID,
          slug: AMLOU_ROYAL_SLUG,
          name: AMLOU_ROYAL_FR_NAME,
          price: offer.price,
          quantity: offer.bottles,
        },
      ],
      subtotal: offer.price,
      total,
    });

    setSubmitting(true);

    const phone = normalizeMoroccanPhone(form.phone);
    const offerLabel = `${labels.title} · ${labels.weight}`;
    const customerNote = [
      `Poids: ${labels.weight}`,
      `Offre: ${labels.title}`,
      "gift" in labels && labels.gift ? "Cadeau: oui" : null,
      "LP: /royalfr",
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
          nameAr: AMLOU_ROYAL_FR_NAME,
          image: offer.image,
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
        setSubmitError(t.errSubmit);
        return;
      }
      const data = (await res.json()) as CreateOrderResponse;
      const orderId = data.order?.orderId;
      if (!orderId) {
        setSubmitting(false);
        setSubmitError(t.errSubmit);
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
              nameAr: AMLOU_ROYAL_FR_NAME,
              offerLabel,
              quantity: 1,
              unitPrice: offer.price,
              slug: AMLOU_ROYAL_SLUG,
              productId: AMLOU_ROYAL_ID,
            },
          ],
          subtotal: data.order.subtotal,
          shippingFee: data.order.shippingPrice,
          total: data.order.total,
          shippingLabelFr:
            data.order.shippingPrice === 0
              ? "Livraison gratuite"
              : `Frais de livraison: ${data.order.shippingPrice} DH`,
          shippingLabelAr:
            data.order.shippingPrice === 0
              ? "التوصيل مجاناً"
              : `+ ${data.order.shippingPrice} درهم توصيل`,
          upsellToken: data.meta?.upsellToken ?? data.order.upsellToken,
          upsellCompleted: false,
          thankYouPath: AMLOU_ROYAL_FR_THANK_YOU,
        }),
      );

      // French upsell (same /upsell page, FR UI via thankYouPath) then thank-you.
      router.push(withCurrentSearch("/upsell"));
    } catch {
      setSubmitting(false);
      setSubmitError(t.errNetwork);
    }
  }

  const content = (
    <>
      <h2 className="text-center text-[1.05rem] font-extrabold leading-snug text-[#1a2744]">
        {t.chooseOffer}
      </h2>

      <p
        role="status"
        className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-2 text-center text-xs font-bold leading-snug text-red-700"
      >
        <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
        <span>{t.urgency}</span>
      </p>

      <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2.5">
        {AMLOU_ROYAL_OFFERS.map((item) => {
          const selected = item.id === offer.id;
          const fr = frOffer(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setOfferId(item.id)}
              aria-pressed={selected}
              className={cn(
                "relative flex min-w-0 flex-col items-center rounded-xl border bg-white px-1 pb-2 pt-2 text-center transition-colors sm:px-2 sm:pb-2.5 sm:pt-2.5",
                selected && item.recommended
                  ? "border-red-500 bg-red-50/40 ring-1 ring-red-500"
                  : selected
                    ? "border-[#1a2744] ring-1 ring-[#1a2744]"
                    : "border-[#e5d9c8]",
              )}
            >
              <span
                className={cn(
                  "absolute end-1.5 top-1.5 z-[1] flex size-3.5 items-center justify-center rounded-full border-2 sm:size-4",
                  selected
                    ? item.recommended
                      ? "border-red-600"
                      : "border-[#1a2744]"
                    : "border-neutral-300 bg-white",
                )}
                aria-hidden
              >
                {selected && (
                  <span
                    className={cn(
                      "size-1.5 rounded-full sm:size-2",
                      item.recommended ? "bg-red-600" : "bg-[#1a2744]",
                    )}
                  />
                )}
              </span>

              <div className="relative mx-auto mt-0.5 aspect-square w-full max-w-[5.75rem] overflow-hidden rounded-lg bg-[#faf6f0] sm:max-w-[7.25rem]">
                <Image
                  src={item.image}
                  alt={`${AMLOU_ROYAL_FR_NAME} — ${fr.title}`}
                  fill
                  sizes="(max-width: 640px) 30vw, 116px"
                  className="object-contain object-center p-0.5"
                  priority={item.recommended}
                />
              </div>

              <p className="mt-1 text-[11px] font-extrabold leading-tight text-[#1a2744] sm:text-sm">
                {fr.title}
              </p>
              <p className="mt-0.5 text-[10px] font-bold tabular-nums text-[#8a6a3a] sm:text-xs">
                {fr.weight}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-[9px] font-semibold leading-tight sm:text-[11px]",
                  item.freeShipping ? "text-emerald-600" : "text-neutral-500",
                )}
              >
                {item.freeShipping
                  ? t.freeShipping
                  : t.shippingPlus(item.shippingFee)}
              </p>

              <div className="mt-1.5 leading-none">
                <p className="whitespace-nowrap text-[15px] font-extrabold tabular-nums tracking-tight text-[#1a2744] sm:text-lg">
                  {formatRoyalFrDh(item.price)}
                </p>
                {item.originalPrice != null && (
                  <p className="mt-0.5 whitespace-nowrap text-[11px] font-semibold tabular-nums text-neutral-400 line-through decoration-neutral-400/90 sm:text-sm">
                    {formatRoyalFrDh(item.originalPrice)}
                  </p>
                )}
              </div>

              <div className="mt-1.5 flex min-h-[2.1rem] w-full flex-col items-center justify-end gap-0.5">
                {item.recommended && (
                  <span className="w-full rounded-md bg-red-600 px-1 py-0.5 text-[9px] font-bold leading-tight text-white sm:text-[10px]">
                    {t.mostOrdered}
                  </span>
                )}
                {item.bestValue && (
                  <span className="w-full rounded-md bg-[#1a2744] px-1 py-0.5 text-[9px] font-bold leading-tight text-white sm:text-[10px]">
                    {t.bestValue}
                  </span>
                )}
                {"gift" in fr && fr.gift && (
                  <span className="royal-gift-badge w-full rounded-md bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 px-1 py-0.5 text-[9px] font-extrabold leading-tight text-[#5c3d0a] sm:text-[10px]">
                    {fr.gift}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-center text-[11px] font-semibold text-neutral-500">
        {t.selectedOffer}: {labels.title} · {labels.weight} ·{" "}
        {formatRoyalFrDh(offer.price)}
      </p>

      <form
        onSubmit={onConfirmClick}
        className="mt-3 rounded-xl border border-[#e5d9c8] bg-white p-3 shadow-[0_6px_20px_-12px_rgba(58,42,24,0.2)]"
        noValidate
      >
        <p className="mb-2.5 text-center text-sm font-extrabold text-[#1a2744]">
          {t.formHeading}
        </p>

        <div className="mb-3 rounded-xl border border-[#f0e6d8] bg-[#faf6ef] px-3 py-2 text-xs">
          <div className="flex justify-between gap-2">
            <span className="text-neutral-500">{t.labelOffer}</span>
            <span className="font-bold">
              {labels.title} · {labels.weight}
            </span>
          </div>
          <div className="mt-1 flex justify-between gap-2">
            <span className="text-neutral-500">{t.labelShipping}</span>
            <span className="font-bold text-emerald-600">
              {shippingFee === 0 ? t.free : formatRoyalFrDh(shippingFee)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <CompactField
            id="royalfr-name"
            name="fullName"
            label={t.fullName}
            autoComplete="name"
            placeholder={t.fullName}
            value={form.fullName}
            onChange={(v) => updateField("fullName", v)}
            error={errors.fullName}
          />
          <CompactField
            id="royalfr-phone"
            name="phone"
            label={t.phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="06XXXXXXXX"
            value={form.phone}
            onChange={(v) => updateField("phone", v)}
            error={errors.phone}
          />
          <div>
            <label
              htmlFor="royalfr-address"
              className="mb-1 block text-xs font-bold text-[#1a2744]"
            >
              {t.address}
            </label>
            <textarea
              id="royalfr-address"
              name="address"
              rows={3}
              autoComplete="street-address"
              placeholder={t.addressPlaceholder}
              aria-label={t.address}
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
          <span>{submitting ? t.submitting : t.confirmOrder}</span>
          <span className="flex size-7 items-center justify-center rounded-full bg-white/20">
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </button>
        {submitError && (
          <p className="mt-2 text-center text-xs font-semibold text-red-600" role="alert">
            {submitError}
          </p>
        )}
        <p className="mt-2 text-center text-[11px] font-semibold text-neutral-500">
          {t.codNote}
        </p>
      </form>
    </>
  );

  if (embedded) return <div className="mt-0">{content}</div>;

  return (
    <section id="order" className="scroll-mt-24 bg-[#faf6ef] pb-6 pt-1">
      <div className="mx-auto w-full max-w-md px-3">{content}</div>
    </section>
  );
}
