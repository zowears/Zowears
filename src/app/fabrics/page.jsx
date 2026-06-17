import React from "react";
import Link from "next/link";
import { ShieldCheck, Snowflake, Flame, Cpu, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Premium Heavyweight Cotton Fabrics (180 GSM vs 300 GSM) | ZOWEARS",
  description: "Explore Zowears's textile innovations. Choose between our lightweight 180 GSM combed cotton (perfect for warm GCC summers) and our premium heavyweight 300 GSM double-knit cotton (stiff, boxy streetwear armor). Available worldwide.",
  keywords: ["heavyweight cotton t-shirt", "300 gsm streetwear hoodie", "boxy fit fabric dubai", "premium cotton fabric saudi arabia", "اقمشة قطنية فاخرة", "تيشيرت اوفرسايز الرياض", "streetwear fabric quality"],
};

export default function FabricsPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-4 md:px-8 bg-[#0a0a0a] relative overflow-hidden">
      {/* Texture & Ambient glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e1e_1px,transparent_1px)] bg-size-[24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-red/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Back Link */}
        <div className="mb-12">
          <Link href="/shop" className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Collective
          </Link>
        </div>

        {/* Section Title */}
        <div className="mb-20 max-w-3xl">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-12 bg-accent-red" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-accent-red font-bold">Innovation Spotlight</span>
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-black tracking-[-0.04em] leading-[0.95] uppercase text-white">
            WE DON'T DICTATE. <br />
            <span className="text-gradient">YOU CHOOSE.</span>
          </h1>
          <p className="mt-8 text-sm sm:text-lg text-muted-foreground leading-relaxed font-light font-sans">
            In standard fashion, brands decide the fabric weight for you—forcing either paper-thin garments that crack after a wash or heavy wool-like fits in high heat. 
            <strong className="text-white block mt-3 font-semibold">At ZOWEARS, we broke the rules. We are the only brand in Pakistan giving you the choice of Normal and Premium fabric weights for every single design in our store.</strong>
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid gap-8 md:grid-cols-2 mb-20">
          
          {/* Card 1: Normal Fabric */}
          <div className="border border-white/5 bg-white/1 rounded-[2rem] p-8 md:p-12 hover:border-white/10 transition-all group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="px-5 py-2 rounded-full border border-white/10 text-[9px] uppercase tracking-[0.3em] text-white/50 font-bold bg-white/[0.02]">
                  Tier 01
                </span>
                <span className="text-white/20 group-hover:text-white transition-colors duration-300 font-display text-3xl font-bold">
                  180 GSM
                </span>
              </div>
              
              <h2 className="font-display text-3xl font-black tracking-tight text-white mb-6 uppercase">
                Normal Weight <br/>
                <span className="text-white/40 italic font-serif text-2xl lowercase font-normal">the everyday essential</span>
              </h2>

              <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-light">
                Specifically custom-knitted for Pakistan's long, humid summers. It preserves the classic oversized drape without building excessive heat, feeling incredibly soft and light against your skin.
              </p>

              {/* Specs */}
              <ul className="space-y-4 mb-8">
                <SpecItem icon={<Snowflake className="h-4 w-4 text-white/60" />} text="100% Long-Staple Combed Cotton" />
                <SpecItem icon={<Cpu className="h-4 w-4 text-white/60" />} text="Breathable & Flowy Drape" />
                <SpecItem icon={<ShieldCheck className="h-4 w-4 text-white/60" />} text="Silicon-Washed for Butter Soft Feel" />
              </ul>
            </div>

            <div className="pt-6 border-t border-white/5 mt-auto flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Ideal for</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-accent-red font-bold">Daily Summer Fits & Layering</span>
            </div>
          </div>

          {/* Card 2: Premium Fabric */}
          <div className="border border-accent-red/20 bg-accent-red/[0.01] rounded-[2rem] p-8 md:p-12 hover:border-accent-red/40 transition-all group flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-accent-red text-white text-[8px] font-bold uppercase tracking-[0.4em] px-6 py-2 rounded-bl-2xl">
              Highly Recommended
            </div>

            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="px-5 py-2 rounded-full border border-accent-red/30 text-[9px] uppercase tracking-[0.3em] text-accent-red font-bold bg-accent-red/10">
                  Tier 02
                </span>
                <span className="text-accent-red transition-colors duration-300 font-display text-3xl font-bold">
                  300 GSM
                </span>
              </div>
              
              <h2 className="font-display text-3xl font-black tracking-tight text-white mb-6 uppercase">
                Premium Weight <br/>
                <span className="text-accent-red italic font-serif text-2xl lowercase font-normal">the streetwear armor</span>
              </h2>

              <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-light">
                Our signature heavyweight masterpiece. Knitted with high-density threads, it offers an incredibly thick, structured, and boxy silhouette that holds its perfect shape—specifically crafted to carry thick embroidery threads flawlessly.
              </p>

              {/* Specs */}
              <ul className="space-y-4 mb-8">
                <SpecItem icon={<Flame className="h-4 w-4 text-accent-red" />} text="300 GSM Double-Knit Cotton Interlock" />
                <SpecItem icon={<Cpu className="h-4 w-4 text-accent-red" />} text="Heavy Stiff Drape for Boxy Oversized Look" />
                <SpecItem icon={<ShieldCheck className="h-4 w-4 text-accent-red" />} text="High Tensile Stitch Retention & Anti-Pilling" />
              </ul>
            </div>

            <div className="pt-6 border-t border-white/5 mt-auto flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Ideal for</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-accent-red font-bold">Statement Streetwear & Embroidery Drops</span>
            </div>
          </div>

        </div>

        {/* Deep Specs Table */}
        <div className="border border-white/5 rounded-3xl p-8 bg-white/[0.01]">
          <h3 className="font-display text-xl font-bold tracking-tight text-white mb-8 uppercase">Technical Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[9px] uppercase tracking-[0.3em] font-bold text-white/60">
                  <th className="py-4">Property</th>
                  <th className="py-4">Normal Tier (200 GSM)</th>
                  <th className="py-4">Premium Tier (300 GSM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <TableRow prop="Yarn Type" val1="100% Combed Ringspun Cotton" val2="100% Double-Knit Luxury Cotton" />
                <TableRow prop="Fabric Structure" val1="Single Jersey" val2="Heavy Interlock Structure" />
                <TableRow prop="Silhouette Shape" val1="Relaxed, fluid, soft drape" val2="Stiff, boxy, structured streetwear fit" />
                <TableRow prop="Embroidery Strength" val1="Standard embroidery retention" val2="Perfect heavy calligraphy & dense embroidery" />
                <TableRow prop="Anti-Shrink treatment" val1="Pre-shrunk (tested up to 30 washes)" val2="Max stability pre-shrunk (unbreakable)" />
                <TableRow prop="Ideal Climate" val1="Warm Summer afternoons & Daily casuals" val2="Year-round luxury comfort & Statement fit" />
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

function SpecItem({ icon, text }) {
  return (
    <li className="flex items-center gap-3 text-xs text-white/80">
      <div className="shrink-0">{icon}</div>
      <span className="font-light">{text}</span>
    </li>
  );
}

function TableRow({ prop, val1, val2 }) {
  return (
    <tr className="hover:bg-white/[0.01]">
      <td className="py-4 font-bold text-white/80 text-xs uppercase tracking-wider">{prop}</td>
      <td className="py-4 text-xs font-light">{val1}</td>
      <td className="py-4 text-xs font-light text-white">{val2}</td>
    </tr>
  );
}
