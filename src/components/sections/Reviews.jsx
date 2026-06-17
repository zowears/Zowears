"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Zain Khan",
    role: "Collector",
    text: "The embroidery on the Arabic Calligraphy hoodie is unlike anything I've seen in Pakistan. The premium fabric option has an incredibly heavy and premium drape.",
    rating: 5,
  },
  {
    name: "Sarah Ahmed",
    role: "Streetwear Stylist",
    text: "Zowears has perfected the oversized silhouette. I ordered the plain oversized tee in Premium fabric, and it feels absolutely luxury. Heavy, structured, and effortless.",
    rating: 5,
  },
  {
    name: "Hamza Siddiqui",
    role: "Artist",
    text: "The blend of artistic calligraphy, modern graphics, and detailed embroidery is breathtaking. The normal fabric is great for daily wear, but the premium tier is next-level quality.",
    rating: 5,
  },
];

export function Reviews() {
  return (
    <section className="bg-surface py-18 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="mx-auto max-w-[1600px] px-4 md:px-8">
        <div className="mb-24 flex flex-col items-center text-center">
          <h2 className="mt-8 font-display text-5xl font-bold tracking-[-0.06em] md:text-8xl">
            What they <span className="text-gradient">feel.</span>
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative border border-white/5 bg-white/[0.02] p-8 md:p-12 group hover:bg-white/[0.04] transition-colors"
            >
              <Quote className="absolute top-8 right-8 h-8 w-8 text-white/5 transition-colors group-hover:text-accent-red/20" />
              
              <div className="flex gap-1 mb-8">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-accent-red text-accent-red" />
                ))}
              </div>
              
              <p className="text-lg leading-relaxed text-foreground/80 md:text-xl italic font-light">
                "{r.text}"
              </p>
              
              <div className="mt-12 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10" />
                <div>
                  <div className="font-display text-lg font-bold tracking-tight">{r.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-accent-red font-bold">{r.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 flex flex-col items-center justify-center text-center">
          <div className="font-display text-2xl font-bold mb-4 italic">Excellent ★★★★★ 4.9/5</div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Based on 1,240+ verified silhouettes</div>
        </div>
      </div>
    </section>
  );
}
