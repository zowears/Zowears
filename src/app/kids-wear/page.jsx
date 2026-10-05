"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Rows3, SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { ProductSkeleton } from "@/components/ProductSkeleton";

const KIDS_SIZES = [
  "2/3",
  "3/4",
  "4/5",
  "5/6",
  "6/7",
  "7/8",
  "8/9",
  "9/10",
  "10/11",
  "11/12",
];

function KidsWearContent() {
  const searchParams = useSearchParams();

  const { data: allProducts, isLoading } = useQuery({
    queryKey: ["kids-products"],
    queryFn: () => fetchProducts(1, 100, { isKidsWear: true }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const [grid, setGrid] = React.useState(true);
  const [drawer, setDrawer] = React.useState(false);
  const [selectedSizes, setSelectedSizes] = React.useState(() => {
    const sizeParam = searchParams.get("size");
    return sizeParam ? [sizeParam] : [];
  });
  const [sort, setSort] = React.useState("featured");
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 12;

  // Only consider Kids Wear products
  const kidsProducts = React.useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter(
      (p) => p.isKidsWear || p.productType === "kids" || p.categories?.includes("Kids Wear")
    );
  }, [allProducts]);

  React.useEffect(() => {
    setPage(1);
  }, [selectedSizes, sort]);

  // Toggle or select a size
  const toggleSize = (sz) => {
    setSelectedSizes((prev) => {
      if (prev.includes(sz)) {
        return prev.filter((s) => s !== sz);
      } else {
        return [...prev, sz];
      }
    });
  };

  const clearSizes = () => {
    setSelectedSizes([]);
  };

  const filtered = React.useMemo(() => {
    let list = [...kidsProducts];

    // Filter strictly by age sizes
    if (selectedSizes.length > 0) {
      list = list.filter((p) => {
        const productSizes = p.sizes || [];
        return selectedSizes.some((s) => productSizes.includes(s));
      });
    }

    if (sort === "asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return list;
  }, [kidsProducts, selectedSizes, sort]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const Filters = (
    <div className="space-y-8">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red">
            Filter by Age Size
          </span>
          {selectedSizes.length > 0 && (
            <button
              onClick={clearSizes}
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-accent-red transition-colors"
            >
              Reset
            </button>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mb-4">
          Select child age range in years
        </p>

        {/* All Sizes button */}
        <div className="mb-4">
          <button
            onClick={clearSizes}
            className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-xs font-semibold transition-all ${
              selectedSizes.length === 0
                ? "border-accent-red bg-accent-red/10 text-black font-bold"
                : "border-white/10 bg-surface/40 text-muted-foreground hover:border-white/20 hover:text-white"
            }`}
          >
            <span>All Age Sizes</span>
            {selectedSizes.length === 0 && (
              <span className="h-1.5 w-1.5 rounded-full bg-accent-red" />
            )}
          </button>
        </div>

        {/* Age size chips / checkboxes */}
        <div className="grid grid-cols-2 gap-2">
          {KIDS_SIZES.map((sz) => {
            const isSelected = selectedSizes.includes(sz);
            // Count matching products
            const count = kidsProducts.filter((p) => p.sizes?.includes(sz)).length;
            return (
              <button
                key={sz}
                onClick={() => toggleSize(sz)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "border-accent-red bg-accent-red text-white font-bold shadow-sm"
                    : "border-white/10 bg-surface/30 text-zinc-700 hover:border-white/25 hover:bg-surface/70 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3.5 w-3.5 rounded border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-white bg-white text-blue-500"
                        : "border-zinc-700 bg-zinc-900"
                    }`}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                  <span>{sz} Yrs</span>
                </div>
                <span
                  className={`text-[10px] ${
                    isSelected ? "text-white/80" : "text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
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
          Kids Collection · {isLoading ? "Fetching..." : `${filtered.length} items`}
        </div>
        <h1 className="mt-6 font-display text-6xl font-bold tracking-[-0.06em] md:text-9xl">
          Kids Wear
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Artisanal craftsmanship reimagined for young originals. Premium comfort, breathable fabrics, and enduring embroidery.
        </p>

        {selectedSizes.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
              Active Age Filter:
            </span>
            {selectedSizes.map((sz) => (
              <span
                key={sz}
                className="inline-flex items-center gap-1.5 rounded-full border border-accent-red/30 bg-accent-red/10 px-3 py-1 text-[11px] font-semibold text-white"
              >
                {sz} Years
                <button
                  onClick={() => toggleSize(sz)}
                  className="hover:text-accent-red transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearSizes}
              className="text-[10px] font-bold uppercase tracking-wider text-accent-red hover:underline ml-2"
            >
              Clear
            </button>
          </div>
        )}
      </motion.div>

      <div className="grid gap-16 md:grid-cols-12">
        {/* Sidebar Filter - Age Size Only */}
        <aside className="hidden md:col-span-3 md:block">
          <div className="sticky top-32 rounded-xl border border-white/5 bg-surface/20 p-6 backdrop-blur-sm">
            {Filters}
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="md:col-span-9">
          <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-8">
            <button
              onClick={() => setDrawer(true)}
              className="flex items-center gap-3 border border-white/10 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white/5 md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filter Age Size
              {selectedSizes.length > 0 && ` (${selectedSizes.length})`}
            </button>
            <div className="hidden text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground md:block">
              {isLoading ? "Fetching collection..." : `Showing ${filtered.length} results`}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none border border-white/10 bg-transparent pl-6 pr-12 py-3 text-[10px] font-bold uppercase tracking-[0.3em] outline-none focus:border-accent-red transition-colors cursor-pointer"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="asc">Price: Low to High</option>
                  <option value="desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
              </div>

              <div className="hidden items-center border border-white/10 md:flex">
                <button
                  onClick={() => setGrid(true)}
                  className={`p-3 transition-colors ${grid ? "bg-foreground text-background" : "hover:bg-white/5"}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setGrid(false)}
                  className={`p-3 transition-colors ${!grid ? "bg-foreground text-background" : "hover:bg-white/5"}`}
                  aria-label="List view"
                >
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
            <div className="py-32 text-center rounded-xl border border-dashed border-white/10 bg-surface/10 p-12">
              <div className="font-display text-2xl text-muted-foreground">
                No kids wear pieces found for {selectedSizes.length > 0 ? "the selected size(s)" : "this section"}.
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Try selecting different age sizes or clear your filters to view all pieces.
              </p>
              {selectedSizes.length > 0 && (
                <button
                  onClick={clearSizes}
                  className="mt-8 text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red underline underline-offset-8"
                >
                  Show all kids wear
                </button>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-24 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="mr-2 border border-white/5 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.4em] transition-all hover:bg-white/5 disabled:opacity-50 disabled:pointer-events-none"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-12 w-12 border text-[10px] font-bold transition-all ${
                    n === page
                      ? "border-accent-red bg-accent-red text-white"
                      : "border-white/5 hover:border-white/20"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="ml-2 border border-white/5 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.4em] transition-all hover:bg-white/5 disabled:opacity-50 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
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
              <div className="text-[11px] font-bold uppercase tracking-[0.4em]">
                Filter Age Sizes
              </div>
              <button onClick={() => setDrawer(false)} className="p-2">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="h-[calc(100%-6rem)] overflow-y-auto p-8">{Filters}</div>
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-background p-6">
              <button
                onClick={() => setDrawer(false)}
                className="w-full bg-foreground py-5 text-[11px] font-bold uppercase tracking-[0.4em] text-background"
              >
                Show {filtered.length} items
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function KidsWearPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-32 text-center flex flex-col items-center justify-center">
          <div className="h-12 w-12 animate-spin border-2 border-accent-red border-t-transparent rounded-full mb-6" />
          <div className="text-[10px] uppercase tracking-[0.4em] animate-pulse">
            Entering Kids Collection...
          </div>
        </div>
      }
    >
      <KidsWearContent />
    </React.Suspense>
  );
}
