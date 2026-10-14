"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { initMetaCookies, trackPageView, getConsent } from "@/lib/analytics";

function PixelRouteTracker({ pixelId }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef("");

  useEffect(() => {
    // Capture fbclid and initialize cookies on mount & URL change
    initMetaCookies();

    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    // Avoid duplicate firing on identical path
    if (lastPath.current !== fullPath) {
      lastPath.current = fullPath;
      if (getConsent() !== "denied") {
        trackPageView(fullPath);
      }
    }
  }, [pathname, searchParams, pixelId]);

  return null;
}

export function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  if (!pixelId) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Meta Pixel] NEXT_PUBLIC_META_PIXEL_ID is not configured in environment variables.");
    }
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            fbq('init', '${pixelId}');
          `,
        }}
      />
      <PixelRouteTracker pixelId={pixelId} />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt="Meta Pixel"
        />
      </noscript>
    </>
  );
}
