import ProductClient from "./ProductClient";
import { fetchProduct } from "@/lib/products";

// Server component to handle dynamic SEO metadata
export async function generateMetadata({ params }) {
  // Next.js 16: params is a Promise — must be awaited
  const resolvedParams = await params;
  const slugArray = resolvedParams.slug || [];
  const idOrSlug = slugArray[slugArray.length - 1];

  if (!idOrSlug) {
    return {
      title: "Product Not Found | Zowears Pakistan",
    };
  }

  try {
    const product = await fetchProduct(idOrSlug);
    
    if (product) {
      const category = product.categories?.[0] || 'Apparel';
      const title = `${product.name} — Premium Embroidered ${category} in Pakistan | Zowears`;
      
      // Create a clean description snippet
      const cleanDesc = product.description 
        ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 120) 
        : `Buy ${product.name} online in Pakistan. Premium heavyweight oversized fit with detailed embroidery.`;
        
      const description = `${cleanDesc}... Express shipping available across Pakistan.`;
      
      const imageUrl = product.images?.[0]?.url || product.images?.[0] || product.image;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: imageUrl ? [{ url: imageUrl }] : [],
          type: "website",
          locale: "en_PK",
          siteName: "Zowears Pakistan",
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: imageUrl ? [imageUrl] : [],
        },
      };
    }
  } catch (error) {
    console.error("Error fetching product metadata:", error);
  }

  return {
    title: "Premium Embroidered Streetwear in Pakistan | Zowears",
    description: "Shop the best oversized fits and luxury embroidered apparel in Pakistan.",
  };
}

export default function ProductPage() {
  // ProductClient uses useParams() hook internally to read the route params
  return (
    <>
      <ProductClient />
    </>
  );
}
