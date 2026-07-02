"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Layers } from "lucide-react";
import { formatDesignPrice } from "@/lib/designs";
import { useState } from "react";

export function DesignCard({ design, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/designs/${design.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-surface border border-white/5 hover:border-accent-red/30 transition-colors duration-500">
          {/* Image 1 — default */}
          <Image
            src={design.image1}
            alt={design.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={`object-cover transition-all duration-700 ease-out ${
              hovered ? "opacity-0 scale-105" : "opacity-100 scale-100"
            }`}
          />
          {/* Image 2 — on hover */}
          <Image
            src={design.image2}
            alt={`${design.name} alternate view`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={`object-cover transition-all duration-700 ease-out absolute inset-0 ${
              hovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />

          {/* Price badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-accent-red px-3 py-1.5 text-[11px] font-bold tracking-[0.15em] text-white shadow-[0_0_20px_rgba(200,169,110,0.4)]">
              {formatDesignPrice(design.price)}
            </span>
          </div>

          {/* Stitch count badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-black/70 backdrop-blur-md px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/80 flex items-center gap-1.5">
              <Layers className="h-3 w-3" />
              {design.stitchCount?.toLocaleString()} stitches
            </span>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* View Details action */}
          <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <div className="flex items-center justify-center gap-2 bg-white/95 backdrop-blur-sm py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black">
              <Eye className="h-3.5 w-3.5" />
              View Details
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-1.5 px-0.5">
          <h3 className="font-display text-base font-bold tracking-tight text-foreground/90 transition-colors group-hover:text-accent-red line-clamp-1">
            {design.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
              <span>{design.totalColors} Colors</span>
              <span className="text-white/10">·</span>
              <span>{design.size}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-red">
              {design.designType}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
