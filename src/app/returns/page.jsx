import React from "react";

export const metadata = {
  title: "Returns & Exchanges | ZOWEARS",
  description: "Zowears return and exchange policy.",
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-background relative overflow-hidden">
      <div className="noise" />
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-accent-red/5 rounded-full blur-[150px] pointer-events-none -translate-y-1/2" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8 flex items-center gap-4">
          <span className="h-px w-12 bg-accent-red" />
          <span className="text-xs uppercase tracking-[0.4em] text-accent-red font-semibold">Support</span>
        </div>

        <h1 className="text-gradient font-display text-[clamp(48px,10vw,80px)] font-bold leading-none tracking-[-0.04em] mb-12">
          Returns & <br /> <span className="font-serif-jp italic font-medium text-accent-red [-webkit-text-fill-color:var(--color-accent-red)]">Exchanges</span>
        </h1>
        
        <div className="space-y-8 text-muted-foreground leading-relaxed border-l border-white/10 pl-6 md:pl-10">
          <p className="text-lg md:text-xl text-foreground font-medium">
            We stand behind the quality of our embroidered garments. If you are not completely satisfied, we are here to help.
          </p>
          
          <div>
            <h3 className="text-foreground text-lg font-bold mb-2">30-Day Return Policy</h3>
            <p>You have 30 days from the date of delivery to return or exchange an item. The garment must be unworn, unwashed, and in its original condition with all tags attached.</p>
          </div>

          <div>
            <h3 className="text-foreground text-lg font-bold mb-2">Exchanges</h3>
            <p>Need a different size or color? We offer easy exchanges. Contact our support team, and we'll process your request quickly to ensure you get the perfect fit.</p>
          </div>

          <div>
            <h3 className="text-foreground text-lg font-bold mb-2">Non-Returnable Items</h3>
            <p>Limited edition drops, custom-embroidered items, and sale merchandise are final sale and cannot be returned unless defective.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
