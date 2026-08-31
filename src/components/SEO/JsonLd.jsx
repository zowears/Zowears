import React from "react";

export function JsonLd() {
  const schema = [
    // 1. Organization Schema
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://zowears.com/#organization",
      "name": "Zowears Pakistan",
      "url": "https://zowears.com",
      "logo": "https://zowears.com/logo.png",
      "image": "https://zowears.com/og-image.jpg",
      "description": "Zowears is Pakistan's premier dark-luxury streetwear and design collective specializing in heavyweight embroidery, detailed custom fabrics, oversized t-shirts, and custom Arabic calligraphy apparel.",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "PK"
      },
      "sameAs": [
        "https://instagram.com/zowears",
        "https://twitter.com/zowears"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@zowears.com",
        "contactType": "customer service",
        "areaServed": ["PK", "AE", "SA", "QA", "KW", "OM", "BH"],
        "availableLanguage": ["en", "ar"]
      }
    },
    // 1.5 BreadcrumbList Schema
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://zowears.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Shop All Streetwear",
          "item": "https://zowears.com/shop"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Heavyweight Embroidery",
          "item": "https://zowears.com/shop?c=embroidered"
        }
      ]
    },
    // 2. WebSite Schema (with Search Box Action)
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://zowears.com/#website",
      "name": "Zowears",
      "url": "https://zowears.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://zowears.com/shop?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    // 3. Aggregate Offer representing regional availability & pricing
    {
      "@context": "https://schema.org",
      "@type": "AggregateOffer",
      "priceCurrency": "SAR",
      "lowPrice": "90",
      "highPrice": "350",
      "offerCount": "45",
      "priceRange": "$$ - $$$",
      "areaServed": [
        {
          "@type": "Country",
          "name": "Saudi Arabia",
          "identifier": "SA"
        },
        {
          "@type": "Country",
          "name": "United Arab Emirates",
          "identifier": "AE"
        },
        {
          "@type": "Country",
          "name": "Qatar",
          "identifier": "QA"
        },
        {
          "@type": "Country",
          "name": "Kuwait",
          "identifier": "KW"
        },
        {
          "@type": "Country",
          "name": "Oman",
          "identifier": "OM"
        },
        {
          "@type": "Country",
          "name": "Bahrain",
          "identifier": "BH"
        },
        {
          "@type": "Country",
          "name": "Pakistan",
          "identifier": "PK"
        }
      ],
      "offers": [
        {
          "@type": "Offer",
          "priceCurrency": "SAR",
          "price": "199",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "url": "https://zowears.com/shop"
        },
        {
          "@type": "Offer",
          "priceCurrency": "AED",
          "price": "195",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "url": "https://zowears.com/shop"
        },
        {
          "@type": "Offer",
          "priceCurrency": "QAR",
          "price": "190",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "url": "https://zowears.com/shop"
        },
        {
          "@type": "Offer",
          "priceCurrency": "PKR",
          "price": "5500",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "url": "https://zowears.com/shop"
        }
      ]
    }
  ];

  return (
    <>
      {schema.map((s, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  );
}
