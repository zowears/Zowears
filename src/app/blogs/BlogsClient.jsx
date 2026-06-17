"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Calendar, User, ChevronRight, X } from "lucide-react";

// Importing beautiful lifestyle cover assets
import blog1 from "@/assets/look view 01.jpg";
import blog2 from "@/assets/look view 02.jpg";
import blog3 from "@/assets/look view 04.jpg";

const articles = [
  {
    id: "streetwear-pakistan-embroidery",
    title: "Decoding Streetwear in Pakistan: The Rise of Heavyweight Embroidery",
    summary: "Explore how Pakistani streetwear shifted from fast-fashion graphic prints to premium, high-density textured embroidery drops.",
    date: "May 18, 2026",
    readTime: "5 min read",
    author: "Zowears Editorial",
    category: "Culture",
    image: blog1,
    content: (
      <div className="space-y-6">
        <p className="text-lg text-white font-medium">
          Streetwear in Pakistan is no longer just a trend—it is a cultural movement. Over the past few years, the local fashion space has experienced a massive evolution, shifting from simple graphic printed tees to heavy-knit, high-density embroidered masterpieces.
        </p>
        
        <h2 className="text-2xl font-bold font-display text-white mt-8 uppercase">
          Beyond Fast Fashion: The Need for Texture & Weight
        </h2>
        <p>
          For too long, the Pakistani market was saturated with standard print-on-demand graphic t-shirts. While cheap to produce, these prints quickly fade, crack, and lose their shape after a few washes. Streetwear collectors began demanding garments that feel as premium as they look.
        </p>
        <p>
          This demand sparked the rise of heavyweight custom-knitted cotton combined with dense, high-stitch embroidery. Unlike standard screen prints, embroidery brings physical texture, depth, and three-dimensional luxury to apparel. It transforms a simple black hoodie into a structured piece of wearable art.
        </p>

        <blockquote className="border-l-4 border-accent-red pl-6 py-2 italic text-white my-8 bg-white/[0.02]">
          "Embroidery isn't just a decoration; it's a testament of time, discipline, and luxury threadwork that survives the seasons."
        </blockquote>

        <h2 className="text-2xl font-bold font-display text-white mt-8 uppercase">
          Why Zowears Embroidery Stands Apart
        </h2>
        <p>
          At Zowears, we utilize specialized high-speed multi-head industrial embroidery systems to deliver thousands of stitches with micro-millimeter precision. By utilizing premium, high-density thread lines, our custom drops hold their structure perfectly, preventing any puckering or shrinkage.
        </p>
        <p>
          From modern graphic elements to intricate cultural scripts, each drop is meticulously tested for stitch retention and thread tension. The result is a bold, heavyweight statement piece built to last.
        </p>
      </div>
    )
  },
  {
    id: "choosing-streetwear-gsm-fabric",
    title: "Normal vs. Premium Fabrics: How to Choose the Perfect Weight",
    summary: "Uncover why fabric GSM is the most important spec in streetwear, and how to choose the right tier between 180 GSM and 300 GSM cotton.",
    date: "May 15, 2026",
    readTime: "4 min read",
    author: "Fabric Lab",
    category: "Technology",
    image: blog2,
    content: (
      <div className="space-y-6">
        <p className="text-lg text-white font-medium">
          In streetwear, the silhouette is everything. And nothing dictates the drape of a silhouette more than fabric weight, measured in GSM (Grams per Square Meter).
        </p>

        <h2 className="text-2xl font-bold font-display text-white mt-8 uppercase">
          What is GSM and Why Does It Matter?
        </h2>
        <p>
          GSM represents the density and weight of a fabric. Standard fashion t-shirts usually range between 130 and 160 GSM, resulting in a thin, clingy drape that accentuates body contours. Premium streetwear, however, relies on heavier GSM values to achieve that structured, boxy silhouette that drops perfectly off the shoulders.
        </p>

        <h2 className="text-2xl font-bold font-display text-white mt-8 uppercase">
          Understanding the Zowears Fabrication Tiers
        </h2>
        <p>
          We are the first local streetwear brand to offer every product in two custom-knitted fabric weights:
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 my-8">
          <div className="p-6 border border-white/5 bg-white/[0.02] rounded-2xl">
            <h3 className="font-display font-bold text-white uppercase text-lg mb-2">180 GSM: Normal Weight</h3>
            <p className="text-sm">
              Our lightweight, super-soft combed cotton jersey. Specially engineered to keep you cool and highly breathable in Pakistan's warm summers, without sacrificing the structural oversized shoulder fit.
            </p>
          </div>
          <div className="p-6 border border-accent-red/20 bg-accent-red/[0.02] rounded-2xl">
            <h3 className="font-display font-bold text-accent-red uppercase text-lg mb-2">300 GSM: Premium Heavyweight</h3>
            <p className="text-sm">
              Our ultra-dense double-knit interlock cotton. Offering ultimate stiff, boxy armor that doesn't bend, draping perfectly for that high-fashion boxy streetwear look and perfectly supporting heavy embroidery drops.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold font-display text-white mt-8 uppercase">
          How to Decide?
        </h2>
        <p>
          If you plan to wear your streetwear daily in Pakistan's high summer afternoon heat, our **Normal 180 GSM** fabric is the ideal choice. If you want that ultimate, stiff, luxury boxy fit that stands out in the crowd and has unmatched durability, our **Premium 300 GSM** is the ultimate choice.
        </p>
      </div>
    )
  },
  {
    id: "arabic-calligraphy-modern-streetwear",
    title: "Art in Threads: Blending Arabic Calligraphy with Modern Streetwear",
    summary: "A deep dive into how Zowears integrates traditional Arabic script writing and Islamic typography with bold streetwear garments.",
    date: "May 10, 2026",
    readTime: "6 min read",
    author: "Zowears Design Studio",
    category: "Design",
    image: blog3,
    content: (
      <div className="space-y-6">
        <p className="text-lg text-white font-medium">
          Arabic calligraphy is one of the most sophisticated artistic heritages in the world. At Zowears, we are bridging the gap between historical calligraphy strokes and modern streetwear silhouettes.
        </p>

        <h2 className="text-2xl font-bold font-display text-white mt-8 uppercase">
          Bridging Heritage & Modern Streets
        </h2>
        <p>
          Arabic calligraphy relies on rigorous geometric rules, balance, and sweeping curved pathways. When integrated onto oversized hoodies, plain oversized tees, and detailed embroidery drops, it introduces an entirely new aesthetic dimension that feels extremely luxurious and culturally grounded.
        </p>
        <p>
          Moving beyond simple printed typography, our design team works with traditional calligraphers to sketch bespoke phrases in Thuluth, Diwani, and contemporary abstract script styles. These drawings are then vectorized and converted into dense, multi-layer embroidery code.
        </p>

        <h2 className="text-2xl font-bold font-display text-white mt-8 uppercase">
          Stitching the Canvas: Technical Challenges
        </h2>
        <p>
          Embroidering calligraphy requires exceptional precision. The continuous brush strokes, line width variations, and the crucial placement of dots (Nuqta) require dynamic thread tension and direction variations.
        </p>
        <p>
          We stitch our calligraphy drops on heavyweight 300 GSM luxury cotton to ensure that the dense needlework has a solid foundation. This avoids fabric stretching and puckering, providing a highly-defined, clean, and elevated finish that makes a bold statement.
        </p>
      </div>
    )
  }
];

export default function BlogsClient() {
  const [activeArticle, setActiveArticle] = useState(null);

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 md:px-8 bg-[#0a0a0a] relative overflow-hidden">
      {/* Texture & Ambient glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e1e_1px,transparent_1px)] bg-size-[24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent-red/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Back Link */}
        <div className="mb-12">
          <Link href="/" className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </div>

        {/* Section Header */}
        <div className="mb-20 max-w-3xl">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-12 bg-accent-red" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-accent-red font-bold">The Zowears Journal</span>
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-black tracking-[-0.04em] leading-[0.95] uppercase text-white">
            STREETWEAR <br />
            <span className="text-gradient">PERSPECTIVES.</span>
          </h1>
          <p className="mt-8 text-sm sm:text-lg text-muted-foreground leading-relaxed font-light">
            Explore deep dives into streetwear history, fabric innovations, the intricacies of high-density embroidery, and the calligraphy culture redefining local Pakistani fashion.
          </p>
        </div>

        {/* Grid of Articles */}
        <div className="grid gap-8 md:grid-cols-3">
          {articles.map((art) => (
            <article 
              key={art.id}
              className="border border-white/5 bg-white/[0.01] rounded-[2rem] overflow-hidden group hover:border-white/10 transition-all duration-500 flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                <Image 
                  src={art.image} 
                  alt={art.title} 
                  fill 
                  className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-4 left-4 bg-accent-red text-white text-[8px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full">
                  {art.category}
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1 justify-between">
                <div>
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-[9px] uppercase tracking-wider text-white/40 mb-4 font-bold">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {art.date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {art.readTime}</span>
                  </div>

                  <h2 className="font-display text-xl font-bold tracking-tight text-white mb-4 line-clamp-2 group-hover:text-accent-red transition-colors duration-300">
                    {art.title}
                  </h2>
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 font-light mb-6">
                    {art.summary}
                  </p>
                </div>

                <button
                  onClick={() => setActiveArticle(art)}
                  className="group/btn inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white hover:text-accent-red transition-colors duration-300 pt-4 border-t border-white/5"
                >
                  Read Article 
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </article>
          ))}
        </div>

      </div>

      {/* Article Overlay / Modal */}
      <AnimatePresence>
        {activeArticle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-center items-start bg-background/95 backdrop-blur-2xl overflow-y-auto py-20 md:py-32 px-4"
          >
            
            <button 
              onClick={() => setActiveArticle(null)}
              className="fixed right-6 top-6 md:right-12 md:top-12 z-50 group p-3 text-white/50 hover:text-white transition-colors duration-300 bg-[#0a0a0a]/50 rounded-full backdrop-blur-md border border-white/5"
              aria-label="Close article"
            >
              <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
            </button>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-3xl bg-surface/50 border border-white/5 p-8 md:p-16 rounded-[2.5rem] relative mt-4"
            >
              
              {/* Category */}
              <div className="mb-6 flex items-center gap-4">
                <span className="h-px w-8 bg-accent-red" />
                <span className="text-[10px] uppercase tracking-[0.4em] text-accent-red font-bold">{activeArticle.category}</span>
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-5xl font-black tracking-[-0.04em] leading-[1.1] uppercase text-white mb-8">
                {activeArticle.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap gap-6 items-center border-b border-white/5 pb-8 mb-8 text-[10px] uppercase tracking-[0.25em] text-white/40 font-bold">
                <span className="flex items-center gap-2"><User className="h-4 w-4 text-accent-red" /> {activeArticle.author}</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-accent-red" /> {activeArticle.date}</span>
              </div>

              {/* Rich Body Content */}
              <div className="text-muted-foreground leading-relaxed text-sm md:text-base font-light space-y-6">
                {activeArticle.content}
              </div>

              {/* Bottom CTA */}
              <div className="mt-12 pt-8 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setActiveArticle(null)}
                  className="bg-accent-red text-white text-[10px] font-bold uppercase tracking-[0.3em] px-8 py-4 rounded-full hover:bg-white hover:text-black transition-colors duration-300"
                >
                  Close Article
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
