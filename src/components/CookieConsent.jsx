"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Cookie, X } from "lucide-react";
import { getConsent, setConsent } from "@/lib/analytics";

export function CookieConsent() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    // Show banner after brief delay if user hasn't made a choice yet
    const current = getConsent();
    if (current === "pending") {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    setConsent("granted");
    setVisible(false);
  };

  const handleDecline = () => {
    setConsent("denied");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] rounded-xl border border-white/10 bg-[#0a0a0a]/95 p-6 shadow-2xl backdrop-blur-md text-white"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-accent-red">
              <Cookie className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Privacy & Analytics
                </span>
                <button
                  onClick={handleDecline}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                We use cookies and conversion tracking to elevate your shopping experience, analyze store traffic, and optimize performance across our collection drops.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 rounded-md bg-white px-4 py-2 text-center text-xs font-semibold text-black hover:bg-zinc-200 transition-colors"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={handleDecline}
                  className="rounded-md border border-zinc-800 bg-transparent px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Essential Only
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
