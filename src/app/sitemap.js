const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default async function sitemap() {
  const baseUrl = "https://zowears.com";
  
  // Fetch products and designs to include in sitemap
  let products = [];
  let designs = [];
  
  try {
    // Fetch first 1000 products (paginate if needed)
    const productsRes = await fetch(`${API_URL}/products?limit=1000`, {
      next: { revalidate: 86400 } // Revalidate once a day
    });
    if (productsRes.ok) {
      const productsData = await productsRes.json();
      products = Array.isArray(productsData) ? productsData : (productsData.data || []);
    }
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error);
  }
  
  try {
    // Fetch first 500 designs (paginate if needed)
    const designsRes = await fetch(`${API_URL}/designs?limit=500`, {
      next: { revalidate: 86400 } // Revalidate once a day
    });
    if (designsRes.ok) {
      const designsData = await designsRes.json();
      designs = Array.isArray(designsData) ? designsData : (designsData.data || []);
    }
  } catch (error) {
    console.error('Failed to fetch designs for sitemap:', error);
  }

  const staticRoutes = [
    "",
    "/shop",
    "/fabrics",
    "/embroidered",
    "/blogs",
    "/shipping",
    "/contact",
    "/privacy-terms",
    "/returns",
    "/designs"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: 
      route === "" || route === "/shop" ? "daily" : 
      route === "/blogs" || route === "/embroidered" || route === "/designs" ? "weekly" : 
      "monthly",
    priority: 
      route === "" ? 1.0 : 
      route === "/shop" || route === "/designs" ? 0.9 : 
      route === "/blogs" || route === "/embroidered" ? 0.8 : 
      0.5,
  }));

  // Add product routes
  const productRoutes = products.map(product => ({
    url: `${baseUrl}/product/${product.slug || product._id || product.id}`,
    lastModified: product.updatedAt || product.createdAt || new Date().toISOString().split("T")[0],
    changeFrequency: "weekly",
    priority: product.isFeatured ? 0.8 : 0.6,
  }));

  // Add design routes
  const designRoutes = designs.map(design => ({
    url: `${baseUrl}/designs/${design._id || design.id}`,
    lastModified: design.updatedAt || design.createdAt || new Date().toISOString().split("T")[0],
    changeFrequency: "weekly",
    priority: design.isFeatured ? 0.7 : 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...designRoutes];
}
