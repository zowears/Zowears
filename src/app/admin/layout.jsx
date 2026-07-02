"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  ChevronRight,
  LogOut,
  User,
  Scissors,
  Loader2
} from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setAuthorized(true);
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/login");
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  const handleLogout = async () => {
    localStorage.removeItem("admin_token");
    document.cookie = "__admin_token_client=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    try {
      await fetch(`${API_URL}/admin/logout`, { method: "POST" });
    } catch (err) {
      console.error("Logout request to backend failed:", err);
    }

    router.replace("/admin/login");
  };

  // Login page renders without the dashboard chrome
  if (pathname === "/admin/login") return <>{children}</>;

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/admin" },
    { name: "Products", icon: Package, href: "/admin/products" },
    { name: "Designs", icon: Scissors, href: "/admin/designs" },
    { name: "Orders", icon: ShoppingCart, href: "/admin/orders" },
    { name: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505] text-[#e0e0e0]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1a1a1a] bg-[#0a0a0a] flex flex-col fixed h-full z-50">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
              <span className="text-black font-bold text-xl">Z</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white uppercase">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                  {item.name}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1a1a1a] mt-auto">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Administrator</p>
              <p className="text-[10px] text-zinc-500">admin@zowers.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Management</h1>
            <p className="text-sm text-zinc-500">Welcome back, manager.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-[#111] border border-zinc-800 rounded-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">System Live</span>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
