"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0,
  });
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};
        
        const [productsRes, ordersRes] = await Promise.all([
          fetch(`${API_URL}/products`, { headers }),
          fetch(`${API_URL}/orders`, { headers })
        ]);
        
        if (productsRes.status === 401 || ordersRes.status === 401) {
          localStorage.removeItem("admin_token");
          document.cookie = "__admin_token_client=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
          router.replace("/admin/login");
          return;
        }

        if (!productsRes.ok || !ordersRes.ok) {
          throw new Error(`Failed to fetch stats: products: ${productsRes.status}, orders: ${ordersRes.status}`);
        }
        
        const products = await productsRes.json();
        const orders = await ordersRes.json();
        
        if (!Array.isArray(products) || !Array.isArray(orders)) {
          throw new Error("API response is not in array format");
        }
        
        const revenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
        
        setStats({
          revenue,
          orders: orders.length,
          products: products.length,
          customers: new Set(orders.map(o => o.email)).size,
        });
        
        setRecentSales(orders.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, [router]);

  const statCards = [
    {
      title: "Total Revenue",
      value: formatPrice(stats.revenue),
      change: "+12.5%",
      positive: true,
      icon: TrendingUp,
    },
    {
      title: "Total Orders",
      value: stats.orders,
      change: "+8.2%",
      positive: true,
      icon: ShoppingCart,
    },
    {
      title: "Active Products",
      value: stats.products,
      change: "0%",
      positive: true,
      icon: Package,
    },
    {
      title: "Active Customers",
      value: stats.customers,
      change: "+24.1%",
      positive: true,
      icon: Users,
    },
  ];

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
              {[
                { name: "Matsuri Tee - Onyx", stock: 4 },
                { name: "Tsuki Hoodie - Smoke", stock: 2 },
                { name: "Ryujin Tee - Bone", stock: 0 },
              ].map((item) => (
                <div key={item.name} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className={`text-xs ${item.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                      {item.stock === 0 ? 'Out of stock' : `${item.stock} units remaining`}
                    </p>
                  </div>
                  <button className="text-[10px] font-bold text-white uppercase tracking-widest bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">
                    Restock
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
