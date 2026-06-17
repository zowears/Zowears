export default async function sitemap() {
  const baseUrl = "https://zowers.com";

  const routes = [
    "",
    "/shop",
    "/fabrics",
    "/embroidered",
    "/blogs",
    "/shipping",
    "/contact",
    "/privacy-terms",
    "/returns"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: route === "" || route === "/shop" || route === "/blogs" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/shop" ? 0.9 : route === "/blogs" || route === "/embroidered" ? 0.8 : 0.5,
  }));

  return routes;
}
