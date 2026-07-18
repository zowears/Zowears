"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDesigns, formatDesignPrice } from "@/lib/designs";
import { DesignCard } from "@/components/DesignCard";
import { motion } from "framer-motion";
import { Search, Layers, Sparkles, Filter } from "lucide-react";
import { useState, useMemo } from "react";

export default function DesignsPage() {
  const { data: designs, isLoading } = useQuery({
    queryKey: ["designs"],
    queryFn: fetchDesigns,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    if (!designs) return ["All"];
    const cats = [...new Set(designs.map(d => d.category || "General"))];
    return ["All", ...cats];
  }, [designs]);

  const filteredDesigns = useMemo(() => {
    if (!designs) return [];
    let filtered = designs;

    if (activeCategory !== "All") {
      filtered = filtered.filter(d => (d.category || "General") === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.designType?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [designs, searchQuery, activeCategory]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-20">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-accent-red/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-10 w-80 h-80 bg-accent-red/3 rounded-full blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-[1600px] px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-accent-red/10 border border-accent-red/20 px-4 py-1.5 mb-8">
              <Sparkles className="h-3.5 w-3.5 text-accent-red" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red">
                Premium Embroidery Files
              </span>
            </div>

            <h1 className="font-display text-5xl font-bold tracking-[-0.06em] md:text-8xl lg:text-9xl">
              <span className="text-gradient">Embroidery</span>
              <br />
              <span className="text-foreground/90">Designs</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-lg">
              Premium machine embroidery designs — every design just{" "}
              <span className="text-accent-red font-bold">$1.00</span>.
              Get DST, PES, JEF, and more formats. EMB not included.
            </p>

            {/* Search Bar */}
            <div className="mx-auto mt-10 max-w-lg">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-accent-red transition-colors" />
                <input
                  type="text"
                  placeholder="Search designs by name, type, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface border border-white/5 py-4 pl-12 pr-5 text-sm outline-none transition-all focus:border-accent-red/50 focus:shadow-[0_0_30px_rgba(200,169,110,0.08)] placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 text-[10px] font-bold uppercase tracking-[0.25em] border transition-all duration-300 ${
                  activeCategory === cat
                    ? "border-accent-red bg-accent-red text-white"
                    : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex items-center justify-center gap-8 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50"
          >
            <span className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5" />
              {filteredDesigns.length} Design{filteredDesigns.length !== 1 ? "s" : ""}
            </span>
            <span className="text-white/10">|</span>
            <span>All at $1.00 each</span>
            <span className="text-white/10">|</span>
            <span>Instant Drive Download</span>
          </motion.div>
        </div>
      </section>

      {/* Designs Grid */}
      <section className="mx-auto max-w-[1600px] px-4 pb-32 md:px-8">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-surface animate-pulse border border-white/5" />
                <div className="space-y-2">
                  <div className="h-4 w-2/3 bg-surface animate-pulse" />
                  <div className="h-3 w-1/2 bg-surface animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="py-32 text-center">
            <Layers className="mx-auto h-16 w-16 text-white/5 mb-6" />
            <h2 className="font-display text-3xl font-bold tracking-tight">No designs found</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {searchQuery ? "Try adjusting your search terms." : "Designs will appear here once added."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6 md:gap-y-14">
            {filteredDesigns.map((design, i) => (
              <DesignCard key={design.id} design={design} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-white/5 bg-surface/50">
        <div className="mx-auto max-w-[1600px] px-4 py-20 md:px-8 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
            Every Design, Just <span className="text-gradient">$1.00</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            Get high-quality embroidery files in DST, PES, JEF, XXX, VP3, HUS, and EXP formats.
            EMB format is not included.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {["DST", "PES", "JEF", "XXX", "VP3", "HUS", "EXP"].map((fmt) => (
              <span
                key={fmt}
                className="border border-accent-red/30 bg-accent-red/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-accent-red"
              >
                .{fmt}
              </span>
            ))}
            <span className="border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground line-through opacity-50">
              .EMB
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
