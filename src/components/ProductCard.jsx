"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Star, Heart } from "lucide-react";
import { useCart } from "@/context/cart";
import { formatPrice } from "@/lib/products";

export function ProductCard({ product, index }) {
  const { add } = useCart();

  const productUrl = `/product${product.mainCategory ? `/${product.mainCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : ''}${product.subCategory ? `/${product.subCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : ''}/${product.slug || product.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-surface">
        <Link href={productUrl} className="relative block h-full w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
            className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
          />
        </Link>

        {/* Badges */}
        {product.badge && (
          <div className="absolute left-4 top-4 z-10">
            <span className="bg-accent-red px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white">
              {product.badge}
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-12 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={() => add({ 
                productId: product.id, 
                size: "M", 
                color: product.colors[0]?.name || "Onyx", 
                qty: 1,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.mainCategory
              })}
              className="flex-1 flex items-center justify-center gap-3 bg-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-accent-red hover:text-white transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Quick Add
            </button>
            <button className="flex aspect-square items-center justify-center bg-white/20 backdrop-blur-md px-4 text-white hover:bg-accent-red transition-colors">
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 pointer-events-none bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

      <div className="mt-6 space-y-2 px-1">
        <div className="flex items-start justify-between gap-4">
          <Link href={productUrl}>
            <h3 className="font-display text-lg font-bold tracking-tight text-foreground/90 transition-colors hover:text-accent-red">
              {product.name}
            </h3>
          </Link>
          <div className="text-right">
            <div className="text-lg font-bold tracking-tighter">{formatPrice(product.price)}</div>
            {product.compareAt && (
              <div className="text-[10px] text-muted-foreground line-through opacity-60">
                {formatPrice(product.compareAt)}
              </div>
            )}
          </div>
        </div>
        
        {/* <div className="flex items-center justify-between">
          <div className="font-serif-jp text-xs text-muted-foreground/60">{product.jp}</div>
          <div className="flex items-center gap-1.5">
            <Star className="h-3 w-3 fill-accent-red text-accent-red" />
            <span className="text-[10px] font-bold text-foreground/80">{product.rating}</span>
          </div>
        </div> */}

        {/* <div className="pt-2 flex gap-1.5">
          {product.colors.map((c) => (
            <div
              key={c.name}
              className="h-3 w-3 rounded-full border border-white/10"
              style={{ background: c.hexCode }}
              title={c.name}
            />
          ))}
        </div> */}
      </div>
    </motion.div>
  );
}
