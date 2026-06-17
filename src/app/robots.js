export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/cart", "/checkout"],
    },
    sitemap: "https://zowers.com/sitemap.xml",
  };
}
