"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart";
import { formatPrice } from "@/lib/products";

export function CartDrawer() {
  const { open, setOpen, items, resolve, setQty, remove, subtotal } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/5 bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 p-8">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red mb-1">Your bag</div>
                <div className="font-display text-2xl font-bold tracking-tight">{items.length} item{items.length !== 1 ? "s" : ""}</div>
              </div>
              <button onClick={() => setOpen(false)} className="group p-2 transition-colors hover:text-accent-red" aria-label="Close cart">
                <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                    <ShoppingBag className="h-12 w-12 text-white/10" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-accent-red/20" />
                  </div>
                  <div className="font-display text-2xl font-bold">Your bag is empty</div>
                  <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground uppercase tracking-widest">
                    Build a silhouette. Start with our heritage hoodies or embroidered tees.
                  </p>
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-10 border border-foreground px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
                  >
                    Start Exploring
                  </button>
                </div>
              ) : (
                <div className="space-y-10">
                  {items.map((it, i) => {
                    const p = resolve(it);
                    if (!p) return null;
                    return (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-6"
                      >
                        <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-background">
                          <Image src={p.image} alt={p.name} fill sizes="96px" className="object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col justify-between py-1">
                          <div>
                            <div className="flex items-start justify-between">
                              <h3 className="font-display text-lg font-bold tracking-tight leading-tight">{p.name}</h3>
                              <div className="text-sm font-bold">{formatPrice(p.price)}</div>
                            </div>
                            <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                              {it.size} · {it.color}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-white/10">
                              <button
                                onClick={() => setQty(i, it.qty - 1)}
                                className="p-2.5 hover:bg-white/5"
                                aria-label="Decrease"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold">{it.qty}</span>
                              <button
                                onClick={() => setQty(i, it.qty + 1)}
                                className="p-2.5 hover:bg-white/5"
                                aria-label="Increase"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => remove(i)}
                              className="text-muted-foreground hover:text-accent-red transition-colors"
                              aria-label="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-white/5 bg-background/50 p-8 backdrop-blur-xl">
                <div className="mb-6 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="uppercase tracking-[0.2em] text-muted-foreground">Subtotal</span>
                    <span className="font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="uppercase tracking-[0.2em] text-muted-foreground">Shipping</span>
                    <span className="text-accent-red font-bold">Complimentary</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="group relative flex w-full h-16 items-center justify-center overflow-hidden bg-foreground text-[11px] font-bold uppercase tracking-[0.4em] text-background transition-all"
                  >
                    <span className="relative z-10">Secure Checkout · {formatPrice(subtotal)}</span>
                    <div className="absolute inset-0 -translate-x-full bg-accent-red transition-transform duration-500 group-hover:translate-x-0" />
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setOpen(false)}
                    className="flex h-14 w-full items-center justify-center border border-white/10 text-[10px] font-bold uppercase tracking-[0.3em] transition-colors hover:bg-white/5"
                  >
                    View Silhouette
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
