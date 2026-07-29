const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchProducts(page = 1, limit = 100) {
  try {
    const res = await fetch(`${API_URL}/products?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch products");
    const result = await res.json();
    
    // Handle both paginated and flat response formats for backward compatibility
    const products = Array.isArray(result) ? result : (result.data || []);
    
    // Map MongoDB _id to id and provide defaults for missing fields
    return products.map(p => ({
      ...p,
      id: p._id || p.id,
      jp: p.jp || "新作",
      rating: p.rating || 5.0,
      colors: p.colors || [{ name: "Onyx", hex: "#0a0a0a" }],
      sizes: p.sizes || ["S", "M", "L", "XL"],
    }));
  } catch (error) {
    console.error("Fetch products error:", error);
    return [];
  }
}

export async function fetchProduct(id) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`);
    if (!res.ok) throw new Error("Failed to fetch product");
    const p = await res.json();
    return {
      ...p,
      id: p._id || p.id,
      jp: p.jp || "新作",
      rating: p.rating || 5.0,
      colors: p.colors || [{ name: "Onyx", hex: "#0a0a0a" }],
      sizes: p.sizes || ["S", "M", "L", "XL"],
    };
  } catch (error) {
    console.error("Fetch product error:", error);
    return null;
  }
}

export function formatPrice(p) {
  const price = typeof p === "number" ? p : parseFloat(p) || 0;
  return `Rs. ${price.toLocaleString("en-PK")}`;
}

// Keep the old products export for now to avoid breaking other components during migration,
// but they will be ignored by the updated pages.
export const products = [];

