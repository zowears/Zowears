"use client";

import * as React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Truck, Shield, RefreshCw, Minus, Plus, ChevronDown, ChevronLeft, ChevronRight, Share2, Info, ShoppingBag, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProduct, fetchProducts, formatPrice } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/cart";

export default function ProductClient() {
  const params = useParams();
  const slugArray = params.slug || [];
  const idOrSlug = slugArray[slugArray.length - 1];

  const { data: p, isLoading } = useQuery({
    queryKey: ["product", idOrSlug],
    queryFn: () => fetchProduct(idOrSlug),
    enabled: !!idOrSlug,
  });

  const { data: allProducts } = useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const [size, setSize] = React.useState("");
  const [color, setColor] = React.useState("");
  const [fit, setFit] = React.useState("");
  const [qty, setQty] = React.useState(1);
  const [img, setImg] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState(0);
  const [mousePos, setMousePos] = React.useState({ x: "50%", y: "50%" });
  const { add } = useCart();

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x: `${x}%`, y: `${y}%` });
  };

  const viewTracked = React.useRef(false);

  React.useEffect(() => {
    if (p && !viewTracked.current) {
      viewTracked.current = true;
      fetch(`http://localhost:5000/api/analytics/product/${p.id}`, {
        method: "POST"
      }).catch(console.error);

      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "ViewContent", {
          content_name: p.name,
          content_ids: [p.id],
          content_type: 'product',
          value: p.price,
          currency: 'PKR'
        });
      }
    }
  }, [p]);

  const availableFits = (p?.fits?.length > 0)
    ? p.fits
    : (p?.categories?.some(c => ["T-Shirts", "Hoodies", "Zipper Hoodies", "Sweatshirts", "Plain Tee & Hoodies"].includes(c))
      ? ["Regular Fit", "Drop Shoulder", "Oversized"]
      : []);

  React.useEffect(() => {
    if (availableFits.length > 0 && (!fit || !availableFits.includes(fit))) {
      setFit(availableFits[0]);
    }
  }, [p, availableFits, fit]);

  const checkExtraPrice = (f) => {
    if (!f) return false;
    const lower = f.toLowerCase();
    return lower.includes("drop") || lower.includes("shoulder") || lower.includes("oversized") || lower.includes("oversize") || !lower.includes("regular");
  };

  const isExtraPriceFit = checkExtraPrice(fit);
  const effectivePrice = p ? (isExtraPriceFit ? p.price + 200 : p.price) : 0;
  const effectiveCompareAt = p?.compareAt ? (isExtraPriceFit ? p.compareAt + 200 : p.compareAt) : null;

  React.useEffect(() => {
    if (p) {
      const defaultColor = p.colors[0]?.name || "Onyx";
      setColor(defaultColor);

      const colorObj = p.colors?.find(c => c.name === defaultColor);
      const sizesForColor = (colorObj?.sizes?.length > 0) ? colorObj.sizes : p.sizes;

      setSize(sizesForColor?.[1] ?? sizesForColor?.[0]);
    }
  }, [p]);

  const selectedColorObj = p?.colors?.find(c => c.name === color);
  const availableSizes = selectedColorObj?.sizes?.length > 0 ? selectedColorObj.sizes : (p?.sizes || []);

  React.useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(size)) {
      setSize(availableSizes[0]);
    }
  }, [color, availableSizes, size]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-accent-red" />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-5xl font-bold">404</h1>
        <p className="mt-4 text-muted-foreground uppercase tracking-[0.4em] text-[10px]">Silhouette not found</p>
        <Link href="/shop" className="mt-12 inline-block border border-foreground px-12 py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-foreground hover:text-background transition-colors">
          Return to Collective
        </Link>
      </div>
    );
  }

  const rawGallery = [
    ...(p.images?.map(image => typeof image === "string" ? image : image.url) || []),
    p.image,
  ].filter((src) => typeof src === "string" && src.trim() !== "");
  const gallery = Array.from(new Set(rawGallery));
  const related = (allProducts || []).filter((x) => x.id !== p.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-24 pt-24 md:px-8 md:pt-32">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground flex-wrap">
          {p.categories?.includes("Special for Girls") ? (
            <>
              <Link href="/shop?c=Special for Girls" className="hover:text-accent-red">Girls Wear</Link>
              <span className="text-white/10">/</span>
              <Link href="/shop?c=Special for Girls" className="hover:text-accent-red">Special for Girls</Link>
            </>
          ) : (
            <Link href="/shop" className="hover:text-accent-red">Shop All</Link>
          )}
          {p.categories?.filter(c => c !== "Special for Girls").map(cat => (
            <React.Fragment key={cat}>
              <span className="text-white/10">/</span>
              <Link href={`/shop?c=${encodeURIComponent(cat)}`} className="hover:text-accent-red">{cat}</Link>
            </React.Fragment>
          ))}
          {fit && (
            <>
              <span className="text-white/10">/</span>
              <span className="text-foreground">{fit}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-16 md:grid-cols-12">
        {/* Left: Gallery */}
        <div className="md:col-span-7">
          <div className="grid grid-cols-12 gap-4">
            <div className="hidden md:block md:order-1 md:col-span-2">
              <div className="flex gap-3 md:flex-col">
                {gallery.map((src, i) => (
                  src ? (
                    <button
                      key={i}
                      onClick={() => setImg(i)}
                      className={`relative aspect-[3/4] flex-1 overflow-hidden bg-surface transition-all md:flex-none ${i === img ? "ring-1 ring-accent-red" : "opacity-60 hover:opacity-100"}`}
                    >
                      <div className="relative h-full w-full">
                        <Image src={src} alt={`${p.name} - Thumbnail view`} fill sizes="100px" className="object-cover" />
                      </div>
                    </button>
                  ) : null
                ))}
              </div>
            </div>
            <div className="order-1 col-span-12 md:order-2 md:col-span-10 relative">
              <motion.div
                key={img}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="group relative aspect-[3/4] overflow-hidden bg-surface cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setMousePos({ x: "50%", y: "50%" })}
              >
                <Image
                  src={gallery[img]}
                  alt={`${p.name} - Premium Embroidered ${p.categories?.[0] || 'Streetwear'} in Pakistan`}
                  fill
                  priority
                  quality={100}
                  unoptimized={true}
                  className="object-cover transition-transform duration-150 ease-out group-hover:scale-250"
                  style={{ transformOrigin: `${mousePos.x} ${mousePos.y}` }}
                />
              </motion.div>
              
              {gallery.length > 1 && (
                <>
                  <button 
                    className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition-all hover:bg-black/60"
                    onClick={() => setImg((prev) => (prev - 1 + gallery.length) % gallery.length)}
                    aria-label="Previous Image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button 
                    className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition-all hover:bg-black/60"
                    onClick={() => setImg((prev) => (prev + 1) % gallery.length)}
                    aria-label="Next Image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {gallery.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all ${i === img ? "bg-white w-4" : "bg-white/50 w-1.5"}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="md:col-span-5">
          <div className="sticky top-32">
            <div className="flex items-center justify-between">
              {p.badge && (
                <span className="bg-accent-red px-3 py-1 text-[9px] font-bold uppercase tracking-[0.3em] text-white">
                  {p.badge}
                </span>
              )}

            </div>

            <h1 className="mt-6 font-display text-5xl font-bold tracking-[-0.06em] md:text-7xl">
              {p.name}
            </h1>

            <div className="mt-4 flex items-center justify-between border-b border-white/5 pb-8">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-4xl font-bold tracking-tight">{formatPrice(effectivePrice)}</span>
                {effectiveCompareAt && (
                  <span className="text-xl text-muted-foreground line-through opacity-40">{formatPrice(effectiveCompareAt)}</span>
                )}
              </div>
            </div>

            <p className="mt-8 text-sm leading-relaxed text-muted-foreground md:text-lg">
              {p.description}
            </p>

            {/* Selectors */}
            <div className="mt-12 space-y-10">
              {availableFits.length > 0 && (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red">Style / Fit</span>
                    <span className="text-[10px] font-bold text-muted-foreground">{fit} {isExtraPriceFit ? "(+Rs. 200)" : ""}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableFits.map((f) => {
                      const hasExtraPrice = checkExtraPrice(f);
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFit(f)}
                          className={`flex h-14 px-6 items-center justify-center border text-[11px] font-bold transition-all ${
                            fit === f 
                              ? "border-accent-red bg-accent-red text-white" 
                              : "border-white/5 text-zinc-300 hover:border-white/20"
                          }`}
                        >
                          {f} {hasExtraPrice ? " (+Rs. 200)" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red">Select Silhouette</span>
                  <span className="text-[10px] font-bold text-muted-foreground">{size}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`flex h-14 min-w-[3.5rem] items-center justify-center border text-[11px] font-bold transition-all ${size === s ? "border-accent-red bg-accent-red text-white" : "border-white/5 hover:border-white/20"
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red">Choose Palette</span>
                  <span className="text-[10px] font-bold text-muted-foreground">{color}</span>
                </div>
                <div className="flex gap-4">
                  {p.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setColor(c.name)}
                      className={`group relative h-12 w-12 rounded-full border border-white/10 p-1.5 transition-transform hover:scale-110 ${color === c.name ? "ring-1 ring-accent-red" : ""}`}
                      style={{ background: c.hexCode }}
                      aria-label={c.name}
                    >
                      <div className={`absolute inset-0 rounded-full border-2 border-white/0 transition-all ${color === c.name ? "border-white/40" : "group-hover:border-white/20"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-12 flex items-center gap-4">
              <div className="flex items-center border border-white/10 h-16">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-5 hover:bg-white/5" aria-label="Decrease">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-display text-xl font-bold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="p-5 hover:bg-white/5" aria-label="Increase">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                className="group relative h-16 flex-1 overflow-hidden bg-foreground text-[11px] font-bold uppercase tracking-[0.4em] text-background transition-all"
                onClick={() => add({
                  productId: p.id,
                  size,
                  color,
                  fit,
                  qty,
                  name: p.name,
                  price: effectivePrice,
                  image: p.images?.[0]?.url || p.images?.[0] || p.image,
                  categories: p.categories
                })}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <ShoppingBag className="h-4 w-4" />
                  Add to cart
                </span>
                <div className="absolute inset-0 -translate-x-full bg-accent-red transition-transform duration-500 group-hover:translate-x-0" />
              </button>
              <button className="flex h-16 w-16 items-center justify-center border border-white/10 hover:border-accent-red hover:text-accent-red transition-colors" aria-label="Add to wishlist">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-y border-white/5 py-8 text-center">
              <InfoItem icon={<Truck className="h-4 w-4" />} title="Fast Delivery" subtitle="3–5 Days" />
              <InfoItem icon={<Shield className="h-4 w-4" />} title="Genuine" subtitle="Artisan Craft" />
            </div>

            {/* Fabric Info */}
            <div className="mt-10 flex items-center gap-4 bg-white/5 p-4">
              <Info className="h-4 w-4 text-accent-red" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Fabrication · {p.fabric}</span>
            </div>

            {/* Accordions */}
            <div className="mt-12 divide-y divide-white/5 border-b border-white/5">
              {[
                { q: "Care Instructions", a: "Cold wash, inside out. Do not tumble dry the embroidered pieces. Iron low if needed." },
                { q: "Collective Promise", a: "Every piece is a numbered part of the Zowears Collective. We ensure ethical manufacturing and artisanal finishing." },
                { q: "Silhouette Details", a: "True oversized drop. Order your usual size for an oversized look, size down for relaxed. Our fabrics are custom-knit for a substantial feel and structural drape." },
              ].map((f, i) => (
                <div key={i}>
                  <button
                    onClick={() => setActiveTab(activeTab === i ? null : i)}
                    className="flex w-full items-center justify-between py-6 text-left"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{f.q}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${activeTab === i ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {activeTab === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-8 text-sm leading-relaxed text-muted-foreground">{f.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      <div className="mt-32">
        <div className="mb-12 flex items-center justify-between">
          <h2 className="font-display text-4xl font-bold tracking-tight">Complete the fit</h2>
          <Link href="/shop" className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-red underline underline-offset-8">View all pieces</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-4 md:gap-x-8">
          {related.map((r, i) => <ProductCard key={r.id} product={r} index={i} />)}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-accent-red">{icon}</div>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em]">{title}</div>
      <div className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60">{subtitle}</div>
    </div>
  );
}
