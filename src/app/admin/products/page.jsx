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
  Star,
  Check
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
  "11/12"
];

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("apparel"); // "apparel" | "kids"
  const [sectionFilter, setSectionFilter] = useState("all"); // "all" | "apparel" | "kids"
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    productType: "apparel",
    isKidsWear: false,
    categories: [],
    fits: [],
    price: "",
    compareAt: "",
    description: "",
    stock: "0",
    badge: "",
    jp: "",
    sizes: [],
    colors: []
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const token = localStorage.getItem("admin_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/products`, { headers, cache: 'no-store' });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      return Array.isArray(data) ? data : (data.data || []);
    },
  });

  const { data: colorsData } = useQuery({
    queryKey: ["colors"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/colors`, { cache: 'no-store' });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (data.data || []);
    },
  });

  const availableColors = colorsData?.length > 0 ? colorsData : [
    { _id: "000000000000000000000001", name: "Black", hexCode: "#000000" },
    { _id: "000000000000000000000002", name: "White", hexCode: "#ffffff" },
    { _id: "000000000000000000000003", name: "Beige", hexCode: "#f5f5dc" },
    { _id: "000000000000000000000004", name: "Gray", hexCode: "#808080" }
  ];

  const products = productsData;

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setModalTab("apparel");
    setNewProduct({
      name: "",
      productType: "apparel",
      isKidsWear: false,
      categories: [],
      fits: [],
      price: "",
      compareAt: "",
      description: "",
      stock: "0",
      badge: "",
      jp: "",
      sizes: [],
      colors: []
    });
    setImageFiles([]);
    setExistingImages([]);
    setRemoveImages([]);
  };

  const handleEditClick = (product) => {
    const isKids = Boolean(product.isKidsWear || product.productType === "kids" || product.categories?.includes("Kids Wear"));
    setModalTab(isKids ? "kids" : "apparel");
    setEditingProduct(product);
    setNewProduct({
      name: product.name || "",
      productType: isKids ? "kids" : "apparel",
      isKidsWear: isKids,
      categories: product.categories || (isKids ? ["Kids Wear"] : []),
      fits: product.fits || [],
      price: product.price !== undefined ? String(product.price) : "",
      compareAt: product.compareAt || product.comparePrice ? String(product.compareAt || product.comparePrice) : "",
      description: product.description || "",
      stock: product.stock !== undefined ? String(product.stock) : "0",
      badge: product.badge || "",
      jp: product.jp || "",
      sizes: product.sizes || [],
      colors: product.colors?.map(c => ({
        colorId: c.colorId || c._id || "",
        name: c.name || "",
        hexCode: c.hexCode || "",
        sizes: c.sizes || []
      })) || []
    });

    const imgs = (product.images && product.images.length > 0)
      ? product.images.map(img => typeof img === "string" ? img : img.url)
      : (product.image ? [product.image] : []);
    
    setExistingImages(imgs);
    setRemoveImages([]);
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const token = localStorage.getItem("admin_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create product");
      }
      return res.json();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added successfully");
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      const token = localStorage.getItem("admin_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "PATCH",
        headers,
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update product");
      }
      return res.json();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
      closeModal();
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

  const updateRankMutation = useMutation({
    mutationFn: async ({ id, rank }) => {
      const token = localStorage.getItem("admin_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };
      const res = await fetch(`${API_URL}/products/${id}/rank`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ rank }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update rank");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (data.rank) {
        toast.success(`Assigned to Rank #${data.rank}`);
      } else {
        toast.success("Rank cleared");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredProducts = products?.filter((p) => {
    const isKids = Boolean(p.isKidsWear || p.productType === "kids" || p.categories?.includes("Kids Wear"));
    if (sectionFilter === "kids" && !isKids) return false;
    if (sectionFilter === "apparel" && isKids) return false;

    return (
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p._id?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setImageFiles((prev) => {
      const combined = [...prev, ...newFiles];
      const seen = new Set();
      return combined.filter((f) => {
        const key = `${f.name}-${f.size}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
    e.target.value = "";
  };

  const removeNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((imgUrl) => imgUrl !== url));
    setRemoveImages((prev) => [...prev, url]);
  };

  const handleColorToggle = (colorObj) => {
    setNewProduct((prev) => {
      const isSelected = prev.colors?.some(c => c.colorId === colorObj._id);
      if (isSelected) {
        return {
          ...prev,
          colors: prev.colors.filter(c => c.colorId !== colorObj._id)
        };
      } else {
        return {
          ...prev,
          colors: [
            ...(prev.colors || []), 
            { colorId: colorObj._id, name: colorObj.name, hexCode: colorObj.hexCode, sizes: [] }
          ]
        };
      }
    });
  };

  const handleColorSizeToggle = (colorId, size) => {
    setNewProduct((prev) => ({
      ...prev,
      colors: prev.colors.map(c => {
        if (c.colorId === colorId) {
          const hasSize = c.sizes.includes(size);
          return {
            ...c,
            sizes: hasSize ? c.sizes.filter(s => s !== size) : [...c.sizes, size]
          };
        }
        return c;
      })
    }));
  };

  const handleKidsSizeToggle = (sz) => {
    setNewProduct((prev) => {
      const currentSizes = prev.sizes || [];
      const hasSize = currentSizes.includes(sz);
      return {
        ...prev,
        sizes: hasSize ? currentSizes.filter((s) => s !== sz) : [...currentSizes, sz],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isKids = modalTab === "kids";

    if (isKids && (!newProduct.sizes || newProduct.sizes.length === 0)) {
      toast.error("Please select at least one age size for Kids Wear");
      return;
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("productType", isKids ? "kids" : "apparel");
    formData.append("isKidsWear", isKids ? "true" : "false");
    formData.append("categories", JSON.stringify(isKids ? ["Kids Wear"] : (newProduct.categories || [])));
    formData.append("fits", JSON.stringify(isKids ? [] : (newProduct.fits || [])));
    formData.append("price", newProduct.price);
    formData.append("compareAt", isKids ? "" : (newProduct.compareAt || ""));
    formData.append("comparePrice", isKids ? "" : (newProduct.compareAt || ""));
    formData.append("description", newProduct.description || "");
    formData.append("stock", newProduct.stock || "100");
    formData.append("badge", isKids ? "" : (newProduct.badge || ""));
    formData.append("jp", isKids ? "" : (newProduct.jp || ""));
    formData.append("colors", JSON.stringify(isKids ? [] : (newProduct.colors || [])));
    formData.append("sizes", JSON.stringify(isKids ? (newProduct.sizes || []) : []));
    
    imageFiles.forEach((file) => formData.append("images", file));
    if (removeImages.length > 0) {
      formData.append("removeImages", JSON.stringify(removeImages));
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Top 10 Pinned Products Section */}
      <div className="bg-[#0a0a0a] border border-amber-500/30 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-black font-extrabold text-xs">
              10
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Top 10 Pinned Products</h2>
              <p className="text-xs text-zinc-400">Products assigned a rank appear first in customer listings in exact order (Rank 1 to 10).</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((rankNum) => {
            const pinnedProduct = products?.find(p => p.rank === rankNum);
            return (
              <div
                key={rankNum}
                className={`relative flex flex-col items-center justify-between rounded-lg border p-2 text-center transition-all ${
                  pinnedProduct
                    ? "border-amber-500/50 bg-amber-500/5 text-white"
                    : "border-dashed border-zinc-800 bg-zinc-900/40 text-zinc-600"
                }`}
              >
                <div className="absolute top-1 left-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black shadow">
                  {rankNum}
                </div>

                {pinnedProduct ? (
                  <div className="w-full flex flex-col items-center pt-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-zinc-900 border border-zinc-800">
                      {(pinnedProduct.image || pinnedProduct.images?.[0]?.url || pinnedProduct.images?.[0]) ? (
                        <Image
                          src={pinnedProduct.image || (typeof pinnedProduct.images?.[0] === 'string' ? pinnedProduct.images[0] : pinnedProduct.images?.[0]?.url) || "/placeholder.png"}
                          alt={pinnedProduct.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[9px]">No img</div>
                      )}
                    </div>
                    <p className="mt-1.5 w-full truncate text-[11px] font-medium text-white px-1" title={pinnedProduct.name}>
                      {pinnedProduct.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => updateRankMutation.mutate({ id: pinnedProduct._id || pinnedProduct.id, rank: null })}
                      className="mt-1 flex items-center gap-0.5 text-[9px] font-semibold text-red-400 hover:text-red-300 hover:underline"
                      title="Clear Rank"
                    >
                      <X className="h-3 w-3" /> Unpin
                    </button>
                  </div>
                ) : (
                  <div className="py-5">
                    <span className="text-[10px] font-medium text-zinc-600">Empty</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
            <button
              onClick={() => setSectionFilter("all")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                sectionFilter === "all"
                  ? "bg-white text-black font-bold shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({products?.length || 0})
            </button>
            <button
              onClick={() => setSectionFilter("apparel")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                sectionFilter === "apparel"
                  ? "bg-white text-black font-bold shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Apparel ({products?.filter(p => !p.isKidsWear && p.productType !== "kids" && !p.categories?.includes("Kids Wear")).length || 0})
            </button>
            <button
              onClick={() => setSectionFilter("kids")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                sectionFilter === "kids"
                  ? "bg-accent-red text-white font-bold shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Kids Wear ({products?.filter(p => p.isKidsWear || p.productType === "kids" || p.categories?.includes("Kids Wear")).length || 0})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setEditingProduct(null);
              setModalTab("apparel");
              setNewProduct({ name: "", productType: "apparel", isKidsWear: false, categories: [], fits: [], price: "", compareAt: "", description: "", stock: "0", badge: "", jp: "", sizes: [], colors: [] });
              setImageFiles([]);
              setExistingImages([]);
              setRemoveImages([]);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Apparel
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setModalTab("kids");
              setNewProduct({ name: "", productType: "kids", isKidsWear: true, categories: ["Kids Wear"], fits: [], price: "", compareAt: "", description: "", stock: "100", badge: "", jp: "", sizes: [], colors: [] });
              setImageFiles([]);
              setExistingImages([]);
              setRemoveImages([]);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-accent-red text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Kids Product
          </button>
        </div>
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
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rank (Top 10)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-zinc-500 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-zinc-500 uppercase tracking-widest">Loading products...</p>
                  </td>
                </tr>
              ) : filteredProducts?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Package className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500 uppercase tracking-widest">No products found</p>
                  </td>
                </tr>
              ) : (
                filteredProducts?.map((product) => {
                  const isProductKids = Boolean(product.isKidsWear || product.productType === "kids" || product.categories?.includes("Kids Wear"));
                  return (
                  <tr key={product._id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden relative">
                          {(product.image || product.images?.[0]?.url || product.images?.[0]) ? (
                            <Image 
                              src={product.image || (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url) || "/placeholder.png"} 
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">No img</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{product.name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{product._id}</p>
                          {product.fits?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.fits.map(fit => (
                                <span key={fit} className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                                  {fit}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isProductKids ? (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent-red/10 border border-accent-red/30 text-accent-red">
                            Kids Wear
                          </span>
                          {product.sizes?.length > 0 && (
                            <span className="text-[9px] text-zinc-400 font-mono">
                              Sizes: {product.sizes.join(", ")}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 uppercase tracking-wider">{product.categories?.join(" / ")}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-white">{formatPrice(product.price)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={product.rank || "none"}
                          onChange={(e) => {
                            const val = e.target.value === "none" ? null : parseInt(e.target.value, 10);
                            updateRankMutation.mutate({ id: product._id || product.id, rank: val });
                          }}
                          className={`text-xs rounded-lg px-2.5 py-1.5 font-medium border transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500/50 ${
                            product.rank 
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold" 
                              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          <option value="none">None</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
                            <option key={r} value={r}>
                              Rank #{r}
                            </option>
                          ))}
                        </select>
                        {product.rank && (
                          <button
                            onClick={() => updateRankMutation.mutate({ id: product._id || product.id, rank: null })}
                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Clear Rank"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this product?")) {
                              deleteMutation.mutate(product._id);
                            }
                          }}
                          className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal (Create or Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-[#0a0a0a] border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {editingProduct
                    ? (modalTab === "kids" ? "Edit Kids Wear Product" : "Edit Apparel Product")
                    : (modalTab === "kids" ? "Add Kids Wear Product" : "Add New Apparel Product")}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {modalTab === "kids"
                    ? "Dedicated Kids Collection product form"
                    : "Standard adult streetwear product form"}
                </p>
              </div>
              <button onClick={closeModal} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle / Tabs at top of Add Product modal */}
            <div className="grid grid-cols-2 p-1 mx-6 mt-4 bg-zinc-900 rounded-lg border border-zinc-800 gap-1">
              <button
                type="button"
                onClick={() => setModalTab("apparel")}
                className={`py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2 ${
                  modalTab === "apparel"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Apparel
              </button>
              <button
                type="button"
                onClick={() => setModalTab("kids")}
                className={`py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2 ${
                  modalTab === "kids"
                    ? "bg-accent-red text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Kids Wear
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto custom-scrollbar">
              {modalTab === "kids" ? (
                /* ================= KIDS WEAR FORM ONLY ================= */
                /* ONLY: Product Name, Sizes, Price, Details, Images */
                <div className="space-y-4">
                  {/* 1. PRODUCT NAME (text input) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Product Name <span className="text-accent-red">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-red"
                      placeholder="e.g. Kids Embroidered Drop Hoodie"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>

                  {/* 2. SIZES (checkbox group: 2/3, 3/4, 4/5, 5/6, 6/7, 7/8, 8/9, 9/10, 10/11, 11/12) */}
                  <div className="space-y-2 border border-zinc-800 p-4 rounded-lg bg-zinc-900/50">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Sizes (Age in Years) <span className="text-accent-red">*</span>
                      </label>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {newProduct.sizes?.length || 0} selected
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                      {KIDS_SIZES.map((sz) => {
                        const isChecked = newProduct.sizes?.includes(sz);
                        return (
                          <label
                            key={sz}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                              isChecked
                                ? "border-accent-red bg-accent-red/10 text-white shadow-sm"
                                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-white"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleKidsSizeToggle(sz)}
                              className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-accent-red focus:ring-accent-red/20 accent-accent-red"
                            />
                            <span className="text-xs font-semibold">{sz}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. PRICE (Rs.) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Price (Rs.) <span className="text-accent-red">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-red"
                      placeholder="e.g. 2499"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                  </div>

                  {/* 4. DETAILS (description text field) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Details / Description
                    </label>
                    <textarea
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-red min-h-[90px]"
                      placeholder="Describe the kids product details, fabric, fit..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>

                  {/* 5. IMAGES (upload, multiple images supported same as other products) */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Product Images</label>
                      {(existingImages.length > 0 || imageFiles.length > 0) && (
                        <span className="text-[10px] text-zinc-500">{existingImages.length + imageFiles.length} total image(s)</span>
                      )}
                    </div>

                    {/* Existing Images (When Editing) */}
                    {existingImages.length > 0 && (
                      <div className="space-y-1 mb-2">
                        <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Existing Images:</span>
                        <div className="grid grid-cols-4 gap-2">
                          {existingImages.map((url, idx) => (
                            <div key={idx} className="relative group/img aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                              <img src={url} alt={`Existing ${idx}`} className="w-full h-full object-cover" />
                              {idx === 0 && (
                                <div className="absolute top-1 left-1 bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                                  Primary
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => removeExistingImage(url)}
                                className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                title="Remove image"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload zone for new images */}
                    <label className="relative group cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                      <div className="w-full h-20 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1 group-hover:border-zinc-600 group-hover:bg-zinc-900/80 transition-all bg-zinc-900/50">
                        <Upload className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">Click to upload new images</span>
                      </div>
                    </label>

                    {/* Previews of newly selected files */}
                    {imageFiles.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] text-zinc-400 uppercase tracking-wider">New Images to Upload:</span>
                        <div className="grid grid-cols-4 gap-2">
                          {imageFiles.map((file, i) => {
                            const url = URL.createObjectURL(file);
                            return (
                              <div key={i} className="relative group/img aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                                <img src={url} alt={file.name} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeNewImage(i)}
                                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ================= ADULT APPAREL FORM ================= */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2 mt-2 border border-zinc-800 p-3 rounded-lg bg-zinc-900/50">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Categories</label>
                      <div className="flex flex-wrap gap-4">
                        {[
                          "T-Shirts", "Hoodies", "Zipper Hoodies", "Sweatshirts",
                          "Denim Jackets", "Plain Tee & Hoodies", "Special for Girls", "Designs"
                        ].map(cat => (
                          <label key={cat} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newProduct.categories?.includes(cat)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewProduct({ ...newProduct, categories: [...(newProduct.categories || []), cat] });
                                } else {
                                  setNewProduct({ ...newProduct, categories: (newProduct.categories || []).filter(c => c !== cat) });
                                }
                              }}
                              className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-white focus:ring-white/20"
                            />
                            <span className="text-sm text-zinc-300">{cat}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Available Fits / Sub Category Options */}
                    {!(newProduct.categories?.includes("Denim Jackets") && !["T-Shirts", "Hoodies", "Zipper Hoodies", "Sweatshirts"].some(c => newProduct.categories?.includes(c))) && (
                      <div className="space-y-2 col-span-2 mt-2 p-3 border border-zinc-800 rounded-lg bg-zinc-900/50">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Available Fits / Styles</label>
                          <span className="text-[9px] text-zinc-500">Selecting Drop Shoulder adds +Rs. 200</span>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {["Regular Fit", "Drop Shoulder", "Oversized"].map(fit => (
                            <label key={fit} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newProduct.fits?.includes(fit)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewProduct({ ...newProduct, fits: [...(newProduct.fits || []), fit] });
                                  } else {
                                    setNewProduct({ ...newProduct, fits: (newProduct.fits || []).filter(f => f !== fit) });
                                  }
                                }}
                                className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-white focus:ring-white/20"
                              />
                              <span className="text-sm text-zinc-300">{fit}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  {/* Colors and Sizes per Color */}
                  <div className="space-y-4 pt-2 border-t border-zinc-800">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Available Colors</label>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color) => {
                        const isSelected = newProduct.colors?.some(c => c.colorId === color._id);
                        return (
                          <button
                            key={color._id}
                            type="button"
                            onClick={() => handleColorToggle(color)}
                            className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                              isSelected
                                ? "border-accent-red bg-accent-red/10 text-white"
                                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white"
                            }`}
                          >
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-white/20"
                              style={{ backgroundColor: color.hexCode }}
                            />
                            <span className="text-xs font-medium">{color.name}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-accent-red" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {newProduct.colors?.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Sizes for Each Color</label>
                        <div className="grid grid-cols-1 gap-3">
                          {newProduct.colors.map(selectedColor => (
                            <div key={selectedColor.colorId} className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full border border-white/20"
                                  style={{ backgroundColor: selectedColor.hexCode }}
                                />
                                <span className="text-sm font-semibold text-white">{selectedColor.name}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {["S", "M", "L", "XL", "XXL"].map((size) => {
                                  const hasSize = selectedColor.sizes?.includes(size);
                                  return (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => handleColorSizeToggle(selectedColor.colorId, size)}
                                      className={`px-3 py-1 text-xs rounded-md border transition-all font-medium ${
                                        hasSize
                                          ? "border-accent-red bg-accent-red text-white"
                                          : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white"
                                      }`}
                                    >
                                      {size}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Images */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Product Images</label>
                      {(existingImages.length > 0 || imageFiles.length > 0) && (
                        <span className="text-[10px] text-zinc-500">{existingImages.length + imageFiles.length} total image(s)</span>
                      )}
                    </div>

                    {/* Existing Images (When Editing) */}
                    {existingImages.length > 0 && (
                      <div className="space-y-1 mb-2">
                        <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Existing Images:</span>
                        <div className="grid grid-cols-4 gap-2">
                          {existingImages.map((url, idx) => (
                            <div key={idx} className="relative group/img aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                              <img src={url} alt={`Existing ${idx}`} className="w-full h-full object-cover" />
                              {idx === 0 && (
                                <div className="absolute top-1 left-1 bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                                  Primary
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => removeExistingImage(url)}
                                className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                title="Remove image"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload zone for new images */}
                    <label className="relative group cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                      <div className="w-full h-20 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1 group-hover:border-zinc-600 group-hover:bg-zinc-900/80 transition-all bg-zinc-900/50">
                        <Upload className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">Click to upload new images</span>
                      </div>
                    </label>

                    {/* Previews of newly selected files */}
                    {imageFiles.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] text-zinc-400 uppercase tracking-wider">New Images to Upload:</span>
                        <div className="grid grid-cols-4 gap-2">
                          {imageFiles.map((file, i) => {
                            const url = URL.createObjectURL(file);
                            return (
                              <div key={i} className="relative group/img aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                                <img src={url} alt={file.name} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeNewImage(i)}
                                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Description</label>
                    <textarea
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 min-h-[90px]"
                      placeholder="Describe the product details..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-zinc-800 rounded-lg text-sm font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    modalTab === "kids"
                      ? "bg-accent-red text-white hover:bg-red-700"
                      : "bg-white text-black hover:bg-zinc-200"
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingProduct ? (
                    "Save Changes"
                  ) : modalTab === "kids" ? (
                    "Create Kids Product"
                  ) : (
                    "Create Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
