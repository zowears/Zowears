"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsTracker() {
  const initialized = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      
      // Register unique site visit
      fetch("http://localhost:5000/api/analytics/visit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      }).catch(console.error);
    }
  }, []);

  return null;
}
