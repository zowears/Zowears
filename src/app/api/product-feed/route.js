import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products?limit=1000`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const { data: products } = await res.json();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zowears.com';

    let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Zowears Product Feed</title>
    <link>${baseUrl}</link>
    <description>Product catalog for Zowears</description>`;

    products.forEach((product) => {
      // Escape special characters in XML
      const escapeXml = (unsafe) => (unsafe || '').toString().replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&apos;';
          case '"': return '&quot;';
          default: return c;
        }
      });

      const id = product._id;
      const title = escapeXml(product.name);
      const description = escapeXml(product.description || product.name);
      const link = `${baseUrl}/product/${product.slug || id}`;
      const imageLink = product.image || (product.images?.[0]?.url) || '';
      
      const price = product.price;
      const comparePrice = product.comparePrice;
      const brand = escapeXml(product.brand || 'Zowears');
      
      const condition = 'new';
      const availability = product.stock > 0 || !product.trackInventory ? 'in stock' : 'out of stock';
      
      xml += `
    <item>
      <g:id>${id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:brand>${brand}</g:brand>
      <g:condition>${condition}</g:condition>
      <g:availability>${availability}</g:availability>`;

      if (comparePrice && comparePrice > price) {
        xml += `
      <g:price>${comparePrice} PKR</g:price>
      <g:sale_price>${price} PKR</g:sale_price>`;
      } else {
        xml += `
      <g:price>${price} PKR</g:price>`;
      }

      xml += `
    </item>`;
    });

    xml += `
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
