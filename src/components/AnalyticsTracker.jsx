"use client";

import { useEffect, useRef } from "react";
import { getVisitorIdentity, getUtmParams, initMetaCookies } from "@/lib/analytics";

export function AnalyticsTracker() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initMetaCookies();

      const { visitorId, sessionId } = getVisitorIdentity();
      const utmParams = getUtmParams();
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      // Register / update session and record heartbeat
      const sendHeartbeat = () => {
        fetch(`${backendUrl}/analytics/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName: "session_ping",
            visitorId,
            sessionId,
            path: window.location.pathname,
            referrer: document.referrer || "",
            utmParams,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {});
      };

      sendHeartbeat();

      // Periodically refresh heartbeat every 60s while tab is active to keep live visitor count accurate
      const interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          sendHeartbeat();
        }
      }, 60000);

      return () => clearInterval(interval);
    }
  }, []);

  return null;
}
