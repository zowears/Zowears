const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    
    // Map MongoDB _id to id and provide defaults for missing fields
    return data.map(p => ({
      ...p,
      id: p._id,
      jp: p.jp || "新作", // Japanese placeholder if missing
      rating: p.rating || 5.0,
      reviews: p.reviews || 0,
      colors: p.colors || [{ name: "Onyx", hex: "#0a0a0a" }],
      sizes: p.sizes || ["S", "M", "L", "XL"],
    }));
  } catch (error) {
    console.error("Fetch products error:", error);
    return []; // Return empty array instead of fallback products to respect "only original" request
  }
}

export async function fetchProduct(id) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`);
    if (!res.ok) throw new Error("Failed to fetch product");
    const p = await res.json();
    return {
      ...p,
      id: p._id,
      jp: p.jp || "新作",
      rating: p.rating || 5.0,
      reviews: p.reviews || 0,
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

