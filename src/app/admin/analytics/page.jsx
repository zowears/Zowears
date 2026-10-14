"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Eye,
  TrendingUp,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  Compass,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Monitor,
  Flame,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { formatPrice } from "@/lib/products";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AnalyticsDashboard() {
  const [range, setRange] = React.useState("7d");
  const [autoRefresh, setAutoRefresh] = React.useState(true);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-analytics", range],
    queryFn: async () => {
      const token = localStorage.getItem("admin_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${API_URL}/analytics/stats?range=${range}`, { headers });

      if (res.status === 401) {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
        throw new Error("Unauthorized");
      }

      if (!res.ok) {
        throw new Error("Failed to fetch analytics");
      }

      return res.json();
    },
    refetchInterval: autoRefresh ? 20000 : false, // Auto refresh every 20s for live data
  });

  const kpis = data?.kpis || {
    totalSessions: 0,
    uniqueVisitors: 0,
    liveVisitors: 0,
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    abandonedRate: 0,
    abandonedCount: 0,
  };

  const funnel = data?.funnel || [];
  const trafficSources = data?.trafficSources || [];
  const topProducts = data?.topViewedProducts || [];
  const abandonedCarts = data?.abandonedCarts || [];
  const timeline = data?.timeline || [];

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Top Control Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase font-display">
              Store Analytics
            </h1>
            {/* Live Visitors Beacon */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{kpis.liveVisitors} Live Now</span>
            </div>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Shopify-level real-time traffic, full-funnel attribution, and Meta CAPI telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range switcher */}
          <div className="flex rounded-lg bg-zinc-900 border border-zinc-800 p-1">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "all", label: "All Time" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRange(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  range === tab.id
                    ? "bg-white text-black font-semibold shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-white" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─── Executive KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Sessions */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase tracking-wider">Total Sessions</span>
            <Users className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white font-mono">
            {kpis.totalSessions.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">All store visits</p>
        </div>

        {/* Unique Visitors */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase tracking-wider">Unique Visitors</span>
            <Eye className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white font-mono">
            {kpis.uniqueVisitors.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">De-duplicated visitors</p>
        </div>

        {/* Live Active */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-emerald-900/40 backdrop-blur-sm">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-mono uppercase tracking-wider">Live Active</span>
            <Flame className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-400 font-mono">
            {kpis.liveVisitors}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">Active in last 5m</p>
        </div>

        {/* Conversion Rate */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase tracking-wider">Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white font-mono">
            {kpis.conversionRate}%
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">Visit to Purchase</p>
        </div>

        {/* Cart Abandonment */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase tracking-wider">Abandonment</span>
            <ShoppingCart className="w-4 h-4 text-amber-500/80" />
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-400 font-mono">
            {kpis.abandonedRate}%
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">{kpis.abandonedCount} abandoned carts</p>
        </div>

        {/* Tracked Revenue */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase tracking-wider">Tracked Revenue</span>
            <DollarSign className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white font-mono">
            {formatPrice(kpis.totalRevenue)}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">{kpis.totalOrders} total orders</p>
        </div>
      </div>

      {/* ─── eCommerce Conversion Funnel (Shopify Style) ────────────────── */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white font-display uppercase tracking-wider">
              eCommerce Funnel Drop-off
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Step-by-step conversion from discovery to completed checkout
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            {range === "today" ? "Today" : range === "7d" ? "Past 7 Days" : range === "30d" ? "Past 30 Days" : "Lifetime"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {funnel.map((step, idx) => {
            const maxCount = funnel[0]?.count || 1;
            const percentageOfTotal = maxCount > 0 ? Math.round((step.count / maxCount) * 100) : 0;

            return (
              <div
                key={step.step}
                className="relative p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                      Step 0{step.step}
                    </span>
                    {step.step > 1 && (
                      <span className="text-xs font-semibold text-emerald-400 font-mono">
                        {step.conversionFromPrev}% conv
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-1">{step.name}</h3>
                  <div className="text-2xl font-bold text-white mt-3 font-mono">
                    {step.count.toLocaleString()}
                  </div>
                </div>

                <div className="mt-6">
                  {/* Visual Progress Bar */}
                  <div className="w-full bg-zinc-800/80 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        idx === 3 ? "bg-emerald-500" : idx === 2 ? "bg-blue-500" : idx === 1 ? "bg-amber-500" : "bg-zinc-300"
                      }`}
                      style={{ width: `${percentageOfTotal}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-[11px] text-zinc-500 font-mono">
                    <span>{percentageOfTotal}% of visits</span>
                    {idx < 3 && (
                      <span className="text-red-400">
                        -{step.dropOffPercent}% drop-off
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Traffic Timeline & Sources ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visits & Revenue Timeline */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white font-display uppercase tracking-wider">
                  Traffic & Revenue Velocity
                </h2>
                <p className="text-xs text-zinc-400 mt-1">Daily visit volume and tracked conversion revenue</p>
              </div>
            </div>

            <div className="h-72 w-full mt-4">
              {timeline.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => val.slice(5)}
                    />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #3f3f46",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="visits"
                      name="Visits"
                      stroke="#ffffff"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#visitsGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue (PKR)"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#revGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                  No timeline telemetry recorded in this date range yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Traffic Sources & Attribution */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white font-display uppercase tracking-wider">
                Traffic Sources
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Attributed via UTM & Referrers</p>
            </div>
            <Compass className="w-5 h-5 text-zinc-500" />
          </div>

          <div className="space-y-3 mt-4 overflow-y-auto max-h-72 pr-1 no-scrollbar">
            {trafficSources.length > 0 ? (
              trafficSources.map((ts) => (
                <div
                  key={ts.source}
                  className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-white">{ts.source}</p>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      {ts.sessions} visits · {ts.conversions} orders ({ts.conversionRate}%)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400 font-mono">
                      {formatPrice(ts.revenue)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No external traffic source logged yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Top Viewed Products & Abandoned Carts ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Viewed Products */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white font-display uppercase tracking-wider">
                Top Viewed Silhouettes
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Most engaged products across store visits</p>
            </div>
            <Eye className="w-5 h-5 text-zinc-500" />
          </div>

          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((p) => (
                <div
                  key={p._id || p.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                >
                  <div className="relative w-12 h-14 rounded-md overflow-hidden bg-zinc-800 shrink-0">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                        Z
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      {p.category || "Streetwear"} · {formatPrice(p.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white">
                      <Eye className="w-3 h-3 text-zinc-400" />
                      {p.views || 0}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No product view data logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Abandoned Carts Recovery Stream */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white font-display uppercase tracking-wider">
                Abandoned Carts
              </h2>
              <p className="text-xs text-zinc-400 mt-1">High-intent sessions ready for remarketing</p>
            </div>
            <ShoppingCart className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-3">
            {abandonedCarts.length > 0 ? (
              abandonedCarts.map((c) => (
                <div
                  key={c.sessionId}
                  className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                      {c.device === "mobile" ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Monitor className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {c.cartItems?.length || 1} item{c.cartItems?.length !== 1 ? "s" : ""} left in cart
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        via {c.utmSource || "Direct"} · {new Date(c.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white font-mono">
                      {formatPrice(c.cartValue)}
                    </div>
                    <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                      Abandoned
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No active abandoned carts recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
