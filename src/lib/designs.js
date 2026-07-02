const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchDesigns() {
  try {
    const res = await fetch(`${API_URL}/designs`);
    if (!res.ok) throw new Error("Failed to fetch designs");
    const data = await res.json();

    return data.map(d => ({
      ...d,
      id: d._id,
    }));
  } catch (error) {
    console.error("Fetch designs error:", error);
    return [];
  }
}

export async function fetchDesign(id) {
  try {
    const res = await fetch(`${API_URL}/designs/${id}`);
    if (!res.ok) throw new Error("Failed to fetch design");
    const d = await res.json();
    return {
      ...d,
      id: d._id,
    };
  } catch (error) {
    console.error("Fetch design error:", error);
    return null;
  }
}

export function formatDesignPrice(p) {
  const price = typeof p === "number" ? p : parseFloat(p) || 1;
  return `$${price.toFixed(2)}`;
}
