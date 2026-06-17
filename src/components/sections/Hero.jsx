"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

import imgMain from "@/assets/Hero Main Img.jpg";
import imgTrending from "@/assets/Hero Second Img.jpg";
import imgNew from "@/assets/Hero Third Img.jpg";

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // Determine flex values based on which card is active (hovered)
  const getFlexValue = (cardIndex) => {
    if (cardIndex === activeIndex) return "3.5";
    return "1.2";
  };

  const cardTransitionStyle = {
    transition: "flex 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pb-16 pt-18 bg-[#0E0D0C]">
      {/* Subtle Grid Overlay for texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e1e_1px,transparent_1px)] bg-size-[24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
        >
          {/* Left Content Column */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-8 pr-0 lg:pr-8">
            {/* Social Icons Bar */}
            <motion.div variants={textVariants} className="flex items-center gap-2 text-white/40">
              <div className="w-8 h-px bg-[#2E2B28]" />
              <Link href="https://instagram.com/zowears.co" target="_blank" className="hover:text-accent-red transition-colors duration-300 flex items-center gap-1">
                <Instagram className="w-4 h-4" />
                <span className="text-sm uppercase font-bold tracking-widest">Instagram</span>
              </Link>
            </motion.div>

            {/* Headline */}
            <motion.div variants={textVariants} className="space-y-2">
              <h1 className="font-display text-5xl sm:text-7xl lg:text-[3.5rem] xl:text-[4.5rem] font-black tracking-[-0.04em] leading-[0.9] uppercase text-[#F5F0E8]">
                PREMIUM <br />
                <span className="text-gradient">EMBROIDERED</span> <br />
                STREETWEAR.
              </h1>
            </motion.div>

            {/* Sub-headline / Description */}
            <motion.div variants={textVariants}>
              <p className="text-muted-foreground text-sm sm:text-base max-w-lg leading-relaxed font-sans font-light">
                Pakistan's ultimate fashion drop. Blending intricate Arabic calligraphy and diverse modern art with high-end streetwear. Discover our collection of printed tees, heavyweight hoodies, and plain oversized essentials—each custom-tailored in your choice of <strong className="text-[#F5F0E8]">Normal</strong> or <strong className="text-accent-red font-bold">Premium</strong> fabric.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={textVariants} className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/shop"
                className="group/btn relative inline-flex items-center justify-center overflow-hidden bg-accent-red px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0E0D0C] rounded-full transition-all duration-300 hover:shadow-[0_0_25px_rgba(200,169,110,0.4)]"
              >
                <span className="relative z-10">Shop Now</span>
                <div className="absolute inset-0 -translate-x-full bg-[#F5F0E8] transition-transform duration-500 group-hover/btn:translate-x-0" />
                {/* Text color shift helper */}
                <div className="absolute inset-0 flex items-center justify-center translate-y-full text-[#0E0D0C] font-bold uppercase tracking-[0.2em] text-[11px] transition-all duration-500 group-hover/btn:translate-y-0 z-20">
                  Shop Now
                </div>
              </Link>
              <Link
                href="/shop?c=new"
                className="group relative inline-flex items-center justify-center overflow-hidden border border-[#2E2B28] hover:border-[#C8A96E] px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F0E8] rounded-full transition-all duration-300 hover:bg-[#C8A96E]/5"
              >
                Explore More
              </Link>
            </motion.div>
          </div>

          {/* Right Image Grid Column */}
          <div className="lg:col-span-7 w-full">
            <div
              className="flex flex-row gap-4 w-full h-[400px] sm:h-[500px] lg:h-[580px] xl:h-[620px]"
              onMouseLeave={() => setActiveIndex(0)}
            >

              {/* Card 1: Main Collection */}
              <motion.div
                variants={cardVariants}
                style={{ flex: getFlexValue(0), ...cardTransitionStyle }}
                className="relative rounded-[2rem] overflow-hidden group border border-[#2E2B28] bg-surface"
                onMouseEnter={() => setActiveIndex(0)}
              >
                <Link href="/shop" className="block w-full h-full relative">
                  <div className="absolute inset-0 bg-linear-to-t from-[#0E0D0C]/90 via-[#0E0D0C]/30 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-95" />
                  <Image
                    src={imgMain}
                    alt="Zowears Signature Collection"
                    fill
                    priority
                    sizes="(min-width: 1024px) 60vw, 90vw"
                    className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                  {/* Horizontal text (when active/expanded) */}
                  <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-full text-center z-20 px-4 transition-all duration-500 ${activeIndex === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <h3 className="text-[#F5F0E8] text-base sm:text-xl lg:text-2xl font-bold tracking-[0.2em] uppercase font-display translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      EMBROIDERED & CALLIGRAPHY ART
                    </h3>
                    <p className="text-[10px] text-accent-red font-bold tracking-[0.4em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 mt-2">
                      View Collection
                    </p>
                  </div>
                  {/* Vertical text (when collapsed) */}
                  <div className={`absolute inset-0 flex items-end justify-center pb-12 z-20 transition-all duration-500 ${activeIndex !== 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <span
                      className="text-[#F5F0E8] text-xs sm:text-sm font-bold tracking-[0.3em] uppercase whitespace-nowrap transition-all duration-500 group-hover:text-accent-red group-hover:-translate-y-2"
                      style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}
                    >
                      #EMBROIDERED & CALLIGRAPHY
                    </span>
                  </div>
                </Link>
              </motion.div>

              {/* Card 2: Trending Collection */}
              <motion.div
                variants={cardVariants}
                style={{ flex: getFlexValue(1), ...cardTransitionStyle }}
                className="relative rounded-[2rem] overflow-hidden group border border-[#2E2B28] bg-surface"
                onMouseEnter={() => setActiveIndex(1)}
              >
                <Link href="/shop" className="block w-full h-full relative">
                  <div className="absolute inset-0 bg-linear-to-t from-[#0E0D0C]/90 via-[#0E0D0C]/30 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-95" />
                  <Image
                    src={imgTrending}
                    alt="Printed & Hoodies"
                    fill
                    sizes="(min-width: 1024px) 60vw, 90vw"
                    className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                  {/* Horizontal text (when active/expanded) */}
                  <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-full text-center z-20 px-4 transition-all duration-500 ${activeIndex === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <h3 className="text-[#F5F0E8] text-base sm:text-xl lg:text-2xl font-bold tracking-[0.2em] uppercase font-display translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      PRINTED & HOODIES
                    </h3>
                    <p className="text-[10px] text-accent-red font-bold tracking-[0.4em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 mt-2">
                      View Collection
                    </p>
                  </div>
                  {/* Vertical text (when collapsed) */}
                  <div className={`absolute inset-0 flex items-end justify-center pb-12 z-20 transition-all duration-500 ${activeIndex !== 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <span
                      className="text-[#F5F0E8] text-xs sm:text-sm font-bold tracking-[0.3em] uppercase whitespace-nowrap transition-all duration-500 group-hover:text-accent-red group-hover:-translate-y-2"
                      style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}
                    >
                      #PRINTED & HOODIES
                    </span>
                  </div>
                </Link>
              </motion.div>

              {/* Card 3: New Arrivals */}
              <motion.div
                variants={cardVariants}
                style={{ flex: getFlexValue(2), ...cardTransitionStyle }}
                className="relative rounded-[2rem] overflow-hidden group border border-[#2E2B28] bg-surface"
                onMouseEnter={() => setActiveIndex(2)}
              >
                <Link href="/shop" className="block w-full h-full relative">
                  <div className="absolute inset-0 bg-linear-to-t from-[#0E0D0C]/90 via-[#0E0D0C]/30 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-95" />
                  <Image
                    src={imgNew}
                    alt="Normal & Premium Fabric Option"
                    fill
                    sizes="(min-width: 1024px) 60vw, 90vw"
                    className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                  {/* Horizontal text (when active/expanded) */}
                  <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-full text-center z-20 px-4 transition-all duration-500 ${activeIndex === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <h3 className="text-[#F5F0E8] text-base sm:text-xl lg:text-2xl font-bold tracking-[0.2em] uppercase font-display translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      NORMAL & PREMIUM
                    </h3>
                    <p className="text-[10px] text-accent-red font-bold tracking-[0.4em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 mt-2">
                      View Collection
                    </p>
                  </div>
                  {/* Vertical text (when collapsed) */}
                  <div className={`absolute inset-0 flex items-end justify-center pb-12 z-20 transition-all duration-500 ${activeIndex !== 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <span
                      className="text-[#F5F0E8] text-xs sm:text-sm font-bold tracking-[0.3em] uppercase whitespace-nowrap transition-all duration-500 group-hover:text-accent-red group-hover:-translate-y-2"
                      style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}
                    >
                      #NORMAL & PREMIUM
                    </span>
                  </div>
                </Link>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

