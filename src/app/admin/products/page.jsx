"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@/lib/products";
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Loader2,
  X,
  Upload,
  Star
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "t-shirts",
    price: "",
    compareAt: "",
    description: "",
    stock: "0",
    badge: "",
    jp: ""
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const token = localStorage.getItem("admin_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/products`, { headers });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      // Handle both paginated response format { data, pagination } and array format
      return Array.isArray(data) ? data : (data.data || []);
    },
  });

  const products = productsData;

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const token = localStorage.getItem("admin_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers,
        body: formData, // FormData handles multipart/form-data automatically
      });
      if (!res.ok) throw new Error("Failed to create product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added successfully");
      setIsModalOpen(false);
      setNewProduct({ name: "", category: "t-shirts", price: "", compareAt: "", description: "", stock: "0", badge: "", jp: "" });
      setImageFiles([]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("admin_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/products/${id}`, { 
        method: "DELETE",
        headers
      });
      if (!res.ok) throw new Error("Failed to delete product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, isFeatured }) => {
      const token = localStorage.getItem("admin_token");
      const headers = { 
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ isFeatured }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Featured status updated");
    },
  });

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p._id?.toLowerCase().includes(search.toLowerCase())
  );

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setImageFiles((prev) => {
      const combined = [...prev, ...newFiles];
      // deduplicate by name+size
      const seen = new Set();
      return combined.filter((f) => {
        const key = `${f.name}-${f.size}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
    // reset input so same file can be re-added after removal
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("category", newProduct.category);
    formData.append("price", newProduct.price);
    formData.append("compareAt", newProduct.compareAt || "");
    formData.append("description", newProduct.description);
    formData.append("stock", newProduct.stock);
    formData.append("badge", newProduct.badge || "");
    formData.append("jp", newProduct.jp || "");
    imageFiles.forEach((file) => formData.append("images", file));
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Product List Table */}
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-zinc-500 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-zinc-500 uppercase tracking-widest">Loading products...</p>
                  </td>
                </tr>
              ) : filteredProducts?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <Package className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500 uppercase tracking-widest">No products found</p>
                  </td>
                </tr>
              ) : (
                filteredProducts?.map((product) => (
                  <tr key={product._id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden relative">
                          {product.image && (
                            <Image 
                              src={product.image || "/placeholder.png"} 
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{product.name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{product._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-400 uppercase tracking-wider">{product.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-white">{formatPrice(product.price)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleFeaturedMutation.mutate({ id: product._id, isFeatured: !product.isFeatured })}
                          className={`p-2 rounded-lg transition-all ${product.isFeatured ? 'text-amber-500 bg-amber-500/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                          title={product.isFeatured ? "Unfeature" : "Feature for Trending"}
                        >
                          <Star className={`w-4 h-4 ${product.isFeatured ? 'fill-current' : ''}`} />
                        </button>
                        <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this product?")) {
                              deleteMutation.mutate(product._id);
                            }
                          }}
                          className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-[#0a0a0a] border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white tracking-tight">Add New Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Product Name</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    placeholder="e.g. Kyoto Oversized Tee"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Japanese Text (Aesthetic)</label>
                  <input
                    type="text"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    placeholder="e.g. 新作"
                    value={newProduct.jp}
                    onChange={(e) => setNewProduct({ ...newProduct, jp: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Category</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    <option value="t-shirts">T-shirts</option>
                    <option value="hoodies">Hoodies</option>
                    <option value="sweatshirts">Sweatshirts</option>
                    <option value="plain-tees">Plain Tees</option>
                    <option value="embroidered">Embroidered</option>
                    <option value="anime">Anime</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Price (Rs.)</label>
                  <input
                    required
                    type="number"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    placeholder="1899"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Compare At Price (Rs.)</label>
                  <input
                    type="number"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    placeholder="e.g. 2499"
                    value={newProduct.compareAt}
                    onChange={(e) => setNewProduct({ ...newProduct, compareAt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Stock Qty</label>
                  <input
                    required
                    type="number"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    placeholder="100"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Badge</label>
                <input
                  type="text"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                  placeholder="e.g. Limited Edition, Sale"
                  value={newProduct.badge}
                  onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Product Images</label>
                  {imageFiles.length > 0 && (
                    <span className="text-[10px] text-zinc-500">{imageFiles.length} selected</span>
                  )}
                </div>

                {/* Upload zone */}
                <label className="relative group cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                  <div className="w-full h-24 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-2 group-hover:border-zinc-600 group-hover:bg-zinc-900/80 transition-all bg-zinc-900/50">
                    <Upload className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">Click to add images (multiple allowed)</span>
                  </div>
                </label>

                {/* Previews */}
                {imageFiles.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {imageFiles.map((file, i) => {
                      const url = URL.createObjectURL(file);
                      return (
                        <div key={i} className="relative group/img aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                          <img src={url} alt={file.name} className="w-full h-full object-cover" />
                          {i === 0 && (
                            <div className="absolute top-1 left-1 bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                              Cover
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Description</label>
                <textarea
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 min-h-[100px]"
                  placeholder="Describe the product details..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-zinc-800 rounded-lg text-sm font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
