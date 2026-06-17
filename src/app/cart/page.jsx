"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { useCart } from "@/context/cart";
import { formatPrice } from "@/lib/products";

export default function CartPage() {
  const { items, resolve, setQty, remove, subtotal } = useCart();
  const shipping = subtotal > 2499 || subtotal === 0 ? 0 : 199;

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-24 md:px-8 md:pt-32">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="font-display text-5xl font-bold tracking-[-0.06em] md:text-7xl">Your bag</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red">{items.length} silhouettes reserved</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">FW26 Collective</span>
          </div>
        </div>
        <Link href="/shop" className="group hidden items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] md:flex">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center border border-white/5 bg-white/5">
          <div className="font-display text-3xl font-bold">Your bag is empty.</div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">Build your fit. Explore our heritage hoodies or embroidered tees.</p>
          <Link href="/shop" className="mt-10 bg-foreground px-12 py-5 text-[11px] font-bold uppercase tracking-[0.4em] text-background transition-transform hover:scale-105">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-8">
            <div className="space-y-12 border-t border-white/5 pt-12">
              {items.map((it, i) => {
                const p = resolve(it);
                if (!p) return null;
                return (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col gap-8 md:flex-row md:items-center"
                  >
                    <div className="relative aspect-[3/4] w-full md:w-40 shrink-0 overflow-hidden bg-surface">
                      <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 100vw, 160px" className="object-cover" />
                    </div>
                    
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red mb-2">{p.category}</div>
                          <h3 className="font-display text-2xl font-bold tracking-tight">{p.name}</h3>
                          <div className="mt-2 flex gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            <span>Size: {it.size}</span>
                            <span>Color: {it.color}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-xl font-bold">{formatPrice(p.price)}</div>
                        </div>
                      </div>

                      <div className="mt-8 flex items-center justify-between">
                        <div className="flex items-center border border-white/10">
                          <button onClick={() => setQty(i, it.qty - 1)} className="p-4 hover:bg-white/5"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-10 text-center font-display font-bold">{it.qty}</span>
                          <button onClick={() => setQty(i, it.qty + 1)} className="p-4 hover:bg-white/5"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <button 
                          onClick={() => remove(i)} 
                          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-accent-red transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <aside className="md:col-span-4">
            <div className="sticky top-32 bg-white/5 p-8 border border-white/5">
              <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red mb-8">Summary</div>
              
              <div className="space-y-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Shipping</span>
                  <span className="font-bold text-accent-red">{shipping === 0 ? "Complimentary" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Tax</span>
                  <span className="font-bold">Included</span>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-white/10">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Total Collective</span>
                  <span className="font-display text-4xl font-bold">{formatPrice(subtotal + shipping)}</span>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                <Link 
                  href="/checkout" 
                  className="group relative flex w-full h-16 items-center justify-center overflow-hidden bg-foreground text-[11px] font-bold uppercase tracking-[0.4em] text-background transition-all"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Secure Checkout
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-accent-red transition-transform duration-500 group-hover:translate-x-0" />
                </Link>
                <div className="text-center text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  Free returns within 7 days.
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
