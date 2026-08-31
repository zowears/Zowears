"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import img1 from "@/assets/streetwear-fashion-pakistan-1.jpg";
import img2 from "@/assets/streetwear-fashion-pakistan-2.jpg";
import img3 from "@/assets/streetwear-fashion-pakistan-3.jpg";
import img4 from "@/assets/streetwear-fashion-pakistan-4.jpg";
import img5 from "@/assets/streetwear-fashion-pakistan-5.jpg";
import img6 from "@/assets/streetwear-fashion-pakistan-6.jpg";

const images = [img1, img2, img3, img4, img5, img6];

export function Gallery() {
  return (
    <section className="bg-background py-12">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8">
        <div className="mb-12 flex flex-col items-center text-center">
          <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.05em] md:text-7xl">
            Seen on the <span className="text-gradient">streets</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative aspect-[3/4] overflow-hidden bg-surface"
            >
              <Image
                src={img}
                alt={`Premium streetwear fashion look in Pakistan - Look ${i + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-accent-red/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">View Look</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
