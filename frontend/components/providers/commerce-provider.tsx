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
  validateCheckoutForm,
} from "@/lib/checkout/validation";
import { getProducts, getRelatedProducts } from "@/lib/products";
import {
  calculateShipping,
  loadShippingSettings,
  type ShippingResult,
} from "@/lib/shipping";

interface CommerceContextValue {
  items: CartLineItem[];
  itemCount: number;
  subtotal: number;
  shipping: ShippingResult;
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
  crossSellProducts: ReturnType<typeof getRelatedProducts>;
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
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [settingsVersion, setSettingsVersion] = useState(0);

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
    const settings = loadShippingSettings();
    return calculateShipping(items, subtotal, settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, subtotal, settingsVersion]);

  const cartSlugs = useMemo(() => [...new Set(items.map((i) => i.slug))], [items]);

  const crossSellProducts = useMemo(() => {
    const catalog = getProducts();
    const relatedSlugs = cartSlugs.flatMap((slug) => {
      const p = catalog.find((x) => x.slug === slug);
      return p?.relatedSlugs ?? [];
    });
    const unique = [...new Set(relatedSlugs)].filter(
      (slug) => !cartSlugs.includes(slug),
    );
    return getRelatedProducts(unique).slice(0, 4);
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
      setItems((prev) => applyAddToCart(prev, payload));
      openDrawerAfterAdd(mode);
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
      const errors = validateCheckoutForm(form);
      if (hasCheckoutErrors(errors)) return { success: false, errors };
      if (items.length === 0) return { success: false };

      const order: PlacedOrder = {
        id: `TZ-${Date.now().toString(36).toUpperCase()}`,
        placedAt: new Date().toISOString(),
        customer: form,
        items: items.map((i) => ({
          nameAr: i.nameAr,
          offerLabel: i.offerLabel,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        subtotal: shipping.subtotal,
        shippingFee: shipping.shippingFee,
        total: shipping.total,
        shippingLabelFr: shipping.labelFr,
      };

      sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(order));
      clearCart();
      setCheckoutOpen(false);
      router.push("/thank-you");
      return { success: true };
    },
    [items, shipping, clearCart, router],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      shipping,
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
  return { validateCheckoutForm, hasCheckoutErrors };
}
