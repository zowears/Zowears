"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function Newsletter() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8">
        <div className="relative overflow-hidden border border-white/5 bg-white/[0.02] px-8 py-20 md:px-24 md:py-32">
          <div className="relative z-10 grid gap-16 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >

              <h2 className="font-display text-5xl font-bold tracking-[-0.06em] md:text-8xl">
                Join the <br />
                <span className="text-gradient">collective.</span>
              </h2>
              <p className="mt-8 max-w-md text-sm leading-relaxed text-muted-foreground md:text-lg">
                Be the first to secure limited drops and exclusive silhouettes. No noise. Just the signals you need.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <form className="group relative flex w-full flex-col gap-6 md:flex-row md:items-end">
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mb-4 block">Email address</label>
                  <input
                    type="email"
                    placeholder="SILHOUETTE@ZOWEARS.JP"
                    className="w-full border-b border-white/10 bg-transparent py-4 font-display text-2xl font-bold uppercase tracking-tighter outline-none transition-colors focus:border-accent-red"
                  />
                </div>
                <button className="group relative flex items-center justify-center gap-4 bg-foreground px-12 py-5 text-[11px] font-bold uppercase tracking-[0.4em] text-background transition-all hover:bg-accent-red hover:text-white">
                  Join Now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
              <p className="mt-8 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                By joining, you agree to our privacy policy. You can leave the collective anytime.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
