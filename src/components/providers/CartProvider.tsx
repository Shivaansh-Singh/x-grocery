"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { ProductItem } from "@/components/catalog/ProductCard";
import { useToast } from "@/components/ui/Toast";

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
  totalAmount: 0,
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  getQuantity: () => 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("x_grocery_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { showToast } = useToast();

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("x_grocery_cart", JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items]);

  // Derived state
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  // Delivery fee rules: FREE for subtotal >= 199 or 0 items; else flat ₹15
  const deliveryFee = itemCount === 0 || subtotal >= 199 ? 0 : 15;
  const totalAmount = subtotal + deliveryFee;

  const addItem = (product: ProductItem, requestedQty = 1) => {
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
    const productId = typeof productOrId === "string" ? productOrId : productOrId.id;

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
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getQuantity = (productId: string) => {
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
