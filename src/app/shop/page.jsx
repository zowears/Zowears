"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Rows3, SlidersHorizontal, X, ChevronDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { ProductSkeleton } from "@/components/ProductSkeleton";

const sizes = ["M", "L", "XL"];
const filterCategories = [
  "T-Shirts",
  "Hoodies",
  "Zipper Hoodies",
  "Sweatshirts",
  // "Denim Jackets",
  "Special for Girls",
  "Plain Tee & Hoodies"
];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("c") || undefined;

  const { data: products, isLoading } = useQuery({
    queryKey: ["shop-products", "exclude-kids"],
    queryFn: () => fetchProducts(1, 100, { excludeKids: true }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const [grid, setGrid] = React.useState(true);
  const [drawer, setDrawer] = React.useState(false);
  const [selectedCats, setSelectedCats] = React.useState(() => {
    const initialC = searchParams.get("c");
    return initialC ? [initialC] : [];
  });
  const [price, setPrice] = React.useState(5000);
  const [size, setSize] = React.useState([]);
  const [sort, setSort] = React.useState("featured");
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 12;

  React.useEffect(() => {
    setPage(1);
  }, [selectedCats, price, sort]);

  React.useEffect(() => {
    const c = searchParams.get("c");
    if (c) {
      setSelectedCats([c]);
    } else if (!searchParams.has("c")) {
      setSelectedCats([]);
    }
  }, [searchParams]);

  const filtered = React.useMemo(() => {
    if (!products) return [];
    // Ensure adult products only: exclude any kids wear
    let list = products.filter(
      (p) => !p.isKidsWear && p.productType !== "kids" && !p.categories?.includes("Kids Wear")
    );
    if (selectedCats.length > 0) {
      list = list.filter((p) => {
        const pCats = p.categories || [];
        return selectedCats.some(c => pCats.includes(c));
      });
    }
    list = list.filter((p) => p.price <= price);
    if (sort === "asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    // For default "featured" sort, preserve backend rank order (Rank 1-10 first)
    return list;
  }, [products, selectedCats, price, sort]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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
              onClick={() => setSelectedCats([])}
              className={`group flex w-full items-center justify-between text-sm transition-colors ${selectedCats.length === 0 ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              All silhouettes
              {selectedCats.length === 0 && <div className="h-1 w-1 rounded-full bg-accent-red" />}
            </button>
          </li>
          {filterCategories.map((cat) => (
            <li key={cat} className="space-y-2">
              <button
                onClick={() => setSelectedCats([cat])}
                className={`group flex w-full items-center justify-between text-sm transition-colors ${selectedCats.includes(cat) ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`}
              >
                {cat}
                {selectedCats.includes(cat) && <div className="h-1 w-1 rounded-full bg-accent-red" />}
              </button>
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
          Collective · {isLoading ? "Fetching..." : `${filtered.length} items`}
        </div>
        <h1 className="mt-6 font-display text-6xl font-bold tracking-[-0.06em] md:text-9xl">
          {selectedCats.length === 1 ? selectedCats[0] : (selectedCats.length > 1 ? "Filtered Collection" : "All products")}
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
              {isLoading ? "Fetching collection..." : `Showing ${filtered.length} results`}
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
                <ProductSkeleton key={i} />
              ))
            ) : paginatedProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>

          {!isLoading && filtered.length === 0 && (
            <div className="py-32 text-center">
              <div className="font-display text-2xl text-muted-foreground">No matches found for this filter.</div>
              <button onClick={() => { setSelectedCats([]); setPrice(5000); }} className="mt-8 text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red underline underline-offset-8">Clear all filters</button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-24 flex flex-wrap items-center justify-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="mr-2 border border-white/5 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.4em] transition-all hover:bg-white/5 disabled:opacity-50 disabled:pointer-events-none"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-12 w-12 border text-[10px] font-bold transition-all ${n === page ? "border-accent-red bg-accent-red text-white" : "border-white/5 hover:border-white/20"}`}
                >
                  {n}
                </button>
              ))}
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="ml-2 border border-white/5 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.4em] transition-all hover:bg-white/5 disabled:opacity-50 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          )}
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
