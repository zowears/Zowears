"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/context/cart";
import { cn } from "@/lib/utils";
import Logo from "@/assets/Zowear.png";
import Image from "next/image";
import { formatPrice } from "@/lib/products";


const nav = [
  { label: "Shop All", to: "/shop" },
  { label: "Hoodies", to: "/shop?c=hoodies" },
  { label: "T-shirts", to: "/shop?c=t-shirts" },
  { label: "Sweatshirts", to: "/shop?c=sweatshirts" },
    { label: "Designs", to: "/designs" },
];

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobile, setMobile] = React.useState(false);
  const [search, setSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const { count, setOpen } = useCart();

  // Debounce search query (500ms) - only search if >= 2 characters
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        setDebouncedQuery(searchQuery);
      } else {
        setDebouncedQuery("");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Only fetch if we have a debounced query
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      return data.map(p => ({
        ...p,
        id: p._id,
        jp: p.jp || "新作",
        rating: p.rating || 5.0,
        reviews: p.reviews || 0,
        colors: p.colors || [{ name: "Onyx", hex: "#0a0a0a" }],
        sizes: p.sizes || ["S", "M", "L", "XL"],
      }));
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  });

  const closeSearch = () => {
    setSearch(false);
    setSearchQuery("");
  };

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
  };

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-1 z-40 w-full transition-all duration-700",
          scrolled
            ? "glass-dark border-b border-white/5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
            : "bg-transparent py-5",
        )}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 md:px-8">
          
          {/* Left: Brand Logo & Title + Mobile Menu Trigger */}
          <div className="flex items-center">
            <button
              onClick={() => setMobile(true)}
              className="flex items-center justify-center text-white/70 hover:text-white mr-4 md:hidden p-1.5"
              aria-label="Open menu"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>

            <Link href="/" className="group flex items-center gap-3 shrink-0">
              {/* Elegant SVG Calligraphy Logo Emblem */}
              {/* <div className="relative w-10 h-10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"> */}
                {/* Outer soft aura for hover glow */}
                
                {/* <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45" fill="#0a0a0a" stroke="url(#ringGlow)" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="3 3" />
                  
                  <path
                    d="M50 22 C55 22, 64 30, 60 48 C55 64, 38 70, 36 78 C35 80, 39 80, 42 78 C52 74, 62 60, 65 48 C68 34, 58 22, 50 22 Z"
                    fill="url(#logoGlow)"
                    opacity="1"
                    filter="url(#logoGlowFilter)"
                  />
                  
                  <path
                    d="M38 42 C44 48, 56 48, 62 42"
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeOpacity="0.95"
                    filter="url(#logoGlowFilter)"
                  />
                  
                  <circle cx="58" cy="30" r="5" fill="#ff3333" filter="url(#logoGlowFilter)" />
                  
                  <path d="M42 66 L58 66" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
                  <path d="M46 72 L54 72" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />

                  <defs>
                    <linearGradient id="logoGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="35%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#ff3333" />
                    </linearGradient>
                    
                    <linearGradient id="ringGlow" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ff3333" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
                    </linearGradient>
                    
                    <filter id="logoGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#ff3333" floodOpacity="0.9" />
                    </filter>
                  </defs>
                </svg> */}
              {/* </div> */}
              
              <div className="flex flex-col items-start leading-[0.8] justify-center">
                <Image className="w-[150px] h-full" src={Logo} alt="Zowears Logo" width={130} height={130} priority />
                {/* <span className="font-display text-xl sm:text-2xl font-black tracking-[-0.04em] text-white transition-colors duration-300 group-hover:text-accent-red">
                  ZOWEARS
                </span>
                <span className="text-[8px] tracking-[0.4em] uppercase text-white/40 font-bold mt-1.5 group-hover:text-white/60 transition-colors duration-300">
                  PREMIUM ARTISTRY
                </span> */}
              </div>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden items-center justify-center gap-2 lg:gap-4 md:flex flex-1 mx-4">
            {nav.map((n) => (
              <Link
                key={n.label}
                href={n.to}
                className="group relative px-2.5 py-1.5 text-[10.5px] lg:text-[13px] font-bold uppercase tracking-[0.25em] text-white/60 transition-colors duration-300 hover:text-white"
              >
                {n.label}
                <span className="absolute inset-0 w-full h-full bg-white/3 rounded-full scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300" />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-accent-red rounded-full transition-all duration-300 group-hover:w-1/2" />
              </Link>
            ))}
          </nav>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            <button
              onClick={() => setSearch(true)}
              className="group relative rounded-full p-2.5 transition-all duration-300 hover:bg-white/5 hover:text-accent-red"
              aria-label="Search"
            >
              <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
            </button>
            <button 
              className="hidden rounded-full p-2.5 transition-all duration-300 hover:bg-white/5 hover:text-accent-red md:block" 
              aria-label="Account"
            >
              <User className="h-4 w-4" />
            </button>
            <button
              onClick={() => setOpen(true)}
              className="relative group rounded-full p-2.5 transition-all duration-300 hover:bg-white/5 hover:text-accent-red"
              aria-label="Cart"
            >
              <ShoppingBag className="h-4 w-4 transition-transform group-hover:scale-110" />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-red px-1 text-[9px] font-bold text-white shadow-[0_0_10px_rgba(192,57,43,0.6)]">
                  {count}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Modern Search Overlay */}
      <AnimatePresence>
        {search && (
          <form
            onSubmit={(e) => e.preventDefault()}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-2xl"
          >
            <button type="button" onClick={closeSearch} className="absolute right-8 top-8 group p-4">
              <X className="h-8 w-8 transition-transform group-hover:rotate-90" />
            </button>
            
            <div className="w-full max-w-4xl px-6">
              <div className="text-[10px] uppercase tracking-[0.6em] text-accent-red font-bold mb-4">Search Collective</div>
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find your silhouette..."
                className="w-full border-b-2 border-white/10 bg-transparent py-8 font-display text-4xl font-bold outline-none transition-colors focus:border-accent-red md:text-7xl"
              />
              
              {/* Search Results / Suggested Tags */}
              <div className="mt-8 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                {isSearching ? (
                  <div className="py-12 text-center font-mono text-[11px] uppercase tracking-[0.4em] text-accent-red animate-pulse">
                    [Searching Collective...]
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={closeSearch}
                        className="group flex items-center gap-4 border border-white/5 bg-white/2 p-4 transition-all duration-300 hover:border-accent-red hover:bg-accent-red/5"
                      >
                        <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden border border-white/10 bg-zinc-900">
                          {product.image && (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="64px"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent-red">
                              {product.category?.name || product.category}
                            </span>
                            {product.badge && (
                              <span className="bg-accent-red px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.1em] text-white">
                                {product.badge}
                              </span>
                            )}
                          </div>
                          <h4 className="font-display text-base font-bold tracking-tight text-white uppercase truncate mt-1 group-hover:text-accent-red transition-colors">
                            {product.name}
                          </h4>
                          <p className="font-serif-jp text-[10px] text-muted-foreground/60 mt-0.5">
                            {product.jp}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-display text-sm font-bold text-white">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery.trim() !== "" ? (
                  <div className="py-12 text-center font-mono text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
                    [No Silhouettes Found]
                  </div>
                ) : (
                  <div className="py-6">
                    <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-4 font-mono">// SUGGESTED CONCEPTS</div>
                    <div className="flex flex-wrap gap-3">
                      {["Calligraphy", "Heavyweight", "Oversized", "Embroidery", "Premium"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleTagClick(t)}
                          className="border border-white/10 px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:border-accent-red hover:bg-accent-red cursor-pointer"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}
      </AnimatePresence>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {mobile && (
          <div className="fixed inset-0 z-50 bg-background">
            <div className="flex h-24 items-center justify-between border-b border-white/5 px-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8">
                  <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" fill="#0a0a0a" stroke="url(#mobRingGlow)" strokeWidth="1.5" />
                    <path
                      d="M50 22 C55 22, 64 30, 60 48 C55 64, 38 70, 36 78 C35 80, 39 80, 42 78 C52 74, 62 60, 65 48 C68 34, 58 22, 50 22 Z"
                      fill="url(#mobLogoGlow)"
                      filter="url(#mobLogoGlowFilter)"
                    />
                    <circle cx="58" cy="30" r="5" fill="#ff3333" filter="url(#mobLogoGlowFilter)" />
                    <defs>
                      <linearGradient id="mobLogoGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="35%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#ff3333" />
                      </linearGradient>
                      <linearGradient id="mobRingGlow" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ff3333" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
                      </linearGradient>
                      <filter id="mobLogoGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ff3333" floodOpacity="0.9" />
                      </filter>
                    </defs>
                  </svg>
                </div>
                <div className="font-display text-2xl font-bold tracking-tight">ZOWEARS</div>
              </div>
              <button onClick={() => setMobile(false)} className="p-2"><X className="h-6 w-6" /></button>
            </div>
            <nav className="flex flex-col p-12">
              {nav.map((n, i) => (
                <div key={i}>
                  <Link
                    href={n.to}
                    onClick={() => setMobile(false)}
                    className="group flex items-center justify-between border-b border-white/5 py-8"
                  >
                    <span className="font-display text-4xl font-bold tracking-tight group-hover:text-accent-red">{n.label}</span>
                    <span className="font-serif text-lg text-white/10 group-hover:text-accent-red/20">{i + 1}</span>
                  </Link>
                </div>
              ))}
            </nav>
            <div className="absolute bottom-12 left-12 right-12 flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">© 2026 Zowears Collective</div>
              <div className="flex gap-4">
                <span className="text-[10px] uppercase tracking-[0.4em]">IG</span>
                <span className="text-[10px] uppercase tracking-[0.4em]">TW</span>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
