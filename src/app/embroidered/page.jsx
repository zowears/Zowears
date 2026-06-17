import React from "react";

export const metadata = {
  title: "Premium Embroidery & Custom Arabic Calligraphy Streetwear | ZOWEARS",
  description: "Explore Zowears's high-density embroidered streetwear collections and luxury custom Arabic calligraphy hoodies. Crafted with premium 300 GSM double-knit cotton for Riyadh, Dubai, Doha, and global streets.",
  keywords: ["embroidered streetwear", "arabic calligraphy streetwear", "luxury embroidery hoodies", "ملابس مطرزة", "خط عربي ستريت وير", "كاليغرافي هوديز", "heavyweight embroidery dubai"],
};

export default function EmbroideredPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-background relative overflow-hidden">
      <div className="noise" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-red/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8 flex items-center gap-4">
          <span className="h-px w-12 bg-accent-red" />
          <span className="text-xs uppercase tracking-[0.4em] text-accent-red font-semibold">Craftsmanship</span>
        </div>

        <h1 className="text-gradient font-display text-[clamp(48px,10vw,80px)] font-bold leading-none tracking-[-0.04em] mb-12">
          The Art of <br /> <span className="font-serif italic font-medium text-accent-red [-webkit-text-fill-color:var(--color-accent-red)]">Embroidery</span>
        </h1>
        
        <div className="space-y-8 text-muted-foreground leading-relaxed border-l border-white/10 pl-6 md:pl-10">
          <p className="text-lg md:text-xl text-foreground font-medium">
            At Zowears, every stitch tells a story. Our garments are more than just clothing; they are a canvas where heritage craftsmanship meets modern streetwear.
          </p>
          <p>
            We use premium, high-density threads to ensure our embroidered designs stand the test of time. Unlike printed graphics that fade and crack, our embroidery brings texture, depth, and a luxurious feel to every oversized hoodie, sweatshirt, and heavyweight tee.
          </p>
          <p>
            Our aesthetic is brought to life through intricate needlework, taking inspiration from stunning artistic concepts, including traditional Arabic calligraphy, modern art, and high-fashion geometric silhouettes. Each piece is crafted with absolute precision to deliver an everyday luxury experience that you can feel with your fingertips.
          </p>
          <div className="pt-8">
            <span className="text-[10px] uppercase tracking-[0.4em] text-foreground font-bold">Zowears Collective — Est. 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
