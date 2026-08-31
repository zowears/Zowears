"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import cat1 from "@/assets/oversized-tshirts-pakistan.jpg";
import cat2 from "@/assets/heavyweight-embroidered-hoodies.jpg";
import cat4 from "@/assets/anime-streetwear-pakistan.jpg";
import cat5 from "@/assets/puff-printing-new-arrivals.jpg";

const cats = [
  { name: "Oversized Tees", img: cat1, c: "t-shirts", price: 1999, discount: 20 },
  { name: "Heavy Hoodies", img: cat2, c: "hoodies", price: 2899, discount: 15 },
  { name: "Anime", img: cat4, c: "anime", price: 2399, discount: 25 },
  { name: "New Arrivals", img: cat5, c: "", price: 2099, discount: 10 },
];

export function Categories() {
  return (
    <section className="border-t border-border bg-background py-4 md:py-12">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8">
        <div className="mb-6 flex items-end justify-between md:mb-16">
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tighter md:text-7xl">
            Shop by <span className="text-gradient">category</span>
          </h2>
          <Link
            href="/shop"
            className="group hidden items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] md:inline-flex"
          >
            Explore all <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 md:gap-4">
          {cats.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={c.c ? `/shop?c=${c.c}` : "/shop"}
                className="group relative block aspect-[3/4] sm:aspect-[2/3] lg:aspect-[3/4] overflow-hidden bg-surface rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Limited Sale Badge */}
                <span className="absolute top-2 left-2 md:top-4 md:left-4 bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-md z-10">
                  Limited Sale
                </span>
                <Image
                  src={c.img}
                  alt={`${c.name} - Premium embroidered streetwear in Pakistan`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110"
                />
                {/* Dark gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700" />
                <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-6 lg:p-5 xl:p-8">
                  <h3 className="font-display text-lg leading-tight md:text-3xl lg:text-2xl xl:text-4xl text-white font-bold tracking-tight">
                    {c.name}
                  </h3>
                  <div className="flex flex-wrap items-baseline gap-1.5 md:gap-2 mt-1.5 md:mt-2">
                    <span className="text-xs md:text-sm line-through text-gray-300">PKR {c.price?.toFixed(0)}</span>
                    <span className="text-base md:text-xl lg:text-lg xl:text-xl font-bold text-white">PKR {(c.price * (1 - (c.discount ?? 0) / 100)).toFixed(0)}</span>
                    <span className="text-[10px] md:text-xs bg-red-600 text-white px-1 py-0.5 rounded">{c.discount ? `${c.discount}% OFF` : "% OFF"}</span>
                  </div>
                  {/* Call-to-Action Button */}
                  <button className="mt-2 md:mt-4 self-start bg-accent-red text-white text-xs md:text-sm xl:text-base font-bold px-3 py-2 md:px-5 md:py-2.5 lg:px-4 lg:py-2 xl:px-6 xl:py-3 rounded-lg md:rounded-xl shadow-md border border-white/20 hover:scale-105 transform transition-transform duration-300">
                    Shop Now
                  </button>
                  <div className="mt-3 md:mt-4 h-0.5 w-0 bg-accent-red transition-all duration-500 group-hover:w-full" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
