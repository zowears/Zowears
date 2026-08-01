"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Rows3, SlidersHorizontal, X, ChevronDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

const sizes = ["M", "L", "XL"];

const mainCats = [
  { 
    id: "Men's Wear", 
    label: "Men's Wear", 
    subs: [{ id: "T-shirts", label: "T-shirts" }, { id: "Hoodies", label: "Hoodies" }] 
  },
  { 
    id: "Girls Wear", 
    label: "Girls Wear", 
    subs: [{ id: "Hoodies", label: "Hoodies" }, { id: "Sweatshirts", label: "Sweatshirts" }] 
  },
  { 
    id: "Plain Tees", 
    label: "Plain Tees", 
    subs: [] 
  },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("c") || undefined;

  const { data: products, isLoading } = useQuery({
    queryKey: ["shop-products"],
    queryFn: () => fetchProducts(),
  });

  const [grid, setGrid] = React.useState(true);
  const [drawer, setDrawer] = React.useState(false);
  const [mainCat, setMainCat] = React.useState(searchParams.get("main") || undefined);
  const [subCat, setSubCat] = React.useState(searchParams.get("sub") || undefined);
  const [price, setPrice] = React.useState(5000);
  const [size, setSize] = React.useState([]);
  const [sort, setSort] = React.useState("featured");

  React.useEffect(() => {
    setMainCat(searchParams.get("main") || undefined);
    setSubCat(searchParams.get("sub") || undefined);
  }, [searchParams]);

  const filtered = React.useMemo(() => {
    if (!products) return [];
    let list = [...products];
    if (mainCat) list = list.filter((p) => p.mainCategory === mainCat);
    if (subCat) list = list.filter((p) => p.subCategory === subCat);
    list = list.filter((p) => p.price <= price);
    if (sort === "asc") list.sort((a, b) => a.price - b.price);
    if (sort === "desc") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [products, mainCat, subCat, price, sort]);

  const Filters = (
    <div className="space-y-12">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red">Category</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
        <ul className="space-y-4">
          <li>
            <button
              onClick={() => { setMainCat(undefined); setSubCat(undefined); }}
              className={`group flex w-full items-center justify-between text-sm transition-colors ${!mainCat ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              All silhouettes
              {!mainCat && <div className="h-1 w-1 rounded-full bg-accent-red" />}
            </button>
          </li>
          {mainCats.map((mc) => (
            <li key={mc.id} className="space-y-2">
              <button
                onClick={() => {
                  setMainCat(mc.id);
                  setSubCat(undefined); // Reset subcat when maincat is clicked
                }}
                className={`group flex w-full items-center justify-between text-sm transition-colors ${mainCat === mc.id ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`}
              >
                {mc.label}
                {mainCat === mc.id && !subCat && <div className="h-1 w-1 rounded-full bg-accent-red" />}
              </button>
              
              {/* Render Sub Categories if available and Main Category is active */}
              {mainCat === mc.id && mc.subs.length > 0 && (
                <ul className="pl-4 space-y-2 mt-2 border-l border-white/10">
                  {mc.subs.map((sc) => (
                    <li key={sc.id}>
                      <button
                        onClick={() => {
                          setMainCat(mc.id);
                          setSubCat(sc.id);
                        }}
                        className={`group flex w-full items-center justify-between text-xs transition-colors ${subCat === sc.id ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {sc.label}
                        {subCat === sc.id && <div className="h-1 w-1 rounded-full bg-accent-red" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red">Price range</span>
          <span className="text-[10px] font-bold text-muted-foreground">Rs. {price.toLocaleString("en-PK")}</span>
        </div>
        <input
          type="range"
          min={2000}
          max={5000}
          step={100}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full accent-accent-red bg-black/10 h-1 rounded-full appearance-none cursor-pointer"
        />
        <div className="mt-2 flex justify-between text-[10px] text-black/70">
          <span>Rs. 2,000</span>
          <span>Rs. 5,000</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-24 pt-24 md:px-8 md:pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.5em] text-accent-red">
          <span className="h-px w-12 bg-accent-red" />
          Collective · {filtered.length} items
        </div>
        <h1 className="mt-6 font-display text-6xl font-bold tracking-[-0.06em] md:text-9xl">
          {subCat ? subCat : (mainCat ? mainCats.find((x) => x.id === mainCat)?.label : "All products")}
        </h1>
      </motion.div>

      <div className="grid gap-16 md:grid-cols-12">
        <aside className="hidden md:col-span-3 md:block">
          <div className="sticky top-32">{Filters}</div>
        </aside>

        <div className="md:col-span-9">
          <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-8">
            <button
              onClick={() => setDrawer(true)}
              className="flex items-center gap-3 border border-white/10 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white/5 md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <div className="hidden text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground md:block">
              Showing {filtered.length} results
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none border border-white/10 bg-transparent pl-6 pr-12 py-3 text-[10px] font-bold uppercase tracking-[0.3em] outline-none focus:border-accent-red transition-colors"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="asc">Price: Low to High</option>
                  <option value="desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
              </div>
              
              <div className="hidden items-center border border-white/10 md:flex">
                <button onClick={() => setGrid(true)} className={`p-3 transition-colors ${grid ? "bg-foreground text-background" : "hover:bg-white/5"}`} aria-label="Grid view">
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button onClick={() => setGrid(false)} className={`p-3 transition-colors ${!grid ? "bg-foreground text-background" : "hover:bg-white/5"}`} aria-label="List view">
                  <Rows3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            className={
              grid
                ? "grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-3 md:gap-x-8"
                : "flex flex-col gap-12"
            }
          >
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse bg-white/5 rounded-xl" />
              ))
            ) : filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-32 text-center">
              <div className="font-display text-2xl text-muted-foreground">No matches found for this filter.</div>
              <button onClick={() => { setMainCat(undefined); setSubCat(undefined); setPrice(5000); }} className="mt-8 text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red underline underline-offset-8">Clear all filters</button>
            </div>
          )}

          <div className="mt-24 flex items-center justify-center gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`h-12 w-12 border text-[10px] font-bold transition-all ${n === 1 ? "border-accent-red bg-accent-red text-white" : "border-white/5 hover:border-white/20"}`}
              >
                {n}
              </button>
            ))}
            <button className="ml-4 border border-white/5 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.4em] transition-all hover:bg-white/5">Next page</button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {drawer && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="flex h-24 items-center justify-between border-b border-white/5 px-6">
              <div className="text-[11px] font-bold uppercase tracking-[0.4em]">Filter collective</div>
              <button onClick={() => setDrawer(false)} className="p-2"><X className="h-6 w-6" /></button>
            </div>
            <div className="h-[calc(100%-6rem)] overflow-y-auto p-8">{Filters}</div>
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-background p-6">
              <button onClick={() => setDrawer(false)} className="w-full bg-foreground py-5 text-[11px] font-bold uppercase tracking-[0.4em] text-background">Show {filtered.length} items</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopPage() {
  return (
    <React.Suspense fallback={<div className="p-32 text-center flex flex-col items-center justify-center">
      <div className="h-12 w-12 animate-spin border-2 border-accent-red border-t-transparent rounded-full mb-6" />
      <div className="text-[10px] uppercase tracking-[0.4em] animate-pulse">Entering Collective...</div>
    </div>}>
      <ShopContent />
    </React.Suspense>
  );
}
