"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { ProductItem } from "@/components/catalog/ProductCard";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { calculateOrderPricing } from "@/lib/pricing";

export interface CartItem {
  id: string;
  product: ProductItem;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  platformPackagingFee: number;
  totalAmount: number;
  addItem: (product: ProductItem, quantity?: number) => void;
  updateQuantity: (productOrId: ProductItem | string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  itemCount: 0,
  subtotal: 0,
  deliveryFee: 0,
  platformPackagingFee: 0,
  totalAmount: 0,
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  getQuantity: () => 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { activeUser } = useAuth();
  const { showToast } = useToast();

  const userKey = activeUser?.id ? `rushd_cart_${activeUser.id}` : "rushd_cart_guest";

  // 1. Hydrate cart from localStorage on mount or when activeUser changes
  useEffect(() => {
    try {
      const userSaved = localStorage.getItem(userKey);
      const fallbackSaved = localStorage.getItem("rushd_cart") || localStorage.getItem("x_grocery_cart");

      let parsedItems: CartItem[] = [];

      if (userSaved) {
        const parsed = JSON.parse(userSaved);
        if (Array.isArray(parsed)) parsedItems = parsed;
      } else if (fallbackSaved && !activeUser?.id) {
        const parsed = JSON.parse(fallbackSaved);
        if (Array.isArray(parsed)) parsedItems = parsed;
      } else if (fallbackSaved && activeUser?.id) {
        // Adopt guest cart items for newly logged in user if user cart is empty
        const parsed = JSON.parse(fallbackSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsedItems = parsed;
          localStorage.setItem(userKey, JSON.stringify(parsed));
        }
      }

      setItems(parsedItems);
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    } finally {
      setIsHydrated(true);
    }
  }, [userKey, activeUser?.id]);

  // 2. Persist cart changes ONLY AFTER initial hydration completes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const dataString = JSON.stringify(items);
      localStorage.setItem(userKey, dataString);
      localStorage.setItem("rushd_cart", dataString);
      localStorage.setItem("x_grocery_cart", dataString);
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items, isHydrated, userKey]);

  // Derived state calculations via single source of truth
  const itemCount = items.reduce(
    (sum, i) => sum + (Number.isFinite(i.quantity) && i.quantity > 0 ? i.quantity : 0),
    0
  );
  const subtotal = items.reduce(
    (sum, i) => sum + (i.product?.price || 0) * (i.quantity || 0),
    0
  );

  const pricing = calculateOrderPricing(subtotal, itemCount);
  const deliveryFee = pricing.deliveryFee;
  const platformPackagingFee = pricing.platformPackagingFee;
  const totalAmount = pricing.totalAmount;

  const addItem = (product: ProductItem, requestedQty = 1) => {
    if (!product || !product.id) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      const targetQty = currentQty + requestedQty;

      if (targetQty > product.stock) {
        showToast(
          `Maximum stock reached for ${product.name} (${product.stock} available)`,
          "warning"
        );
        const cappedQty = product.stock;
        if (cappedQty <= 0) return prev.filter((i) => i.product.id !== product.id);

        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id ? { ...i, quantity: cappedQty } : i
          );
        } else {
          return [...prev, { id: product.id, product, quantity: cappedQty }];
        }
      }

      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: targetQty } : i
        );
      } else {
        return [...prev, { id: product.id, product, quantity: targetQty }];
      }
    });
  };

  const updateQuantity = (productOrId: ProductItem | string, newQty: number) => {
    const productId = typeof productOrId === "string" ? productOrId : productOrId?.id;
    if (!productId) return;

    if (newQty <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === productId);

      if (!existing) {
        if (typeof productOrId === "object") {
          return [...prev, { id: productOrId.id, product: productOrId, quantity: newQty }];
        }
        return prev;
      }

      if (newQty > existing.product.stock) {
        showToast(
          `Maximum available stock reached for ${existing.product.name} (${existing.product.stock} items)`,
          "warning"
        );
        return prev.map((i) =>
          i.product.id === productId ? { ...i, quantity: existing.product.stock } : i
        );
      }

      return prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: newQty } : i
      );
    });
  };

  const removeItem = (productId: string) => {
    if (!productId) return;
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getQuantity = (productId: string) => {
    if (!productId) return 0;
    const item = items.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee,
        platformPackagingFee,
        totalAmount,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
