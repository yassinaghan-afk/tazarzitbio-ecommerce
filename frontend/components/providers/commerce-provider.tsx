"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import type { AddToCartPayload, CartLineItem } from "@/lib/cart/types";
import {
  calcSubtotal,
  createLineId,
  getCartCount,
  loadCartFromStorage,
  saveCartToStorage,
} from "@/lib/cart/utils";
import type { CheckoutFormData, PlacedOrder } from "@/lib/checkout/types";
import { LAST_ORDER_STORAGE_KEY } from "@/lib/checkout/types";
import {
  hasCheckoutErrors,
  validateCheckoutFormLocalized,
} from "@/lib/i18n/checkout-validation";
import { useLanguage } from "@/lib/i18n/language-provider";
import { getHoneyUpsellRecommendations } from "@/lib/products/honey-upsell";
import {
  calculateShipping,
  loadShippingSettings,
  type ShippingResult,
  type ShippingSettings,
} from "@/lib/shipping";
import type { CreateOrderInput, CreateOrderResponse } from "@/lib/orders/types";
import { getMetaBrowserIds } from "@/lib/meta/browser";
import { trackAddToCart, trackPurchase } from "@/lib/tracking/events";

export interface AppliedCoupon {
  code: string;
  discount: number;
  freeShipping: boolean;
}

interface CommerceContextValue {
  items: CartLineItem[];
  itemCount: number;
  subtotal: number;
  shipping: ShippingResult;
  coupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<{ ok: boolean; reason?: string }>;
  removeCoupon: () => void;
  cartOpen: boolean;
  checkoutOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  addToCart: (payload: AddToCartPayload) => void;
  orderNow: (payload: Omit<AddToCartPayload, "openDrawer">) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  crossSellProducts: ReturnType<typeof getHoneyUpsellRecommendations>;
  submitOrder: (
    form: CheckoutFormData,
  ) => { success: boolean; errors?: import("@/lib/checkout/types").CheckoutFormErrors };
}

const CommerceContext = createContext<CommerceContextValue | null>(null);

function applyAddToCart(
  prev: CartLineItem[],
  payload: AddToCartPayload,
): CartLineItem[] {
  const lineId = createLineId(payload.productId, payload.offerId);
  const qty = payload.quantity ?? 1;
  const existing = prev.find((i) => i.lineId === lineId);
  if (existing) {
    return prev.map((i) =>
      i.lineId === lineId
        ? {
            ...i,
            quantity: i.quantity + qty,
            isBundle: payload.isBundle ?? i.isBundle,
          }
        : i,
    );
  }
  return [
    ...prev,
    {
      lineId,
      productId: payload.productId,
      slug: payload.slug,
      nameAr: payload.nameAr,
      image: payload.image,
      offerId: payload.offerId,
      offerLabel: payload.offerLabel,
      unitPrice: payload.unitPrice,
      quantity: qty,
      isBundle: payload.isBundle,
    },
  ];
}

export function CommerceProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { locale } = useLanguage();
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [settingsVersion, setSettingsVersion] = useState(0);
  const [serverSettings, setServerSettings] = useState<ShippingSettings | null>(
    null,
  );
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  // Shipping rules are managed in Admin → Shipping and stored on the server.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/shipping-settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { shippingSettings?: ShippingSettings } | null) => {
        if (!cancelled && data?.shippingSettings) {
          setServerSettings(data.shippingSettings);
        }
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [settingsVersion]);

  useEffect(() => {
    const stored = loadCartFromStorage();
    setItems(stored.items);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveCartToStorage({ items });
  }, [items, hydrated]);

  useEffect(() => {
    const bump = () => setSettingsVersion((v) => v + 1);
    window.addEventListener("tazarzit-pricing-updated", bump);
    window.addEventListener("tazarzit-shipping-updated", bump);
    return () => {
      window.removeEventListener("tazarzit-pricing-updated", bump);
      window.removeEventListener("tazarzit-shipping-updated", bump);
    };
  }, []);

  const itemCount = useMemo(() => getCartCount(items), [items]);
  const subtotal = useMemo(() => calcSubtotal(items), [items]);

  const shipping = useMemo(() => {
    const settings = serverSettings ?? loadShippingSettings();
    const base = calculateShipping(items, subtotal, settings);
    if (!coupon || items.length === 0) return base;
    // apply coupon on top of the base shipping computation
    const shippingFee = coupon.freeShipping ? 0 : base.shippingFee;
    const discount = Math.min(coupon.discount, base.subtotal);
    return {
      ...base,
      shippingFee,
      isFreeShipping: shippingFee === 0,
      freeShippingReason:
        coupon.freeShipping && base.shippingFee > 0
          ? ("coupon" as const)
          : base.freeShippingReason,
      total: Math.max(0, base.subtotal - discount + shippingFee),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, subtotal, settingsVersion, serverSettings, coupon]);

  const applyCoupon = useCallback(
    async (code: string): Promise<{ ok: boolean; reason?: string }> => {
      try {
        const res = await fetch("/api/promotions/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, subtotal }),
        });
        const data = (await res.json()) as {
          valid?: boolean;
          reason?: string;
          code?: string;
          discount?: number;
          freeShipping?: boolean;
        };
        if (!data.valid) {
          setCoupon(null);
          return { ok: false, reason: data.reason ?? "not_found" };
        }
        setCoupon({
          code: data.code ?? code.trim().toUpperCase(),
          discount: data.discount ?? 0,
          freeShipping: Boolean(data.freeShipping),
        });
        return { ok: true };
      } catch {
        return { ok: false, reason: "network" };
      }
    },
    [subtotal],
  );

  const removeCoupon = useCallback(() => setCoupon(null), []);

  const cartSlugs = useMemo(() => [...new Set(items.map((i) => i.slug))], [items]);

  const crossSellProducts = useMemo(() => {
    return getHoneyUpsellRecommendations(cartSlugs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSlugs, settingsVersion]);

  const openDrawerAfterAdd = useCallback((mode: AddToCartPayload["openDrawer"]) => {
    if (mode === "checkout") {
      setCartOpen(false);
      setCheckoutOpen(true);
    } else if (mode === "cart") {
      setCheckoutOpen(false);
      setCartOpen(true);
    }
  }, []);

  const addToCart = useCallback(
    (payload: AddToCartPayload) => {
      const mode = payload.openDrawer ?? "cart";
      const qty = payload.quantity ?? 1;
      setItems((prev) => applyAddToCart(prev, payload));
      openDrawerAfterAdd(mode);
      trackAddToCart({
        productId: payload.productId,
        slug: payload.slug,
        name: payload.nameAr,
        price: payload.unitPrice,
        quantity: qty,
      });
    },
    [openDrawerAfterAdd],
  );

  const orderNow = useCallback(
    (payload: Omit<AddToCartPayload, "openDrawer">) => {
      addToCart({ ...payload, openDrawer: "checkout" });
    },
    [addToCart],
  );

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.lineId !== lineId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.lineId === lineId ? { ...i, quantity } : i)),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const openCart = useCallback(() => {
    setCheckoutOpen(false);
    setCartOpen(true);
  }, []);

  const closeCart = useCallback(() => setCartOpen(false), []);

  const openCheckout = useCallback(() => {
    setCartOpen(false);
    setCheckoutOpen(true);
  }, []);

  const closeCheckout = useCallback(() => setCheckoutOpen(false), []);

  const submitOrder = useCallback(
    (form: CheckoutFormData) => {
      const errors = validateCheckoutFormLocalized(form, locale);
      if (hasCheckoutErrors(errors)) return { success: false, errors };
      if (items.length === 0) return { success: false };

      const placedAt = new Date().toISOString();
      const metaIds = getMetaBrowserIds();

      const createPayload: CreateOrderInput & {
        meta?: { fbp?: string; fbc?: string; eventSourceUrl?: string };
      } = {
        customerName: form.fullName,
        phone: form.phone,
        address: form.address,
        products: items.map((i) => ({
          productId: i.productId,
          slug: i.slug,
          nameAr: i.nameAr,
          image: i.image,
          offerId: i.offerId,
          offerLabel: i.offerLabel,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          isBundle: i.isBundle,
        })),
        subtotal: shipping.subtotal,
        shippingPrice: shipping.shippingFee,
        total: shipping.total,
        ...(coupon ? { couponCode: coupon.code } : {}),
        meta: {
          ...(metaIds.fbp ? { fbp: metaIds.fbp } : {}),
          ...(metaIds.fbc ? { fbc: metaIds.fbc } : {}),
          eventSourceUrl:
            typeof window !== "undefined" ? window.location.href : undefined,
        },
      };

      // Optimistic local order for thank-you UX (does NOT fire Purchase yet).
      const optimisticId = `TZ-${placedAt.replace(/[-:TZ.]/g, "").slice(0, 14)}-LOCAL`;
      const lineItems = items.map((i) => ({
        nameAr: i.nameAr,
        offerLabel: i.offerLabel,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        slug: i.slug,
        productId: i.productId,
      }));
      const purchaseProducts = items.map((i) => ({
        productId: i.productId,
        slug: i.slug,
        name: i.nameAr,
        price: i.unitPrice,
        quantity: i.quantity,
      }));
      const optimistic: PlacedOrder = {
        id: optimisticId,
        placedAt,
        customer: form,
        items: lineItems.map(({ nameAr, offerLabel, quantity, unitPrice, slug }) => ({
          nameAr,
          offerLabel,
          quantity,
          unitPrice,
          slug,
        })),
        subtotal: shipping.subtotal,
        shippingFee: shipping.shippingFee,
        total: shipping.total,
        shippingLabelFr: shipping.labelFr,
        shippingLabelAr: shipping.labelAr,
      };

      sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(optimistic));

      // Persist order. Purchase Meta Pixel fires ONLY after the backend accepts the order.
      void fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
      })
        .then(async (res) => {
          if (!res.ok) return null;
          return (await res.json()) as CreateOrderResponse;
        })
        .then((data) => {
          if (!data?.order?.orderId) return;

          const realOrderId = data.order.orderId;
          const eventId =
            data.meta?.purchaseEventId ??
            `purchase_${realOrderId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40)}`;

          const updated: PlacedOrder = { ...optimistic, id: realOrderId };
          try {
            sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(updated));
          } catch {
            /* ignore */
          }

          // Browser Pixel Purchase — same event_id as server CAPI (dedupe at Meta).
          trackPurchase({
            orderId: realOrderId,
            products: purchaseProducts,
            subtotal: data.order.subtotal ?? shipping.subtotal,
            shipping: data.order.shippingPrice ?? shipping.shippingFee,
            total: data.order.total ?? shipping.total,
            eventId,
          });
        })
        .catch(() => null);

      clearCart();
      setCoupon(null);
      setCheckoutOpen(false);
      router.push("/thank-you");
      return { success: true };
    },
    [items, shipping, coupon, clearCart, router, locale],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      shipping,
      coupon,
      applyCoupon,
      removeCoupon,
      cartOpen,
      checkoutOpen,
      openCart,
      closeCart,
      openCheckout,
      closeCheckout,
      addToCart,
      orderNow,
      removeItem,
      updateQuantity,
      clearCart,
      crossSellProducts,
      submitOrder,
    }),
    [
      items,
      itemCount,
      subtotal,
      shipping,
      coupon,
      applyCoupon,
      removeCoupon,
      cartOpen,
      checkoutOpen,
      openCart,
      closeCart,
      openCheckout,
      closeCheckout,
      addToCart,
      orderNow,
      removeItem,
      updateQuantity,
      clearCart,
      crossSellProducts,
      submitOrder,
    ],
  );

  return (
    <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>
  );
}

export function useCommerce() {
  const ctx = useContext(CommerceContext);
  if (!ctx) {
    throw new Error("useCommerce must be used within CommerceProvider");
  }
  return ctx;
}

export function useCheckoutValidation() {
  const { locale } = useLanguage();
  return {
    validateCheckoutForm: (form: CheckoutFormData) =>
      validateCheckoutFormLocalized(form, locale),
    hasCheckoutErrors,
  };
}
