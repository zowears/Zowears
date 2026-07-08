"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import countdownImg from "@/assets/001 (20).jpeg";

// Memoized time unit component to prevent re-renders
const TimeUnit = React.memo(({ value, label }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="font-display text-6xl font-bold tracking-tighter text-white md:text-9xl">
        {value.toString().padStart(2, "0")}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.4em] text-accent-red font-bold">
        {label}
      </div>
    </div>
  );
});

TimeUnit.displayName = "TimeUnit";

export function Countdown() {
  // Static countdown - doesn't update (set to a fixed target time)
  // In production, you'd calculate this from a server timestamp to prevent client tampering
  const [time, setTime] = React.useState({ h: 48, m: 0, s: 0 });
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    // Only create timer on mount, use a large interval to reduce updates
    // This countdown is cosmetic - in production calculate server-side
    timerRef.current = setInterval(() => {
      setTime((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        // Reset when complete
        return { h: 48, m: 0, s: 0 };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // Only run once on mount

  return (
    <section className="relative h-[80svh] min-h-[600px] w-full overflow-hidden bg-background">
      <div className="absolute inset-0">
        <Image
          src={countdownImg}
          alt="Limited drop"
          fill
          sizes="100vw"
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col items-center justify-center px-4 text-center md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-8 inline-flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-6 py-2 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-red opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-red" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">
              Limited Edition · Vol. 04
            </span>
          </div>

          <h2 className="font-display text-5xl font-bold tracking-[-0.05em] text-white md:text-8xl">
            RYUJIN COLLECTION
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-sm text-white/60 md:text-lg">
            Our most intricate embroidery work to date. Each piece is numbered and will never be reproduced.
          </p>

          <div className="mt-12 flex items-center justify-center gap-6 md:gap-12">
            <TimeUnit value={time.h} label="Hours" />
            <span className="mb-8 font-display text-4xl text-white/20 md:text-6xl">:</span>
            <TimeUnit value={time.m} label="Minutes" />
            <span className="mb-8 font-display text-4xl text-white/20 md:text-6xl">:</span>
            <TimeUnit value={time.s} label="Seconds" />
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="bg-foreground px-12 py-5 text-[11px] font-bold uppercase tracking-[0.4em] text-background transition-transform hover:scale-105"
            >
              Secure your piece
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
