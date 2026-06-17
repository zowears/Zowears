import React from "react";

export const metadata = {
  title: "Privacy & Terms | ZOWEARS",
  description: "Zowears privacy policy and terms of service.",
};

export default function PrivacyTermsPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-background relative overflow-hidden">
      <div className="noise" />
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-accent-red/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8 flex items-center gap-4">
          <span className="h-px w-12 bg-accent-red" />
          <span className="text-xs uppercase tracking-[0.4em] text-accent-red font-semibold">Legal</span>
        </div>

        <h1 className="text-gradient font-display text-[clamp(48px,10vw,80px)] font-bold leading-none tracking-[-0.04em] mb-12">
          Privacy & <br /> <span className="font-serif-jp italic font-medium text-accent-red [-webkit-text-fill-color:var(--color-accent-red)]">Terms</span>
        </h1>
        
        <div className="space-y-12 text-muted-foreground leading-relaxed border-l border-white/10 pl-6 md:pl-10">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-foreground">Privacy Policy</h2>
            <p>
              Your privacy is important to us. This privacy statement explains the personal data Zowears processes, how Zowears processes it, and for what purposes.
            </p>
            <p>
              We collect data to provide you with the best possible experience when interacting with our store and purchasing our premium embroidered apparel. The data we collect includes your name, shipping address, email address, and payment information. We do not sell your personal data to third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-foreground">Terms of Service</h2>
            <p>
              By accessing and using Zowears's website, you agree to comply with and be bound by the following terms and conditions. If you disagree with any part of these terms, please do not use our website.
            </p>
            <p>
              All designs, including our signature embroidery patterns, graphics, and apparel silhouettes, are the exclusive intellectual property of Zowears Collective. Unauthorized reproduction or distribution is strictly prohibited.
            </p>
            <p>
              We reserve the right to limit the sales of our products to any person, geographic region, or jurisdiction. We may exercise this right on a case-by-case basis. All descriptions of products or product pricing are subject to change at any time without notice.
            </p>
          </section>
          
        </div>
      </div>
    </div>
  );
}
