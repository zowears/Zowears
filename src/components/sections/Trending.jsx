"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Loader2 } from "lucide-react";

export function Trending() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["trending-products"],
    queryFn: fetchProducts,
  });

  const trending = products?.filter(p => p.isFeatured).slice(0, 4) || [];

  return (
    <section className="bg-background py-24 ">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8">
        <div className="mb-16 flex flex-col items-start justify-between gap-8 md:mb-24 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="mt-6 font-display text-5xl font-bold tracking-[-0.06em] md:text-8xl">
              Most worn <br />
              <span className="text-gradient">this season</span>
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-start gap-6 md:items-end"
          >
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground md:text-right md:text-lg">
              Heavyweight silhouettes, artisanal embroidery, and the restrained palettes of Karachi.
            </p>
            <Link
              href="/shop"
              className="group flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-accent-red"
            >
              Shop Collection
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-3/4 animate-pulse bg-white/5 rounded-xl" />
            ))
          ) : trending.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground uppercase tracking-widest text-sm">
              New collection arriving soon
            </div>
          ) : (
            trending.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))
          )}
        </div>

        <div className="mt-32 flex flex-col items-center justify-center border-t border-white/5 pt-24 text-center">
          <div className="font-serif-jp text-4xl text-white/5 mb-8">全ての作品</div>
          <Link
            href="/shop"
            className="group relative h-20 w-full md:w-96 flex items-center justify-center overflow-hidden border border-white/10 text-[11px] font-bold uppercase tracking-[0.5em] transition-all hover:border-accent-red"
          >
            <span className="relative z-10 transition-colors group-hover:text-white">Explore Full Collective</span>
            <div className="absolute inset-0 translate-y-full bg-accent-red transition-transform duration-500 group-hover:translate-y-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
