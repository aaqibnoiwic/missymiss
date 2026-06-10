"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  lineId: string;
  variantId?: string;
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
  removeItem: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
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
      const saved = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]") as Array<CartItem & { variantId?: string }>;
      setItems(saved.map((item) => ({ ...item, lineId: item.lineId || item.variantId || `product:${item.productId}` })));
    } catch {
      localStorage.removeItem(CART_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(item: CartItem) {
    setItems((current) => {
      const existing = current.find((entry) => entry.lineId === item.lineId);
      if (!existing) return [...current, item];
      return current.map((entry) =>
        entry.lineId === item.lineId
          ? { ...entry, quantity: Math.min(entry.quantity + item.quantity, item.inventory) }
          : entry,
      );
    });
  }

  function setQuantity(lineId: string, quantity: number) {
    setItems((current) =>
      current
        .map((item) =>
          item.lineId === lineId
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
        removeItem: (lineId) =>
          setItems((current) => current.filter((item) => item.lineId !== lineId)),
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
