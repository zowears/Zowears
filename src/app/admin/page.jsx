"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { formatPrice } from "@/lib/products";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminOverview() {
  const router = useRouter();

  const { data: kpiData, isLoading } = useQuery({
    queryKey: ["admin-kpis"],
    queryFn: async () => {
      const token = localStorage.getItem("admin_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      
      const res = await fetch(`${API_URL}/dashboard/kpis`, { headers });
      
      if (res.status === 401) {
        localStorage.removeItem("admin_token");
        document.cookie = "__admin_token_client=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        router.replace("/admin/login");
        throw new Error("Unauthorized");
      }

      if (!res.ok) {
        throw new Error("Failed to fetch KPIs");
      }
      
      return res.json();
    }
  });

  const revenue = kpiData?.revenue || 0;
  const totalOrders = kpiData?.totalOrders || 0;
  const totalProducts = kpiData?.totalProducts || 0;
  const totalCustomers = kpiData?.totalCustomers || 0;
  const recentSales = kpiData?.recentOrders || [];
  const lowStockProducts = kpiData?.lowStockProducts || [];

  const statCards = [
    {
      title: "Total Revenue",
      value: formatPrice(revenue),
      change: "+12.5%",
      positive: true,
      icon: TrendingUp,
    },
    {
      title: "Total Orders",
      value: totalOrders,
      change: "+8.2%",
      positive: true,
      icon: ShoppingCart,
    },
    {
      title: "Active Products",
      value: totalProducts,
      change: "0%",
      positive: true,
      icon: Package,
    },
    {
      title: "Active Customers",
      value: totalCustomers,
      change: "+24.1%",
      positive: true,
      icon: Users,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Clock className="w-8 h-8 text-zinc-500 animate-spin" />
        <p className="text-sm text-zinc-500 uppercase tracking-widest">Loading dashboard overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333] transition-all group overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors uppercase tracking-widest">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-medium flex items-center ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
                <span className="text-[10px] text-zinc-600 uppercase">vs last month</span>
              </div>
            </CardContent>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/[0.02] pointer-events-none"></div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Recent Sales</CardTitle>
                <CardDescription className="text-zinc-500">Latest transactions from your store.</CardDescription>
              </div>
              <button className="text-xs text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors uppercase tracking-widest font-bold">
                View All
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentSales.map((order) => (
                <div key={order._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <Users className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{order.customerName}</p>
                      <p className="text-xs text-zinc-500">{order.email} · {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatPrice(order.totalAmount)}</p>
                    <p className={`text-[10px] uppercase font-bold tracking-widest ${order.status === 'delivered' ? 'text-green-500' : 'text-amber-500'}`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
              {recentSales.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-zinc-600 uppercase tracking-widest">No recent sales</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader>
            <CardTitle className="text-white">Inventory Alerts</CardTitle>
            <CardDescription className="text-zinc-500">Products running low on stock.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((item) => (
                <div key={item._id} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className={`text-xs ${item.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                      {item.stock === 0 ? 'Out of stock' : `${item.stock} units remaining`}
                    </p>
                  </div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    SKU: {item.sku || 'N/A'}
                  </div>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-zinc-600 uppercase tracking-widest">All products well-stocked</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
