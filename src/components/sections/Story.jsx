"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import story from "@/assets/premium-embroidery-craftsmanship.jpg";
import lifestyle from "@/assets/embroidered-streetwear-lifestyle-pakistan.jpg";

export function Story() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-surface py-12">
      <div className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 select-none font-sans text-[clamp(200px,40vw,800px)] font-black leading-none text-foreground/[0.03] uppercase tracking-widest">
        CRAFTED
      </div>
      
      <div className="relative mx-auto grid max-w-[1600px] gap-16 px-4 md:grid-cols-12 md:gap-12 md:px-8">
        <div className="md:col-span-5 md:col-start-1">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="mt-8 font-display text-5xl font-bold leading-[0.95] tracking-[-0.06em] md:text-8xl">
              Made in <span className="text-gradient">shadow.</span>
              <br />
              <span className="font-serif italic font-light text-foreground/60 lowercase">Worn in light.</span>
            </h2>
            
            <div className="mt-12 space-y-8 text-sm leading-relaxed text-muted-foreground md:text-lg">
              <p>
                Zowears is a contemporary design collective dedicated to high-end embroidery, premium typography, and intricate Arabic calligraphy. Our studio serves as a laboratory for textile innovation.
              </p>
              <p>
                Deeply rooted in heritage, our designs travel across borders. From our workshop to the streets of Dubai, Riyadh, Doha, and the wider Gulf, we bring custom calligraphy script, hand-finished heavyweight cotton garments, and express door-to-door delivery.
              </p>
              <p className="font-serif text-foreground/40 text-xs leading-relaxed border-l-2 border-accent-red/40 pl-4 py-1.5 font-light my-4" dir="rtl" style={{ textAlign: "right", fontFamily: "var(--font-serif-jp), serif" }}>
                تصاميمنا الفاخرة تعبر الحدود لتصلكم مباشرة في دبي، الرياض، والدوحة، محملة بجمال الخط العربي وجودة القطن الفاخر. شحن سريع ومباشر لكافة دول الخليج العربي.
              </p>
              <p className="font-serif text-foreground text-xl md:text-2xl border-l-2 border-accent-red pl-6 py-2">
                Traditional Craft, Modern Streets. <br />
                Less, said louder.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-6">
              <Stat n="180+" l="GSM Cotton" />
              <Stat n="48h" l="Hand-finish" />
              <Stat n="∞" l="Refinement" />
            </div>
          </motion.div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-background">
              <Image 
                src={story} 
                alt="Zowears premium embroidery craftsmanship in Pakistan" 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover grayscale hover:grayscale-0 transition-all duration-[2000ms]" 
              />
            </div>
            <motion.div 
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute -bottom-16 -left-16 hidden aspect-square w-64 overflow-hidden border-[12px] border-surface md:block"
            >
              <div className="relative h-full w-full bg-white">
                <Image 
                  src={lifestyle} 
                  alt="Embroidered streetwear lifestyle in Pakistan" 
                  fill
                  sizes="256px"
                  className="object-cover" 
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, l }) {
  return (
    <div className="group cursor-default">
      <div className="font-display text-4xl font-bold tracking-tight text-foreground transition-colors group-hover:text-accent-red md:text-5xl">{n}</div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{l}</div>
    </div>
  );
}
