"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  AlertCircle,
  Eye,
  Download,
  Filter,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// KPI Card Component
const KPICard = ({ title, value, icon: Icon, trend, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 border-blue-200",
    green: "from-green-50 to-green-100 border-green-200",
    red: "from-red-50 to-red-100 border-red-200",
    purple: "from-purple-50 to-purple-100 border-purple-200",
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-lg p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className="bg-white rounded-lg p-3">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
      </div>
    </div>
  );
};

// Recent Orders Table
const RecentOrdersTable = ({ orders, isLoading }) => {
  if (isLoading) {
    return <div className="p-8 text-center">Loading orders...</div>;
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-mono text-gray-600">
                #{order._id.slice(-8).toUpperCase()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{order.customerName}</td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                Rs. {order.totalAmount.toLocaleString()}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    {
                      pending: "bg-yellow-100 text-yellow-800",
                      confirmed: "bg-blue-100 text-blue-800",
                      processing: "bg-purple-100 text-purple-800",
                      shipped: "bg-indigo-100 text-indigo-800",
                      delivered: "bg-green-100 text-green-800",
                      cancelled: "bg-red-100 text-red-800",
                      refunded: "bg-gray-100 text-gray-800",
                    }[order.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Low Stock Products
const LowStockAlert = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-800 text-sm font-medium">
          ✓ All products are well-stocked
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((product) => (
        <div key={product._id} className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-900">{product.name}</p>
            <p className="text-xs text-red-700">
              {product.stock} of {product.lowStockThreshold} threshold
            </p>
          </div>
          <AlertCircle className="w-4 h-4 text-red-600" />
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch KPI data
  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/dashboard/kpis`, { headers });
      if (!res.ok) throw new Error("Failed to fetch KPIs");
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Real-time business metrics</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Revenue"
            value={kpiData ? formatCurrency(kpiData.topStats?.totalRevenue || 0) : "Loading..."}
            icon={TrendingUp}
            color="green"
          />
          <KPICard
            title="Total Orders"
            value={kpiData?.topStats?.totalOrders || 0}
            icon={Package}
            color="blue"
          />
          <KPICard
            title="Total Customers"
            value={kpiData?.topStats?.customerCount || 0}
            icon={Users}
            color="purple"
          />
          <KPICard
            title="Low Stock Items"
            value={kpiData?.topStats?.lowStockCount || 0}
            icon={AlertCircle}
            color="red"
          />
        </div>

        {/* Order Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status Breakdown</h2>
            <div className="grid grid-cols-4 gap-4">
              {kpiData &&
                Object.entries(kpiData.orderStats || {}).map(([status, count]) => (
                  <div
                    key={status}
                    className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition"
                  >
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-xs font-medium text-gray-600 mt-1 capitalize">
                      {status}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alert</h2>
            <LowStockAlert products={kpiData?.lowStockProducts || []} />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <RecentOrdersTable 
            orders={kpiData?.recentOrders || []} 
            isLoading={kpiLoading}
          />
        </div>
      </div>
    </div>
  );
}
