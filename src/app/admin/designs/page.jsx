"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDesignPrice } from "@/lib/designs";
import {
  Scissors,
  Plus,
  Search,
  Trash2,
  Loader2,
  X,
  Upload,
  Star,
  ExternalLink,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminDesignsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [newDesign, setNewDesign] = useState({
    name: "",
    description: "",
    price: "1",
    stitchCount: "",
    totalColors: "",
    size: "",
    designType: "Flat",
    threadType: "Polyester",
    fabricType: "All Fabrics",
    driveLink: "",
    category: "General",
  });

  const { data: designs, isLoading } = useQuery({
    queryKey: ["admin-designs"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/designs`);
      if (!res.ok) throw new Error("Failed to fetch designs");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch(`${API_URL}/designs`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to create design");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-designs"] });
      toast.success("Design added successfully");
      setIsModalOpen(false);
      setNewDesign({
        name: "",
        description: "",
        price: "1",
        stitchCount: "",
        totalColors: "",
        size: "",
        designType: "Flat",
        threadType: "Polyester",
        fabricType: "All Fabrics",
        driveLink: "",
        category: "General",
      });
      setImageFiles([]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create design");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_URL}/designs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete design");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-designs"] });
      toast.success("Design deleted successfully");
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, isFeatured }) => {
      const res = await fetch(`${API_URL}/designs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-designs"] });
      toast.success("Featured status updated");
    },
  });

  const filteredDesigns = designs?.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d._id?.toLowerCase().includes(search.toLowerCase())
  );

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setImageFiles((prev) => {
      const combined = [...prev, ...newFiles];
      const seen = new Set();
      return combined
        .filter((f) => {
          const key = `${f.name}-${f.size}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 2); // Maximum 2 images
    });
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (imageFiles.length < 2) {
      toast.error("Please upload exactly 2 images for the design");
      return;
    }
    if (!newDesign.driveLink.trim()) {
      toast.error("Please provide a Google Drive download link");
      return;
    }

    const formData = new FormData();
    formData.append("name", newDesign.name);
    formData.append("description", newDesign.description);
    formData.append("price", newDesign.price);
    formData.append("stitchCount", newDesign.stitchCount);
    formData.append("totalColors", newDesign.totalColors);
    formData.append("size", newDesign.size);
    formData.append("designType", newDesign.designType);
    formData.append("threadType", newDesign.threadType);
    formData.append("fabricType", newDesign.fabricType);
    formData.append("driveLink", newDesign.driveLink);
    formData.append("category", newDesign.category);
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
            placeholder="Search designs..."
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
          Add Design
        </button>
      </div>

      {/* Designs List Table */}
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Design
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Details
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Price
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Drive Link
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-zinc-500 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-zinc-500 uppercase tracking-widest">
                      Loading designs...
                    </p>
                  </td>
                </tr>
              ) : filteredDesigns?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Scissors className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500 uppercase tracking-widest">
                      No designs found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDesigns?.map((design) => (
                  <tr
                    key={design._id}
                    className="hover:bg-white/[0.01] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden relative">
                          {design.image1 && (
                            <Image
                              src={design.image1}
                              alt={design.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {design.name}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {design.category || "General"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {design.stitchCount?.toLocaleString()}
                        </span>
                        <span>{design.totalColors} colors</span>
                        <span>{design.size}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-white">
                        {formatDesignPrice(design.price)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {design.driveLink ? (
                        <a
                          href={design.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open Drive
                        </a>
                      ) : (
                        <span className="text-[10px] text-zinc-600">
                          No link
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            toggleFeaturedMutation.mutate({
                              id: design._id,
                              isFeatured: !design.isFeatured,
                            })
                          }
                          className={`p-2 rounded-lg transition-all ${
                            design.isFeatured
                              ? "text-amber-500 bg-amber-500/10"
                              : "text-zinc-500 hover:text-white hover:bg-zinc-800"
                          }`}
                          title={
                            design.isFeatured ? "Unfeature" : "Feature"
                          }
                        >
                          <Star
                            className={`w-4 h-4 ${
                              design.isFeatured ? "fill-current" : ""
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this design?"
                              )
                            ) {
                              deleteMutation.mutate(design._id);
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

      {/* Add Design Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-[#0a0a0a] border border-zinc-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Add New Design
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar"
            >
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Design Name
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                  placeholder="e.g. Rose Floral Embroidery"
                  value={newDesign.name}
                  onChange={(e) =>
                    setNewDesign({ ...newDesign, name: e.target.value })
                  }
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Category
                  </label>
                  <input
                    type="text"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    placeholder="e.g. Floral, Animals, Logo"
                    value={newDesign.category}
                    onChange={(e) =>
                      setNewDesign({ ...newDesign, category: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Price ($)
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    placeholder="1"
                    value={newDesign.price}
                    onChange={(e) =>
                      setNewDesign({ ...newDesign, price: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Stitch Count, Total Colors, Size */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Stitch Count
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    placeholder="12500"
                    value={newDesign.stitchCount}
                    onChange={(e) =>
                      setNewDesign({
                        ...newDesign,
                        stitchCount: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Total Colors
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    placeholder="6"
                    value={newDesign.totalColors}
                    onChange={(e) =>
                      setNewDesign({
                        ...newDesign,
                        totalColors: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Size
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    placeholder="4x4 inches"
                    value={newDesign.size}
                    onChange={(e) =>
                      setNewDesign({ ...newDesign, size: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Design Type, Thread Type, Fabric */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Design Type
                  </label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    value={newDesign.designType}
                    onChange={(e) =>
                      setNewDesign({
                        ...newDesign,
                        designType: e.target.value,
                      })
                    }
                  >
                    <option value="Flat">Flat</option>
                    <option value="3D Puff">3D Puff</option>
                    <option value="Appliqué">Appliqué</option>
                    <option value="Cross Stitch">Cross Stitch</option>
                    <option value="Satin">Satin</option>
                    <option value="Fill Stitch">Fill Stitch</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Thread Type
                  </label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    value={newDesign.threadType}
                    onChange={(e) =>
                      setNewDesign({
                        ...newDesign,
                        threadType: e.target.value,
                      })
                    }
                  >
                    <option value="Polyester">Polyester</option>
                    <option value="Rayon">Rayon</option>
                    <option value="Metallic">Metallic</option>
                    <option value="Cotton">Cotton</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Fabric Type
                  </label>
                  <input
                    type="text"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    placeholder="All Fabrics"
                    value={newDesign.fabricType}
                    onChange={(e) =>
                      setNewDesign({
                        ...newDesign,
                        fabricType: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Images (2 required) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Design Images (2 Required)
                  </label>
                  {imageFiles.length > 0 && (
                    <span className="text-[10px] text-zinc-500">
                      {imageFiles.length}/2 selected
                    </span>
                  )}
                </div>
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
                    <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                      Upload 2 images (hover swap effect)
                    </span>
                  </div>
                </label>
                {imageFiles.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {imageFiles.map((file, i) => {
                      const url = URL.createObjectURL(file);
                      return (
                        <div
                          key={i}
                          className="relative group/img aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900"
                        >
                          <img
                            src={url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 left-1 bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                            {i === 0 ? "Image 1" : "Image 2"}
                          </div>
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

              {/* Google Drive Link */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Google Drive Download Link
                </label>
                <input
                  required
                  type="url"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                  placeholder="https://drive.google.com/..."
                  value={newDesign.driveLink}
                  onChange={(e) =>
                    setNewDesign({ ...newDesign, driveLink: e.target.value })
                  }
                />
                <p className="text-[10px] text-zinc-600">
                  Buyers will receive this link to download DST, PES, JEF, and
                  other embroidery files (except EMB).
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Description
                </label>
                <textarea
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 min-h-[80px]"
                  placeholder="Describe the embroidery design..."
                  value={newDesign.description}
                  onChange={(e) =>
                    setNewDesign({ ...newDesign, description: e.target.value })
                  }
                />
              </div>

              {/* Submit */}
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
                  ) : (
                    "Create Design"
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
