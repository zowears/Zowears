import React from "react";

export const metadata = {
  title: "GCC & Global Express Shipping — Riyadh, Dubai, Doha, Karachi | ZOWEARS",
  description: "Zowears premium embroidered streetwear shipping details. Priority 3-5 day delivery to Saudi Arabia (KSA), UAE, Qatar, Kuwait, Bahrain, Oman, and Pakistan.",
  keywords: ["streetwear shipping dubai", "streetwear delivery riyadh", "zowears delivery ksa", "express shipping gcc", "شحن ستريت وير السعودية", "دليفري الرياض دبي"],
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-background relative overflow-hidden">
      <div className="noise" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent-red/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8 flex items-center gap-4">
          <span className="h-px w-12 bg-accent-red" />
          <span className="text-xs uppercase tracking-[0.4em] text-accent-red font-semibold">Logistics</span>
        </div>

        <h1 className="text-gradient font-display text-[clamp(48px,10vw,80px)] font-bold leading-none tracking-[-0.04em] mb-12">
          Global <br /> <span className="font-serif-jp italic font-medium text-accent-red [-webkit-text-fill-color:var(--color-accent-red)]">Shipping</span>
        </h1>
        
        <div className="space-y-8 text-muted-foreground leading-relaxed border-l border-white/10 pl-6 md:pl-10">
          <p className="text-lg md:text-xl text-foreground font-medium">
            We deliver our premium embroidered garments worldwide. Experience Zowears, wherever you are.
          </p>
          
          <div>
            <h3 className="text-foreground text-lg font-bold mb-2">Domestic Shipping (Pakistan)</h3>
            <p>Standard Delivery: 3-5 business days. Free shipping on all orders over Rs. 5,000.</p>
          </div>

          <div className="border border-accent-red/20 bg-accent-red/[0.02] p-6 rounded-2xl my-6">
            <h3 className="text-accent-red text-lg font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
              Middle East & GCC Express Shipping <span className="font-serif text-xs font-normal normal-case text-muted-foreground">(شحن سريع للخليج العربي)</span>
            </h3>
            <p className="text-sm mb-4">
              We offer dedicated priority express shipping routes for our patrons in the Gulf Cooperation Council (GCC) countries. All packages are fully tracked and delivered via high-speed premium couriers.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs mt-4 pt-4 border-t border-white/5">
              <div>
                <strong className="text-white block">United Arab Emirates (UAE)</strong>
                <span className="text-muted-foreground">3-4 business days (DHL Express)</span>
              </div>
              <div>
                <strong className="text-white block">Saudi Arabia (KSA)</strong>
                <span className="text-muted-foreground">3-5 business days (Express Courier)</span>
              </div>
              <div>
                <strong className="text-white block">Qatar & Kuwait</strong>
                <span className="text-muted-foreground">4-5 business days (Priority Air)</span>
              </div>
              <div>
                <strong className="text-white block">Oman & Bahrain</strong>
                <span className="text-muted-foreground">4-5 business days (Priority Air)</span>
              </div>
              <div>
                <strong className="text-white block">Regional Currencies</strong>
                <span className="text-muted-foreground">AED, SAR, QAR, USD accepted</span>
              </div>
              <div>
                <strong className="text-white block">GCC Duties & Taxes</strong>
                <span className="text-muted-foreground">Calculated transparently at checkout</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-foreground text-lg font-bold mb-2">Rest of the World</h3>
            <p>We ship globally via premium courier partners. Delivery typically takes 7-14 business days depending on your region. International shipping rates are calculated at checkout.</p>
          </div>

          <div>
            <h3 className="text-foreground text-lg font-bold mb-2">Order Processing</h3>
            <p>All orders are processed within 1-2 business days. Due to the high quality and intricate embroidery on some of our exclusive drops, processing times may slightly vary during peak seasons.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
