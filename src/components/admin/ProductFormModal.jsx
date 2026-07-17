"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, Trash2, Eye, Check } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ProductFormModal({ isOpen, onClose, product = null, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    mainCategory: "",
    subCategory: "",
    fits: [],
    brand: "",
    status: "active",
    isFeatured: false,
    costPrice: "",
    price: "",
    comparePrice: "",
    stock: "",
    lowStockThreshold: "10",
    trackInventory: true,
    colors: [],
    sizes: ["M", "L", "XL"],
    jp: "",
    badge: "",
  });

  // Load categories and colors on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [categoriesRes, colorsRes] = await Promise.all([
          fetch(`${API_URL}/categories/admin/all`, { headers }),
          fetch(`${API_URL}/colors/admin/all`, { headers }),
        ]);

        if (categoriesRes.ok) {
          // categories is no longer used, as we hardcode mainCategories
        }

        if (colorsRes.ok) {
          const colorData = await colorsRes.json();
          setColors(colorData.data || []);
        }
      } catch (error) {
        console.error("Failed to load options:", error);
      }
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  // Load product data when editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        description: product.description || "",
        mainCategory: product.mainCategory || "",
        subCategory: product.subCategory || "",
        fits: product.fits || [],
        brand: product.brand || "",
        status: product.status || "active",
        isFeatured: product.isFeatured || false,
        costPrice: product.costPrice || "",
        price: product.price || "",
        comparePrice: product.comparePrice || "",
        stock: product.stock || "",
        lowStockThreshold: product.lowStockThreshold || "10",
        trackInventory: product.trackInventory !== false,
        colors: product.colors?.map(c => {
          // Backward compatibility if color was stored as just string ID or object without colorId
          const cId = c.colorId || c._id || (typeof c === 'string' ? c : "");
          return {
            colorId: cId,
            name: c.name || "",
            hexCode: c.hexCode || "",
            sizes: c.sizes || []
          };
        }) || [],
        sizes: product.sizes || ["M", "L", "XL"],
        jp: product.jp || "",
        badge: product.badge || "",
      });
      setPreviewImages(product.images || []);
    }
  }, [product]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);

    // Create previews for new files
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImages((prev) => [
          ...prev,
          { url: event.target?.result, isNew: true },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    if (previewImages[index]?.url && !previewImages[index].isNew) {
      setRemoveImages((prev) => [...prev, previewImages[index].url]);
    }
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleColorToggle = (colorObj) => {
    setFormData((prev) => {
      const isSelected = prev.colors.some(c => c.colorId === colorObj._id);
      if (isSelected) {
        return {
          ...prev,
          colors: prev.colors.filter(c => c.colorId !== colorObj._id)
        };
      } else {
        return {
          ...prev,
          colors: [
            ...prev.colors, 
            { colorId: colorObj._id, name: colorObj.name, hexCode: colorObj.hexCode, sizes: [] }
          ]
        };
      }
    });
  };

  const handleColorSizeToggle = (colorId, size) => {
    setFormData((prev) => ({
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

  const handleSizeToggle = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("admin_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const form = new FormData();
      
      // Add form data
      form.append("name", formData.name);
      form.append("sku", formData.sku);
      form.append("description", formData.description);
      form.append("mainCategory", formData.mainCategory);
      form.append("subCategory", formData.subCategory);
      form.append("fits", JSON.stringify(formData.fits));
      form.append("brand", formData.brand);
      form.append("status", formData.status);
      form.append("isFeatured", formData.isFeatured);
      form.append("costPrice", formData.costPrice);
      form.append("price", formData.price);
      form.append("comparePrice", formData.comparePrice);
      form.append("stock", formData.stock);
      form.append("lowStockThreshold", formData.lowStockThreshold);
      form.append("trackInventory", formData.trackInventory);
      form.append("colors", JSON.stringify(formData.colors));
      form.append("sizes", JSON.stringify(formData.sizes));
      form.append("jp", formData.jp);
      form.append("badge", formData.badge);

      // Add images
      imageFiles.forEach((file) => {
        form.append("images", file);
      });

      // Add remove images list if editing
      if (removeImages.length > 0) {
        form.append("removeImages", JSON.stringify(removeImages));
      }

      const url = product 
        ? `${API_URL}/products/${product._id}`
        : `${API_URL}/products`;

      const method = product ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: form,
      });

      if (!res.ok) throw new Error("Failed to save product");

      toast.success(product ? "Product updated!" : "Product created!");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast.error(error.message || "Failed to save product");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="SKU"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Brand"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={formData.mainCategory}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    mainCategory: e.target.value,
                    subCategory: "", // reset subcategory on main change
                    fits: [] 
                  })
                }}
                className="col-span-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Main Category</option>
                <option value="Men's Wear">Men's Wear</option>
                <option value="Girls Wear">Girls Wear</option>
                <option value="Plain Tees">Plain Tees</option>
                <option value="Designs">Designs</option>
              </select>

              {(formData.mainCategory === "Men's Wear" || formData.mainCategory === "Girls Wear") && (
                <select
                  value={formData.subCategory}
                  onChange={(e) =>
                    setFormData({ ...formData, subCategory: e.target.value, fits: [] })
                  }
                  className="col-span-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={formData.mainCategory !== "Plain Tees" && formData.mainCategory !== "Designs"}
                >
                  <option value="">Select Sub Category</option>
                  {formData.mainCategory === "Men's Wear" && (
                    <>
                      <option value="T-shirts">T-shirts</option>
                      <option value="Hoodies">Hoodies</option>
                    </>
                  )}
                  {formData.mainCategory === "Girls Wear" && (
                    <>
                      <option value="Hoodies">Hoodies</option>
                      <option value="Sweatshirts">Sweatshirts</option>
                    </>
                  )}
                </select>
              )}

              {/* Fit options for T-shirts */}
              {(formData.mainCategory === "Plain Tees" || formData.subCategory === "T-shirts") && (
                <div className="col-span-2 space-y-2 mt-2 border p-3 rounded-lg bg-gray-50">
                  <label className="text-sm font-medium text-gray-700">Available Fits (T-shirts)</label>
                  <div className="flex gap-4">
                    {["Regular Fit", "Oversized"].map(fit => (
                      <label key={fit} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.fits.includes(fit)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, fits: [...formData.fits, fit] });
                            } else {
                              setFormData({ ...formData, fits: formData.fits.filter(f => f !== fit) });
                            }
                          }}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{fit}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="col-span-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Cost Price"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({ ...formData, costPrice: e.target.value })
                }
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Selling Price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                placeholder="Compare Price"
                value={formData.comparePrice}
                onChange={(e) =>
                  setFormData({ ...formData, comparePrice: e.target.value })
                }
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.comparePrice && formData.price && (
                <div className="flex items-center px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-semibold text-blue-900">
                    Discount:{" "}
                    {Math.round(
                      ((formData.comparePrice - formData.price) /
                        formData.comparePrice) *
                        100
                    )}
                    %
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Inventory */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Inventory</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Stock Quantity"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Low Stock Threshold"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lowStockThreshold: e.target.value,
                  })
                }
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.trackInventory}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      trackInventory: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Track Inventory</span>
              </label>
            </div>
          </div>

          {/* Variants - Colors and Sizes per Color */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Available Colors</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => {
                const isSelected = formData.colors.some(c => c.colorId === color._id);
                return (
                  <button
                    key={color._id}
                    type="button"
                    onClick={() => handleColorToggle(color)}
                    className={`px-3 py-2 rounded-lg border-2 transition flex items-center gap-2 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded border border-gray-200"
                      style={{ backgroundColor: color.hexCode }}
                    />
                    <span className="text-sm font-medium">{color.name}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {formData.colors.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="text-md font-medium text-gray-700">Select Sizes for Each Color:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.colors.map(selectedColor => (
                    <div key={selectedColor.colorId} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center gap-2 mb-3">
                        <div 
                          className="w-4 h-4 rounded border border-gray-300" 
                          style={{ backgroundColor: selectedColor.hexCode }} 
                        />
                        <span className="font-semibold text-gray-800">{selectedColor.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["M", "L", "XL"].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleColorSizeToggle(selectedColor.colorId, size)}
                            className={`px-3 py-1 text-sm rounded-md border transition font-medium ${
                              selectedColor.sizes.includes(size)
                                ? "border-blue-500 bg-blue-100 text-blue-900"
                                : "border-gray-300 bg-white hover:border-gray-400"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Product Variant Preview Table */}
            {formData.colors.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Product Preview</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Sizes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.colors.map(color => (
                        <tr key={color.colorId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full border shadow-sm" style={{ backgroundColor: color.hexCode }} />
                              <span className="text-sm text-gray-900 font-medium">{color.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {color.sizes.length > 0 ? (
                              <div className="flex gap-1.5">
                                {color.sizes.map(s => (
                                  <span key={s} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-xs">No sizes selected</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product Images</h3>
            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop images or click to upload
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="text-blue-600 text-sm font-medium cursor-pointer hover:underline">
                Select Images
              </label>
            </div>

            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-3">
                  {previewImages.length} image(s) selected
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {previewImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-lg overflow-hidden border hover:border-gray-300 transition"
                    >
                      <img
                        src={typeof img === "string" ? img : img.url}
                        alt={`Preview ${idx}`}
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status & Featured */}
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData({ ...formData, isFeatured: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Featured Product</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
