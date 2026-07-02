"use client";

import * as React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Palette,
  Ruler,
  Scissors,
  Sparkles,
  Download,
  ExternalLink,
  ChevronDown,
  Share2,
  ShoppingBag,
  Loader2,
  FileText,
  Cpu,
  Info,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchDesign, fetchDesigns, formatDesignPrice } from "@/lib/designs";
import { DesignCard } from "@/components/DesignCard";
import { useCart } from "@/context/cart";

export default function DesignDetailPage() {
  const params = useParams();
  const { data: design, isLoading } = useQuery({
    queryKey: ["design", params.id],
    queryFn: () => fetchDesign(params.id),
    enabled: !!params.id,
  });

  const { data: allDesigns } = useQuery({
    queryKey: ["designs"],
    queryFn: fetchDesigns,
  });

  const [activeImage, setActiveImage] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState(null);
  const { add } = useCart();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-accent-red" />
      </div>
    );
  }

  if (!design) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-5xl font-bold">404</h1>
        <p className="mt-4 text-muted-foreground uppercase tracking-[0.4em] text-[10px]">
          Design not found
        </p>
        <Link
          href="/designs"
          className="mt-12 inline-block border border-foreground px-12 py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-foreground hover:text-background transition-colors"
        >
          Back to Designs
        </Link>
      </div>
    );
  }

  const images = [design.image1, design.image2].filter(Boolean);
  const related = (allDesigns || []).filter((d) => d.id !== design.id).slice(0, 4);

  const allFormats = ["DST", "PES", "JEF", "XXX", "VP3", "HUS", "EXP"];
  const includedFormats = design.formats || allFormats;

  const handleAddToCart = () => {
    add({
      productId: design.id,
      size: "Digital",
      color: "N/A",
      qty: 1,
      name: design.name,
      price: design.price || 1,
      image: design.image1,
      category: "Embroidery Design",
    });
  };

  const specs = [
    { icon: <Layers className="h-4 w-4" />, label: "Stitch Count", value: design.stitchCount?.toLocaleString() || "—" },
    { icon: <Palette className="h-4 w-4" />, label: "Total Colors", value: design.totalColors || "—" },
    { icon: <Ruler className="h-4 w-4" />, label: "Size", value: design.size || "—" },
    { icon: <Scissors className="h-4 w-4" />, label: "Design Type", value: design.designType || "Flat" },
    { icon: <Cpu className="h-4 w-4" />, label: "Thread Type", value: design.threadType || "Polyester" },
    { icon: <FileText className="h-4 w-4" />, label: "Fabric Type", value: design.fabricType || "All Fabrics" },
  ];

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-24 pt-24 md:px-8 md:pt-32">
      {/* Breadcrumb */}
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
          <Link href="/designs" className="hover:text-accent-red flex items-center gap-2">
            <ArrowLeft className="h-3 w-3" />
            Designs
          </Link>
          <span className="text-white/10">/</span>
          <span className="text-foreground">{design.name}</span>
        </div>
        <button className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground hover:text-foreground">
          <Share2 className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
          Share
        </button>
      </div>

      <div className="grid gap-16 md:grid-cols-12">
        {/* Left: Image Gallery */}
        <div className="md:col-span-7">
          <div className="grid grid-cols-12 gap-4">
            {/* Thumbnails */}
            <div className="order-2 col-span-12 md:order-1 md:col-span-2">
              <div className="flex gap-3 md:flex-col">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative aspect-square flex-1 overflow-hidden bg-surface transition-all md:flex-none ${
                      i === activeImage
                        ? "ring-1 ring-accent-red"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="relative h-full w-full">
                      <Image src={src} alt="" fill sizes="100px" className="object-cover" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Image */}
            <div className="order-1 col-span-12 md:order-2 md:col-span-10">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="group relative aspect-square overflow-hidden bg-surface"
              >
                <Image
                  src={images[activeImage]}
                  alt={design.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                {/* Price overlay */}
                <div className="absolute top-5 right-5">
                  <span className="bg-accent-red px-4 py-2 text-sm font-bold tracking-[0.1em] text-white shadow-[0_0_30px_rgba(200,169,110,0.4)]">
                    {formatDesignPrice(design.price)}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="md:col-span-5">
          <div className="sticky top-32">
            {/* Category & type */}
            <div className="flex items-center gap-3">
              <span className="bg-accent-red/10 border border-accent-red/30 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.3em] text-accent-red">
                {design.category || "General"}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                {design.designType}
              </span>
            </div>

            <h1 className="mt-6 font-display text-4xl font-bold tracking-[-0.06em] md:text-6xl">
              {design.name}
            </h1>

            <div className="mt-4 flex items-center justify-between border-b border-white/5 pb-8">
              <span className="font-display text-4xl font-bold tracking-tight text-gradient">
                {formatDesignPrice(design.price)}
              </span>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
                <Sparkles className="h-3.5 w-3.5 text-accent-red" />
                Instant Download
              </div>
            </div>

            {design.description && (
              <p className="mt-8 text-sm leading-relaxed text-muted-foreground md:text-base">
                {design.description}
              </p>
            )}

            {/* Design Specifications */}
            <div className="mt-10">
              <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red mb-6">
                Design Specifications
              </div>
              <div className="grid grid-cols-2 gap-3">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center gap-3 bg-surface border border-white/5 p-4 hover:border-white/10 transition-colors"
                  >
                    <div className="text-accent-red">{spec.icon}</div>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                        {spec.label}
                      </div>
                      <div className="text-sm font-bold text-foreground mt-0.5">
                        {spec.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Included Formats */}
            <div className="mt-10">
              <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red mb-4">
                Included Formats
              </div>
              <div className="flex flex-wrap gap-2">
                {includedFormats.map((fmt) => (
                  <span
                    key={fmt}
                    className="flex items-center gap-1.5 border border-accent-red/30 bg-accent-red/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-red"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    .{fmt}
                  </span>
                ))}
                <span className="flex items-center gap-1.5 border border-white/10 bg-white/3 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 line-through">
                  <XCircle className="h-3 w-3" />
                  .EMB
                </span>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="mt-10 flex items-center gap-4">
              <button
                className="group relative h-16 flex-1 overflow-hidden bg-foreground text-[11px] font-bold uppercase tracking-[0.4em] text-background transition-all"
                onClick={handleAddToCart}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <ShoppingBag className="h-4 w-4" />
                  Add to Cart — {formatDesignPrice(design.price)}
                </span>
                <div className="absolute inset-0 -translate-x-full bg-accent-red transition-transform duration-500 group-hover:translate-x-0" />
              </button>
            </div>

            {/* Drive Download Notice */}
            <div className="mt-6 flex items-start gap-3 bg-accent-red/5 border border-accent-red/20 p-4">
              <Download className="h-4 w-4 text-accent-red mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-red mb-1">
                  How It Works
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  After purchase, you will receive a Google Drive link to download all embroidery files
                  (DST, PES, JEF, XXX, VP3, HUS, EXP). EMB format is not included.
                </p>
              </div>
            </div>

            {/* Accordions */}
            <div className="mt-10 divide-y divide-white/5 border-b border-white/5">
              {[
                {
                  q: "File Delivery",
                  a: "After completing your purchase, you will receive a Google Drive link where you can download all the embroidery files. The files are available in DST, PES, JEF, XXX, VP3, HUS, and EXP formats.",
                },
                {
                  q: "Compatible Machines",
                  a: "Our designs are compatible with most major embroidery machines including Brother, Janome, Singer, Bernina, Husqvarna Viking, Pfaff, and more. Choose the file format that matches your machine.",
                },
                {
                  q: "Usage Rights",
                  a: "You may use the purchased designs for personal and small-business commercial embroidery projects. Reselling the digital files themselves is not permitted.",
                },
              ].map((f, i) => (
                <div key={i}>
                  <button
                    onClick={() => setActiveTab(activeTab === i ? null : i)}
                    className="flex w-full items-center justify-between py-6 text-left"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        activeTab === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeTab === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-8 text-sm leading-relaxed text-muted-foreground">
                          {f.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Designs */}
      {related.length > 0 && (
        <div className="mt-32">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="font-display text-4xl font-bold tracking-tight">
              More Designs
            </h2>
            <Link
              href="/designs"
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-red underline underline-offset-8"
            >
              View all designs
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {related.map((d, i) => (
              <DesignCard key={d.id} design={d} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
