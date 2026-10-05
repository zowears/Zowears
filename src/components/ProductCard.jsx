"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Tag, Eye } from "lucide-react";
import { useCart } from "@/context/cart";
import { formatPrice } from "@/lib/products";

export function ProductCard({ product, index }) {
  const { add } = useCart();

  const discount = product.discountPercentage || 20;
  // product.price IS the actual selling price — do NOT discount it further
  const salePrice = product.price;
  // The struck-through "was" price: use compareAt from DB, or back-calculate MRP
  const mrp = product.compareAt || Math.round(salePrice / (1 - discount / 100));

  // Get second image for hover if available
  const primaryImage = product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url || product.image;
  const hoverImage = product.images?.find((i) => !i.isPrimary)?.url || product.images?.[1]?.url || null;

  const isKids = Boolean(product.isKidsWear || product.productType === "kids" || product.categories?.includes("Kids Wear"));
  const productUrl = isKids
    ? `/product/kids-wear/${product.slug || product.id}`
    : `/product${product.mainCategory ? `/${product.mainCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : ''}${product.subCategory ? `/${product.subCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : ''}/${product.slug || product.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface shadow-sm group-hover:shadow-lg transition-shadow duration-500">
        <Link href={productUrl} className="relative block h-full w-full">
          {/* Primary Image */}
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={`object-cover transition-all duration-700 ${hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-110'}`}
          />
          {/* Hover Image (2nd image) */}
          {hoverImage && (
            <Image
              src={hoverImage}
              alt={`${product.name} alternate`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
            />
          )}
        </Link>

        {/* Badges — only ONE SALE badge, suppress if product.badge already says SALE */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {product.badge && product.badge.toLowerCase() !== 'sale' && (
            <span className="bg-accent-red px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white rounded-sm shadow">
              {product.badge}
            </span>
          )}
          <span className="bg-[#C8A96E] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white rounded-sm shadow">
            {discount}% OFF
          </span>
        </div>

        {/* Views badge top right */}
        {/* {product.views > 0 && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-full">
            <Eye className="h-2.5 w-2.5" />
            {product.views > 999 ? `${(product.views / 1000).toFixed(1)}k` : product.views}
          </div>
        )} */}

        {/* Quick Actions — slide up on hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100 z-20">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => add({
                productId: product.id,
                size: product.sizes?.[0] || (isKids ? "2/3" : "M"),
                color: isKids ? "" : (product.colors?.[0]?.name || "Onyx"),
                fit: "",
                qty: 1,
                name: product.name,
                price: salePrice,
                image: primaryImage,
                category: isKids ? "Kids Wear" : (product.mainCategory || "Apparel"),
                categories: isKids ? ["Kids Wear"] : product.categories
              })}
              className="flex-1 flex items-center justify-center gap-2 bg-white py-3 text-[9px] font-bold uppercase tracking-[0.15em] text-black hover:bg-accent-red hover:text-white transition-colors rounded-sm shadow-md"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Quick Add
            </button>
            <button className="flex w-11 items-center justify-center bg-white/90 backdrop-blur-sm text-foreground hover:bg-accent-red hover:text-white transition-colors rounded-sm shadow-md">
              <Heart className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Subtle dark overlay on hover */}
        <div className="absolute inset-0 pointer-events-none bg-black/0 group-hover:bg-black/15 transition-colors duration-500 rounded-xl" />
      </div>

      {/* Info below image */}
      <div className="mt-4 px-0.5 space-y-2">
        {/* Product Name */}
        <Link href={productUrl}>
          <h3 className="font-display text-sm md:text-base font-bold tracking-tight text-foreground/90 transition-colors hover:text-accent-red leading-snug line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Price Block — sale price prominent, MRP struck-through */}
        <div className="flex items-baseline gap-2">
          <span className="text-base md:text-lg font-bold tracking-tight text-foreground">
            {formatPrice(salePrice)}
          </span>
          <span className="text-xs text-muted-foreground line-through opacity-60">
            {formatPrice(mrp)}
          </span>
          <span className="text-[9px] font-bold text-[#C8A96E] bg-[#C8A96E]/10 px-1.5 py-0.5 rounded">
            {discount}% OFF
          </span>
        </div>

        {/* Colors preview */}
        {product.colors?.length > 0 && (
          <div className="flex items-center gap-1.5 pt-0.5">
            {product.colors.slice(0, 5).map((c) => (
              <div
                key={c.name}
                className="h-3 w-3 rounded-full border border-black/10 shadow-sm"
                style={{ background: c.hexCode || '#888' }}
                title={c.name}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[9px] text-muted-foreground">+{product.colors.length - 5}</span>
            )}
          </div>
        )}

        {/* Subcat / stock urgency */}
        {product.stock !== undefined && product.stock <= 10 && product.stock > 0 && (
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-red-500">
            Only {product.stock} left
          </p>
        )}
      </div>
    </motion.div>
  );
}
