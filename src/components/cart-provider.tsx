"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantName: string;
  sku: string;
  imageUrl: string;
  price: number;
  quantity: number;
  inventory: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartContextValue>({
  items: [],
  addItem: () => undefined,
  removeItem: () => undefined,
  setQuantity: () => undefined,
  clear: () => undefined,
  count: 0,
});
const CART_KEY = "missy-miss-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]") as CartItem[];
      setItems(saved);
    } catch {
      localStorage.removeItem(CART_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(item: CartItem) {
    setItems((current) => {
      const existing = current.find((entry) => entry.variantId === item.variantId);
      if (!existing) return [...current, item];
      return current.map((entry) =>
        entry.variantId === item.variantId
          ? { ...entry, quantity: Math.min(entry.quantity + item.quantity, item.inventory) }
          : entry,
      );
    });
  }

  function setQuantity(variantId: string, quantity: number) {
    setItems((current) =>
      current
        .map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: Math.max(0, Math.min(quantity, item.inventory)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem: (variantId) =>
          setItems((current) => current.filter((item) => item.variantId !== variantId)),
        setQuantity,
        clear: () => setItems([]),
        count: items.reduce((sum, item) => sum + item.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
