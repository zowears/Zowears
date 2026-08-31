import { Suspense } from "react";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";
import { JsonLd } from "@/components/SEO/JsonLd";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { MetaPixel } from "@/components/MetaPixel";
import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://zowears.com"),
  title: {
    default: "Zowears — Premium Embroidered Streetwear in Pakistan",
    template: "%s | Zowears Pakistan",
  },
  description: "Zowears is Pakistan's premier destination for high-end, heavyweight embroidered streetwear. Featuring custom Arabic calligraphy hoodies, boxy oversized tees, and premium 300 GSM cotton. Shop the best oversized fits and luxury apparel in Pakistan with express delivery.",
  keywords: [
    "streetwear pakistan", "embroidered t-shirts pakistan", "oversized hoodies pakistan", 
    "premium streetwear pakistan", "heavyweight hoodies pakistan", "arabic calligraphy streetwear", 
    "embroidered hoodies lahore", "oversized t-shirts karachi", "luxury streetwear islamabad", 
    "custom apparel pakistan", "streetwear dubai", "streetwear riyadh", "streetwear saudi arabia"
  ],
  authors: [{ name: "Zowears Collective" }],
  creator: "Zowears",
  publisher: "Zowears",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://zowears.com",
    languages: {
      "en-US": "https://zowears.com",
      "en-AE": "https://zowears.com?locale=en-ae",
      "ar-AE": "https://zowears.com?locale=ar-ae",
      "en-SA": "https://zowears.com?locale=en-sa",
      "ar-SA": "https://zowears.com?locale=ar-sa",
      "en-QA": "https://zowears.com?locale=en-qa",
      "ar-QA": "https://zowears.com?locale=ar-qa",
      "en-KW": "https://zowears.com?locale=en-kw",
      "ar-KW": "https://zowears.com?locale=ar-kw",
      "en-OM": "https://zowears.com?locale=en-om",
      "ar-OM": "https://zowears.com?locale=ar-om",
      "en-BH": "https://zowears.com?locale=en-bh",
      "ar-BH": "https://zowears.com?locale=ar-bh",
      "en-PK": "https://zowears.com?locale=en-pk",
      "x-default": "https://zowears.com",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://zowears.com",
    siteName: "Zowears Pakistan",
    title: "Zowears — Premium Embroidered Streetwear in Pakistan",
    description: "High-end heavyweight embroidered tees, calligraphy hoodies, and plain oversized essentials in Pakistan. Shop our exclusive custom-tailored collection today.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Zowears Collective — Premium Streetwear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zowears — Premium Embroidered Streetwear in Pakistan",
    description: "High-end heavyweight embroidered tees, calligraphy hoodies, and plain oversized essentials in Pakistan. Shop our exclusive custom-tailored collection today.",
    images: ["/og-image.jpg"],
    creator: "@zowears",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <JsonLd />
      </head>
      <body className="antialiased">
        <Providers>
          {/* <AnnouncementBar /> */}
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <Toaster position="bottom-right" theme="light" />
          <AnalyticsTracker />
          <Suspense fallback={null}>
            <MetaPixel />
          </Suspense>
        </Providers>
        </body>
    </html>
  );
}
