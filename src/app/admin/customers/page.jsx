"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Users, Mail, Phone, MapPin, Calendar, Clock } from "lucide-react";
import { formatPrice } from "@/lib/products";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function CustomersPage() {
  const router = useRouter();

  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const token = localStorage.getItem("admin_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/dashboard/customers`, { headers });
      
      if (res.status === 401) {
        localStorage.removeItem("admin_token");
        router.replace("/admin/login");
        throw new Error("Unauthorized");
      }

      if (!res.ok) throw new Error("Failed to fetch customers");
      return res.json();
    }
  });

  const exportToCSV = () => {
    if (!customers || customers.length === 0) return;

    const headers = ["Name", "Email", "Phone", "City", "Total Orders", "Total Spent", "Last Order Date"];
    const csvContent = [
      headers.join(","),
      ...customers.map(c => [
        `"${c.name}"`,
        `"${c.email}"`,
        `"${c.phone}"`,
        `"${c.city}"`,
        c.orderCount,
        c.totalSpent,
        `"${new Date(c.lastOrderDate).toLocaleDateString()}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `zowears_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Clock className="w-8 h-8 text-zinc-500 animate-spin" />
        <p className="text-sm text-zinc-500 uppercase tracking-widest">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-6 h-6 text-accent-red" />
            Customer Directory
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            View and export your customer contact details for marketing campaigns.
          </p>
        </div>
        <button 
          onClick={exportToCSV}
          disabled={!customers?.length}
          className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 transition-colors px-4 py-2 rounded-md font-bold uppercase tracking-widest text-xs disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-widest">
            Total Unique Customers ({customers?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] text-xs uppercase tracking-widest text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-medium border-b border-white/5">Customer</th>
                  <th className="px-6 py-4 font-medium border-b border-white/5">Contact</th>
                  <th className="px-6 py-4 font-medium border-b border-white/5">Location</th>
                  <th className="px-6 py-4 font-medium border-b border-white/5">Orders</th>
                  <th className="px-6 py-4 font-medium border-b border-white/5">Total Spent</th>
                  <th className="px-6 py-4 font-medium border-b border-white/5">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers?.map((customer) => (
                  <tr key={customer.email} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{customer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Mail className="w-3 h-3" />
                          <span className="text-xs">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Phone className="w-3 h-3" />
                          <span className="text-xs font-mono">{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs capitalize">{customer.city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-300">
                      <span className="bg-white/5 px-2 py-1 rounded text-xs font-bold">{customer.orderCount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-accent-red">
                      {formatPrice(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">{new Date(customer.lastOrderDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!customers || customers.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 uppercase tracking-widest text-xs">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
