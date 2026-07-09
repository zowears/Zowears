"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle,
  Loader2,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/products";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const token = localStorage.getItem("admin_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/orders`, { headers });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      // Handle both paginated response format { data, pagination } and array format
      return Array.isArray(data) ? data : (data.data || []);
    },
  });

  const orders = ordersData;

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const token = localStorage.getItem("admin_token");
      const headers = { 
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };
      const res = await fetch(`${API_URL}/orders/${id}`, { 
        method: "PATCH",
        headers,
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated");
    },
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'processing': return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'shipped': return <Truck className="w-3 h-3" />;
      case 'delivered': return <CheckCircle className="w-3 h-3" />;
      case 'cancelled': return <AlertCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'shipped': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const filteredOrders = orders?.filter(o => 
    o._id?.toLowerCase().includes(search.toLowerCase()) || 
    o.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search orders (ID, email)..."
            className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-zinc-500 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-zinc-500 uppercase tracking-widest">Loading orders...</p>
                  </td>
                </tr>
              ) : filteredOrders?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <ShoppingCart className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500 uppercase tracking-widest">No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders?.map((order) => (
                  <tr key={order._id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-white">{order._id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white">{order.customerName || 'N/A'}</p>
                      <p className="text-[10px] text-zinc-500">{order.email || 'no-email@zowers.com'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-white">{formatPrice(order.totalAmount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select 
                          className="bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase tracking-widest p-1.5 rounded outline-none focus:border-white/20 transition-all text-white"
                          value={order.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: order._id, status: e.target.value })}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
