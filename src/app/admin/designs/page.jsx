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
  Edit2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const uploadToCloudinary = (file, signatureData, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Upload network error"));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signatureData.apiKey);
    formData.append("timestamp", signatureData.timestamp);
    formData.append("signature", signatureData.signature);
    formData.append("folder", signatureData.folder);

    xhr.send(formData);
  });
};

export default function AdminDesignsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  
  // Create state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ image1: 0, image2: 0 });
  const [isUploading, setIsUploading] = useState(false);
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
    status: "Active",
    tags: "",
  });

  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState(null);
  const [editImageFiles, setEditImageFiles] = useState({ image1: null, image2: null });
  const [editUploadProgress, setEditUploadProgress] = useState({ image1: 0, image2: 0 });
  const [isEditUploading, setIsEditUploading] = useState(false);
  const [editForm, setEditForm] = useState({
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
    isFeatured: false,
    status: "Active",
    tags: "",
  });

  // Delete Confirm ID State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const { data: designsData, isLoading } = useQuery({
    queryKey: ["admin-designs"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/designs`);
      if (!res.ok) throw new Error("Failed to fetch designs");
      const data = await res.json();
      // Handle both paginated response format { data, pagination } and array format
      return Array.isArray(data) ? data : (data.data || []);
    },
  });

  const designs = designsData;

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${API_URL}/designs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create design");
      }
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
        status: "Active",
        tags: "",
      });
      setImageFiles([]);
      setUploadProgress({ image1: 0, image2: 0 });
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create design");
      setIsUploading(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await fetch(`${API_URL}/designs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update design");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-designs"] });
      toast.success("Design updated successfully");
      setIsEditModalOpen(false);
      setEditingDesign(null);
      setEditImageFiles({ image1: null, image2: null });
      setEditUploadProgress({ image1: 0, image2: 0 });
      setIsEditUploading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update design");
      setIsEditUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_URL}/designs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete design");
      return res.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["admin-designs"] });
      const previousDesigns = queryClient.getQueryData(["admin-designs"]);
      queryClient.setQueryData(["admin-designs"], (old) => 
        old ? old.filter(d => d._id !== id) : []
      );
      return { previousDesigns };
    },
    onError: (err, id, context) => {
      if (context?.previousDesigns) {
        queryClient.setQueryData(["admin-designs"], context.previousDesigns);
      }
      toast.error(err.message || "Failed to delete design");
    },
    onSuccess: () => {
      toast.success("Design deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-designs"] });
    }
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
    onMutate: async ({ id, isFeatured }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-designs"] });
      const previousDesigns = queryClient.getQueryData(["admin-designs"]);
      queryClient.setQueryData(["admin-designs"], (old) => 
        old ? old.map(d => d._id === id ? { ...d, isFeatured } : d) : []
      );
      return { previousDesigns };
    },
    onError: (err, variables, context) => {
      if (context?.previousDesigns) {
        queryClient.setQueryData(["admin-designs"], context.previousDesigns);
      }
      toast.error(err.message || "Failed to update featured status");
    },
    onSuccess: () => {
      toast.success("Featured status updated");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-designs"] });
    }
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

  const handleEditClick = (design) => {
    setEditingDesign(design);
    setEditForm({
      name: design.name || "",
      description: design.description || "",
      price: String(design.price || 1),
      stitchCount: String(design.stitchCount || ""),
      totalColors: String(design.totalColors || ""),
      size: design.size || "",
      designType: design.designType || "Flat",
      threadType: design.threadType || "Polyester",
      fabricType: design.fabricType || "All Fabrics",
      driveLink: design.driveLink || "",
      category: design.category || "General",
      isFeatured: design.isFeatured || false,
      status: design.status || "Active",
      tags: design.tags ? design.tags.join(", ") : "",
    });
    setEditImageFiles({ image1: null, image2: null });
    setEditUploadProgress({ image1: 0, image2: 0 });
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length < 2) {
      toast.error("Please upload exactly 2 images for the design");
      return;
    }
    if (!newDesign.driveLink.trim()) {
      toast.error("Please provide a Google Drive download link");
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
    for (const file of imageFiles) {
      if (file.size > MAX_SIZE) {
        toast.error(`Image file "${file.name}" is too large. Max size allowed is 5MB.`);
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress({ image1: 0, image2: 0 });

    try {
      // 1. Fetch Cloudinary signature from backend
      const sigRes = await fetch(`${API_URL}/designs/upload-signature`, {
        method: "POST"
      });
      if (!sigRes.ok) {
        throw new Error("Failed to get upload signature from server.");
      }
      const sigData = await sigRes.json();

      // 2. Upload first image
      const img1Res = await uploadToCloudinary(imageFiles[0], sigData, (percent) => {
        setUploadProgress(prev => ({ ...prev, image1: percent }));
      });

      // 3. Upload second image
      const img2Res = await uploadToCloudinary(imageFiles[1], sigData, (percent) => {
        setUploadProgress(prev => ({ ...prev, image2: percent }));
      });

      // 4. Submit Design via JSON
      createMutation.mutate({
        ...newDesign,
        price: Number(newDesign.price) || 1,
        stitchCount: Number(newDesign.stitchCount) || 0,
        totalColors: Number(newDesign.totalColors) || 0,
        image1: img1Res.secure_url,
        image2: img2Res.secure_url,
        tags: newDesign.tags.split(",").map(t => t.trim()).filter(Boolean),
      });

    } catch (err) {
      toast.error(err.message || "Failed to create design");
      setIsUploading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.driveLink.trim()) {
      toast.error("Please provide a Google Drive download link");
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (editImageFiles.image1 && editImageFiles.image1.size > MAX_SIZE) {
      toast.error(`Replaced image 1 exceeds size limit of 5MB.`);
      return;
    }
    if (editImageFiles.image2 && editImageFiles.image2.size > MAX_SIZE) {
      toast.error(`Replaced image 2 exceeds size limit of 5MB.`);
      return;
    }

    setIsEditUploading(true);
    setEditUploadProgress({ image1: 0, image2: 0 });

    try {
      let finalImg1 = editingDesign.image1;
      let finalImg2 = editingDesign.image2;

      let sigData = null;
      if (editImageFiles.image1 || editImageFiles.image2) {
        const sigRes = await fetch(`${API_URL}/designs/upload-signature`, {
          method: "POST"
        });
        if (!sigRes.ok) throw new Error("Failed to get signature from server.");
        sigData = await sigRes.json();
      }

      if (editImageFiles.image1) {
        const img1Res = await uploadToCloudinary(editImageFiles.image1, sigData, (p) => {
          setEditUploadProgress(prev => ({ ...prev, image1: p }));
        });
        finalImg1 = img1Res.secure_url;
      }

      if (editImageFiles.image2) {
        const img2Res = await uploadToCloudinary(editImageFiles.image2, sigData, (p) => {
          setEditUploadProgress(prev => ({ ...prev, image2: p }));
        });
        finalImg2 = img2Res.secure_url;
      }

      updateMutation.mutate({
        id: editingDesign._id,
        payload: {
          ...editForm,
          price: Number(editForm.price) || 1,
          stitchCount: Number(editForm.stitchCount) || 0,
          totalColors: Number(editForm.totalColors) || 0,
          image1: finalImg1,
          image2: finalImg2,
          tags: editForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        }
      });

    } catch (err) {
      toast.error(err.message || "Failed to update design");
      setIsEditUploading(false);
    }
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
                          onClick={() => handleEditClick(design)}
                          className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                          title="Edit Design"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
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
                          onClick={() => setDeleteConfirmId(design._id)}
                          className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete Design"
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
            onClick={() => !isUploading && setIsModalOpen(false)}
          ></div>
          <div className="relative bg-[#0a0a0a] border border-zinc-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Add New Design
              </h2>
              <button
                onClick={() => !isUploading && setIsModalOpen(false)}
                disabled={isUploading}
                className="text-zinc-500 hover:text-white transition-colors disabled:opacity-30"
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
                  disabled={isUploading}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
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
                    disabled={isUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
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
                    disabled={isUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
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
                    disabled={isUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
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
                    disabled={isUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
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
                    disabled={isUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
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
                    disabled={isUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
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
                    disabled={isUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
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
                    disabled={isUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
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

              {/* Status & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Status
                  </label>
                  <select
                    disabled={isUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
                    value={newDesign.status}
                    onChange={(e) =>
                      setNewDesign({
                        ...newDesign,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    disabled={isUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
                    placeholder="Floral, Animals, Logo"
                    value={newDesign.tags}
                    onChange={(e) =>
                      setNewDesign({
                        ...newDesign,
                        tags: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Images (2 required) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Design Images (2 Required, Max 5MB each)
                  </label>
                  {imageFiles.length > 0 && (
                    <span className="text-[10px] text-zinc-500">
                      {imageFiles.length}/2 selected
                    </span>
                  )}
                </div>
                <label className={`relative group cursor-pointer block ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploading}
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
                      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                      const isOversized = file.size > 5 * 1024 * 1024;
                      return (
                        <div
                          key={i}
                          className={`relative group/img aspect-square rounded-lg overflow-hidden border ${
                            isOversized ? "border-red-500" : "border-zinc-800"
                          } bg-zinc-900`}
                        >
                          <img
                            src={url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 left-1 bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                            {i === 0 ? "Image 1" : "Image 2"}
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black/80 text-[8px] px-1 py-0.5 rounded text-zinc-400">
                            {sizeMB} MB
                          </div>
                          {isOversized && (
                            <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center p-1 text-center">
                              <span className="bg-red-600 text-white text-[8px] font-bold px-1 py-0.5 rounded uppercase tracking-wider">
                                Too Large
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            disabled={isUploading}
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Progress Indicator */}
              {isUploading && (
                <div className="space-y-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider">Uploading Design Images...</span>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>Image 1</span>
                        <span>{uploadProgress.image1}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all duration-300" style={{ width: `${uploadProgress.image1}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>Image 2</span>
                        <span>{uploadProgress.image2}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all duration-300" style={{ width: `${uploadProgress.image2}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Google Drive Link */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Google Drive Download Link
                </label>
                <input
                  required
                  type="url"
                  disabled={isUploading}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
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
                  disabled={isUploading}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 min-h-[80px] disabled:opacity-50"
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
                  disabled={isUploading}
                  className="flex-1 px-4 py-2 border border-zinc-800 rounded-lg text-sm font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-900 transition-colors disabled:opacity-30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || isUploading}
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createMutation.isPending || isUploading ? (
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

      {/* Edit Design Modal */}
      {isEditModalOpen && editingDesign && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isEditUploading && setIsEditModalOpen(false)}
          ></div>
          <div className="relative bg-[#0a0a0a] border border-zinc-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Edit Design: {editingDesign.name}
              </h2>
              <button
                onClick={() => !isEditUploading && setIsEditModalOpen(false)}
                disabled={isEditUploading}
                className="text-zinc-500 hover:text-white transition-colors disabled:opacity-30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleEditSubmit}
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
                  disabled={isEditUploading}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
                  placeholder="e.g. Rose Floral Embroidery"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
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
                    disabled={isEditUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
                    placeholder="e.g. Floral, Animals, Logo"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
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
                    disabled={isEditUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
                    placeholder="1"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
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
                    disabled={isEditUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
                    placeholder="12500"
                    value={editForm.stitchCount}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
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
                    disabled={isEditUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
                    placeholder="6"
                    value={editForm.totalColors}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
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
                    disabled={isEditUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
                    placeholder="4x4 inches"
                    value={editForm.size}
                    onChange={(e) =>
                      setEditForm({ ...editForm, size: e.target.value })
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
                    disabled={isEditUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
                    value={editForm.designType}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
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
                    disabled={isEditUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
                    value={editForm.threadType}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
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
                    disabled={isEditUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
                    placeholder="All Fabrics"
                    value={editForm.fabricType}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        fabricType: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Status & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Status
                  </label>
                  <select
                    disabled={isEditUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    disabled={isEditUploading}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
                    placeholder="Floral, Animals, Logo"
                    value={editForm.tags}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        tags: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Editable Images */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                  Design Images (2 Slots, Max 5MB each)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Image 1 slot */}
                  <div className="border border-zinc-800 rounded-xl p-3 bg-zinc-900/30 flex flex-col gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Image 1 (Primary)</span>
                    
                    {editImageFiles.image1 ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 group">
                        <img
                          src={URL.createObjectURL(editImageFiles.image1)}
                          alt="primary-preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/80 text-[8px] px-1 py-0.5 rounded text-zinc-400">
                          {(editImageFiles.image1.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                        {editImageFiles.image1.size > 5 * 1024 * 1024 && (
                          <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center p-1 text-center">
                            <span className="bg-red-600 text-white text-[8px] font-bold px-1 py-0.5 rounded uppercase tracking-wider">Too Large</span>
                          </div>
                        )}
                        <button
                          type="button"
                          disabled={isEditUploading}
                          onClick={() => setEditImageFiles(prev => ({ ...prev, image1: null }))}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-800 disabled:opacity-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 group">
                        {editingDesign.image1 ? (
                          <>
                            <img
                              src={editingDesign.image1}
                              alt="existing-primary"
                              className="w-full h-full object-cover"
                            />
                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) setEditImageFiles(prev => ({ ...prev, image1: file }));
                                  e.target.value = "";
                                }}
                                className="sr-only"
                              />
                              <span className="bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider flex items-center gap-1">
                                <Upload className="w-3 h-3" /> Replace
                              </span>
                            </label>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-600 text-[10px]">No Image</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Image 2 slot */}
                  <div className="border border-zinc-800 rounded-xl p-3 bg-zinc-900/30 flex flex-col gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Image 2 (Hover Swap)</span>
                    
                    {editImageFiles.image2 ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 group">
                        <img
                          src={URL.createObjectURL(editImageFiles.image2)}
                          alt="secondary-preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/80 text-[8px] px-1 py-0.5 rounded text-zinc-400">
                          {(editImageFiles.image2.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                        {editImageFiles.image2.size > 5 * 1024 * 1024 && (
                          <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center p-1 text-center">
                            <span className="bg-red-600 text-white text-[8px] font-bold px-1 py-0.5 rounded uppercase tracking-wider">Too Large</span>
                          </div>
                        )}
                        <button
                          type="button"
                          disabled={isEditUploading}
                          onClick={() => setEditImageFiles(prev => ({ ...prev, image2: null }))}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-800 disabled:opacity-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 group">
                        {editingDesign.image2 ? (
                          <>
                            <img
                              src={editingDesign.image2}
                              alt="existing-secondary"
                              className="w-full h-full object-cover"
                            />
                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) setEditImageFiles(prev => ({ ...prev, image2: file }));
                                  e.target.value = "";
                                }}
                                className="sr-only"
                              />
                              <span className="bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider flex items-center gap-1">
                                <Upload className="w-3 h-3" /> Replace
                              </span>
                            </label>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-600 text-[10px]">No Image</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Progress Indicator */}
              {isEditUploading && (
                <div className="space-y-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider">Uploading Replaced Images...</span>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  </div>
                  <div className="space-y-2">
                    {editImageFiles.image1 && (
                      <div>
                        <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                          <span>Image 1</span>
                          <span>{editUploadProgress.image1}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                          <div className="h-full bg-white transition-all duration-300" style={{ width: `${editUploadProgress.image1}%` }}></div>
                        </div>
                      </div>
                    )}
                    {editImageFiles.image2 && (
                      <div>
                        <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                          <span>Image 2</span>
                          <span>{editUploadProgress.image2}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                          <div className="h-full bg-white transition-all duration-300" style={{ width: `${editUploadProgress.image2}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Google Drive Link */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Google Drive Download Link
                </label>
                <input
                  required
                  type="url"
                  disabled={isEditUploading}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
                  placeholder="https://drive.google.com/..."
                  value={editForm.driveLink}
                  onChange={(e) =>
                    setEditForm({ ...editForm, driveLink: e.target.value })
                  }
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Description
                </label>
                <textarea
                  disabled={isEditUploading}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 min-h-[80px] disabled:opacity-50"
                  placeholder="Describe the embroidery design..."
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>

              {/* Submit */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isEditUploading}
                  className="flex-1 px-4 py-2 border border-zinc-800 rounded-lg text-sm font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-900 transition-colors disabled:opacity-30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending || isEditUploading}
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updateMutation.isPending || isEditUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Custom Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          ></div>
          <div className="relative bg-[#0a0a0a] border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-2">Delete Design</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Are you sure you want to permanently delete this design? This will also remove the images from Cloudinary storage. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 border border-zinc-800 rounded-lg text-sm font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteMutation.mutate(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
