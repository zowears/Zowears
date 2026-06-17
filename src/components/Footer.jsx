"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background pt-12 pb-6">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8">
        <div className="grid gap-16 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-6">
            <Link href="/" className="inline-block group">
              <div className="font-display text-4xl font-bold tracking-[-0.06em] group-hover:scale-105 transition-transform duration-500 md:text-6xl">
                ZOWEARS
              </div>
            </Link>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-muted-foreground md:text-lg">
              Premium embroidered and printed streetwear crafted in Pakistan. We blend modern art, intricate Arabic calligraphy, and premium heavyweight fabrics.
            </p>
            <div className="mt-10 flex gap-6">
              {[Instagram].map((Icon, i) => (
                <button key={i} className="group relative h-12 w-12 flex items-center justify-center border border-white/10 rounded-full hover:border-accent-red transition-colors">
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 rounded-full bg-accent-red opacity-0 group-hover:opacity-10 blur-md transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-[10px] uppercase tracking-[0.4em] text-accent-red font-bold mb-8">Information</div>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/embroidered" className="hover:text-foreground transition-colors">Embroidered</Link></li>
              <li><Link href="/shipping" className="hover:text-foreground transition-colors">Shipping</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact US</Link></li>
              <li><Link href="/fabrics" className="hover:text-foreground transition-colors">Fabrics</Link></li>
              <li><Link href="/blogs" className="hover:text-foreground transition-colors">Blogs</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="text-[10px] uppercase tracking-[0.4em] text-accent-red font-bold mb-8">Newsletter</div>
            <p className="text-xs text-muted-foreground mb-6">Join the collective for early access to limited drops.</p>
            <div className="flex border-b border-white/10 pb-2">
              <input type="email" placeholder="Email address" className="bg-transparent text-xs w-full outline-none py-2" />
              <button className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-accent-red transition-colors">Join</button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-white/30 font-semibold">
            <span>Express Delivery to:</span>
            <span className="text-white/50 hover:text-accent-red transition-colors cursor-default">Dubai (UAE)</span> · 
            <span className="text-white/50 hover:text-accent-red transition-colors cursor-default">Riyadh (KSA)</span> · 
            <span className="text-white/50 hover:text-accent-red transition-colors cursor-default">Doha (Qatar)</span> · 
            <span className="text-white/50 hover:text-accent-red transition-colors cursor-default">Kuwait City</span> · 
            <span className="text-white/50 hover:text-accent-red transition-colors cursor-default">Karachi (PK)</span> ·
            <span className="text-white/50 hover:text-accent-red transition-colors cursor-default">Worldwide</span>
          </div>
          <div className="flex gap-8 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            <Link href="/privacy-terms" className="hover:text-foreground">Privacy & Terms</Link>
            <Link href="/returns" className="hover:text-foreground transition-colors">Return Policy</Link>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            ©ZOWEARS COLLECTIVE-2026 · Karachi · Dubai · Riyadh
          </div>
        </div>
      </div>
    </footer>
  );
}
