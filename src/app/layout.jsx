import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";
import { JsonLd } from "@/components/SEO/JsonLd";
import "./globals.css";

export const metadata = {
  title: {
    default: "Zowears — Premium T-shirts",
    template: "%s | Zowears",
  },
  description: "Zowears crafts premium heavyweight embroidered and printed streetwear. Featuring custom Arabic calligraphy hoodies, boxy oversized tees, and premium 300 GSM cotton. Express shipping to UAE, Saudi Arabia (KSA), Qatar, Kuwait, Bahrain, Oman, and Pakistan.",
  keywords: [
    "streetwear dubai", "streetwear riyadh", "streetwear saudi arabia", "premium streetwear gcc", 
    "arabic calligraphy streetwear", "embroidered hoodies uae", "oversized t-shirts qatar",
    "luxury streetwear gulf", "ملابس ستريت وير دبي", "تيشيرتات خط عربي", "هوديز مطرزة الخليج",
    "ملابس مطرزة فاخرة السعودية", "streetwear pakistan", "embroidered t-shirts", 
    "oversized hoodies pakistan", "oversized t-shirts", "premium fabric streetwear",
    "heavyweight hoodies gcc", "dubai clothing brand", "riyadh luxury fashion"
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
    canonical: "https://zowers.com",
    languages: {
      "en-US": "https://zowers.com",
      "en-AE": "https://zowers.com?locale=en-ae",
      "ar-AE": "https://zowers.com?locale=ar-ae",
      "en-SA": "https://zowers.com?locale=en-sa",
      "ar-SA": "https://zowers.com?locale=ar-sa",
      "en-QA": "https://zowers.com?locale=en-qa",
      "ar-QA": "https://zowers.com?locale=ar-qa",
      "en-KW": "https://zowers.com?locale=en-kw",
      "ar-KW": "https://zowers.com?locale=ar-kw",
      "en-OM": "https://zowers.com?locale=en-om",
      "ar-OM": "https://zowers.com?locale=ar-om",
      "en-BH": "https://zowers.com?locale=en-bh",
      "ar-BH": "https://zowers.com?locale=ar-bh",
      "en-PK": "https://zowers.com?locale=en-pk",
      "x-default": "https://zowers.com",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zowers.com",
    siteName: "Zowears",
    title: "Zowears — Premium T-shirts",
    description: "High-end heavyweight embroidered tees, calligraphy hoodies, and plain oversized essentials. Express shipping to Dubai, Riyadh, Doha, Kuwait, and worldwide.",
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
    title: "Zowears — Premium T-shirts",
    description: "High-end heavyweight embroidered tees, calligraphy hoodies, and plain oversized essentials. Express shipping to Dubai, Riyadh, Doha, Kuwait, and worldwide.",
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
          <AnnouncementBar />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <Toaster position="bottom-right" theme="dark" />
        </Providers>
      </body>
    </html>
  );
}
