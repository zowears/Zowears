const messages = [
  "FREE SHIPPING IN PAKISTAN ON ALL DROPS",
  "CHOOSE YOUR FABRIC: NORMAL & PREMIUM TIERS",
  "NEW DROP — ARABIC CALLIGRAPHY SERIES",
  "HEAVYWEIGHT HOODIES, PRINTED & OVERSIZED PLAIN TEES",
];

export function AnnouncementBar() {
  const loop = [...messages, ...messages, ...messages];
  return (
    <div className="relative overflow-hidden border-b border-black/10 bg-[#111111] py-2 text-[10px] uppercase tracking-[0.25em] text-white/70">
      <div className="animate-marquee flex w-max gap-12 whitespace-nowrap">
        {loop.map((m, i) => (
          <span key={i} className="flex items-center gap-12">
            {m}
            <span className="text-accent-red">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
