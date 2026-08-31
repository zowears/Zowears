"use client";

import React from "react";

export function ProductSkeleton() {
  return (
    <div className="group animate-pulse">
      {/* Image Skeleton Box */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white/5 border border-white/5 shadow-sm">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        
        {/* Top left badge skeleton */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          <div className="h-4 w-14 rounded-sm bg-white/10" />
        </div>

        {/* Top right view badge skeleton */}
        <div className="absolute right-3 top-3 z-10 h-4 w-10 rounded-full bg-white/10" />
      </div>

      {/* Info Skeleton Below Image */}
      <div className="mt-4 px-0.5 space-y-2.5">
        {/* Product Title Skeleton */}
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/5" />

        {/* Price Skeleton */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-5 w-20 rounded bg-white/10" />
          <div className="h-4 w-14 rounded bg-white/5" />
          <div className="h-4 w-12 rounded bg-white/10" />
        </div>

        {/* Color Dots Skeleton */}
        <div className="flex items-center gap-1.5 pt-1">
          <div className="h-3 w-3 rounded-full bg-white/10" />
          <div className="h-3 w-3 rounded-full bg-white/10" />
          <div className="h-3 w-3 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}
