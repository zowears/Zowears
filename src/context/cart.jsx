"use client";

import * as React from "react";
import { products } from "@/lib/products";

const Ctx = React.createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = React.useState([]);
  const [open, setOpen] = React.useState(false);

  const add = React.useCallback((item) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === item.productId && i.size === item.size && i.color === item.color,
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
        return next;
      }
      return [...prev, item];
    });
    setOpen(true);
  }, []);

  const remove = React.useCallback((idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const setQty = React.useCallback((idx, qty) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, qty: Math.max(1, qty) } : it)));
  }, []);

  const resolve = React.useCallback(
    (i) => products.find((p) => p.id === i.productId) || i,
    [],
  );

  const count = items.reduce((a, b) => a + b.qty, 0);
  const subtotal = items.reduce((a, b) => {
    const p = resolve(b);
    return a + (p && p.price ? p.price * b.qty : 0);
  }, 0);

  return (
    <Ctx.Provider
      value={{ items, add, remove, setQty, clear: () => setItems([]), open, setOpen, count, subtotal, resolve }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = React.useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
