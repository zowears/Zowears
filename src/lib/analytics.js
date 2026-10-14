/**
 * Zowears Centralized Analytics & Meta Tracking Engine
 * Supports:
 *  - Client-side Meta Pixel with full standard e-commerce schemas
 *  - Server-side Meta Conversions API (CAPI) with SHA-256 hashed user data
 *  - Deduplication via shared event_id
 *  - First-party visitor, session, UTM, and full-funnel tracking
 *  - Cookie consent integration
 *  - Real-time debug mode for Meta Events Manager & Pixel Helper
 */

// Helper to check if running in browser
const isBrowser = () => typeof window !== "undefined";

// Debug mode flag (enabled in development or via query/localStorage)
export const isDebugMode = () => {
  if (!isBrowser()) return false;
  return (
    process.env.NODE_ENV !== "production" ||
    window.location.search.includes("debug_tracking=true") ||
    window.localStorage?.getItem("zowears_debug_tracking") === "true"
  );
};

// Console debug logger
const logDebug = (title, data) => {
  if (isDebugMode()) {
    console.groupCollapsed(`%c[Zowears Analytics] ${title}`, "color: #ff3366; font-weight: bold;");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Payload:", data);
    console.groupEnd();
  }
};

// Cryptographic UUID v4 generator for shared event_id
export const generateEventId = () => {
  if (isBrowser() && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Cookie utilities
export const getCookie = (name) => {
  if (!isBrowser()) return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
};

export const setCookie = (name, value, days = 90) => {
  if (!isBrowser()) return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const domain = window.location.hostname.includes("zowears.com") ? "; domain=.zowears.com" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/${domain}; SameSite=Lax`;
};

// Initialize or retrieve Visitor ID and Session ID
export const getVisitorIdentity = () => {
  if (!isBrowser()) return { visitorId: "", sessionId: "" };

  let visitorId = getCookie("zw_vid") || localStorage.getItem("zw_vid");
  if (!visitorId) {
    visitorId = "vid_" + generateEventId();
    setCookie("zw_vid", visitorId, 365);
    localStorage.setItem("zw_vid", visitorId);
  }

  // Session ID expires after 30 mins of inactivity or browser session
  let sessionId = sessionStorage.getItem("zw_sid");
  if (!sessionId) {
    sessionId = "sid_" + generateEventId();
    sessionStorage.setItem("zw_sid", sessionId);
  }

  return { visitorId, sessionId };
};

// Capture fbclid from URL and set _fbc cookie according to Meta specifications
export const initMetaCookies = () => {
  if (!isBrowser()) return;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get("fbclid");

    if (fbclid) {
      // Format: fb.1.timestamp.fbclid
      const fbc = `fb.1.${Date.now()}.${fbclid}`;
      setCookie("_fbc", fbc, 90);
      logDebug("Captured fbclid and set _fbc cookie", fbc);
    }

    // Ensure _fbp exists or generate first-party fallback if not set by Meta script
    let fbp = getCookie("_fbp");
    if (!fbp) {
      fbp = `fb.1.${Date.now()}.${Math.floor(Math.random() * 1e10)}`;
      setCookie("_fbp", fbp, 90);
    }
  } catch (err) {
    console.error("Failed to initialize Meta cookies:", err);
  }
};

// UTM parameters parser
export const getUtmParams = () => {
  if (!isBrowser()) return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
      const val = params.get(key);
      if (val) utm[key] = val;
    });

    // Also persist first landing UTM to session storage for attribution
    if (Object.keys(utm).length > 0) {
      const existing = sessionStorage.getItem("zw_initial_utm");
      if (!existing) {
        sessionStorage.setItem("zw_initial_utm", JSON.stringify(utm));
      }
      return utm;
    }

    const saved = sessionStorage.getItem("zw_initial_utm");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// Consent Management
export const getConsent = () => {
  if (!isBrowser()) return "pending";
  return localStorage.getItem("zowears_cookie_consent") || "pending";
};

export const setConsent = (status) => {
  if (!isBrowser()) return;
  localStorage.setItem("zowears_cookie_consent", status);
  if (status === "granted") {
    if (window.fbq) {
      window.fbq("consent", "grant");
    }
    // Fire pending pageview
    trackPageView(window.location.pathname);
  } else if (status === "denied") {
    if (window.fbq) {
      window.fbq("consent", "revoke");
    }
  }
};

// Deduplication cache to prevent React 19 double-firing in StrictMode
const recentEvents = new Map();
const isDuplicate = (key, cooldownMs = 1500) => {
  const now = Date.now();
  if (recentEvents.has(key)) {
    const last = recentEvents.get(key);
    if (now - last < cooldownMs) return true;
  }
  recentEvents.set(key, now);
  return false;
};

/**
 * Central Track Dispatcher
 * Sends to:
 * 1. Meta Pixel (browser)
 * 2. Meta Conversions API (server route /api/capi)
 * 3. First-party analytics API
 */
export async function track(eventName, data = {}, options = {}) {
  if (!isBrowser()) return;

  const eventId = options.eventId || generateEventId();
  const isCustom = Boolean(options.isCustomEvent);
  const dedupeKey = `${eventName}_${data.content_name || data.content_ids?.[0] || ""}_${data.value || ""}`;

  if (isDuplicate(dedupeKey)) {
    logDebug(`Skipped duplicate event: ${eventName}`, { eventId, data });
    return;
  }

  const consent = getConsent();
  const consentGranted = consent === "granted";
  const { visitorId, sessionId } = getVisitorIdentity();
  const utmParams = getUtmParams();

  const enrichedData = {
    ...data,
    currency: data.currency || "PKR",
  };

  logDebug(`Triggering Event: ${eventName}`, {
    eventId,
    isCustom,
    consent: consentGranted,
    data: enrichedData,
    userData: options.userData,
  });

  // 1. Meta Pixel (Client-side)
  if (consentGranted && typeof window.fbq === "function") {
    try {
      if (isCustom) {
        window.fbq("trackCustom", eventName, enrichedData, { eventID: eventId });
      } else {
        window.fbq("track", eventName, enrichedData, { eventID: eventId });
      }
    } catch (err) {
      console.error("[Meta Pixel Error]:", err);
    }
  }

  // 2. Meta Conversions API (Server-side via Next.js Route)
  if (consentGranted) {
    try {
      fetch("/api/capi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: eventName,
          event_id: eventId,
          event_source_url: window.location.href,
          user_data: {
            em: options.userData?.email,
            ph: options.userData?.phone,
            fn: options.userData?.firstName,
            ln: options.userData?.lastName,
            ct: options.userData?.city,
            zp: options.userData?.zip,
            country: options.userData?.country || "PK",
            fbp: getCookie("_fbp"),
            fbc: getCookie("_fbc"),
          },
          custom_data: enrichedData,
        }),
      }).catch((e) => console.error("[CAPI Dispatch Error]:", e));
    } catch (err) {
      console.error("[CAPI Fetch Error]:", err);
    }
  }

  // 3. First-party visitor & funnel tracking (Internal DB)
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    fetch(`${backendUrl}/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId,
        visitorId,
        sessionId,
        path: window.location.pathname,
        referrer: document.referrer || "",
        utmParams,
        payload: enrichedData,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silently fail if backend offline to avoid impacting UX
    });
  } catch {
    // Ignore offline errors
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Standard E-Commerce Tracking Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Route / PageView tracking
 */
export function trackPageView(path) {
  const eventId = generateEventId();
  track("PageView", {
    path: path || window.location.pathname,
    title: document.title,
  }, { eventId });
}

/**
 * Product detail view
 */
export function trackViewContent(product) {
  if (!product) return;
  const productId = String(product.id || product._id || "");
  const price = Number(product.price) || 0;

  track("ViewContent", {
    content_name: product.name,
    content_ids: [productId],
    content_type: "product",
    contents: [
      {
        id: productId,
        quantity: 1,
        item_price: price,
      },
    ],
    value: price,
    currency: "PKR",
    category: product.category || product.categories?.[0] || "Streetwear",
  });
}

/**
 * Add To Cart
 */
export function trackAddToCart(item, cartTotal = 0) {
  if (!item) return;
  const productId = String(item.productId || item.id || "");
  const price = Number(item.price) || 0;
  const qty = Number(item.qty || item.quantity) || 1;

  track("AddToCart", {
    content_name: item.name,
    content_ids: [productId],
    content_type: "product",
    contents: [
      {
        id: productId,
        quantity: qty,
        item_price: price,
      },
    ],
    value: price * qty,
    currency: "PKR",
    num_items: qty,
    cart_total: cartTotal,
  });
}

/**
 * Initiate Checkout
 */
export function trackInitiateCheckout(items = [], subtotal = 0) {
  if (!items || items.length === 0) return;

  const contentIds = items.map((i) => String(i.productId || i.id || ""));
  const totalQty = items.reduce((acc, i) => acc + (Number(i.qty || i.quantity) || 1), 0);
  const contents = items.map((i) => ({
    id: String(i.productId || i.id || ""),
    quantity: Number(i.qty || i.quantity) || 1,
    item_price: Number(i.price) || 0,
  }));

  track("InitiateCheckout", {
    content_ids: contentIds,
    content_type: "product",
    contents,
    value: subtotal,
    currency: "PKR",
    num_items: totalQty,
  });
}

/**
 * Add Payment Info
 */
export function trackAddPaymentInfo(paymentMethod, subtotal = 0, items = []) {
  const contentIds = items.map((i) => String(i.productId || i.id || ""));
  track("AddPaymentInfo", {
    payment_method: paymentMethod,
    content_ids: contentIds,
    content_type: "product",
    value: subtotal,
    currency: "PKR",
    num_items: items.length,
  });
}

/**
 * Purchase
 */
export function trackPurchase(order, customerData = {}) {
  if (!order) return;

  const orderId = String(order._id || order.id || generateEventId());
  const items = order.items || [];
  const contentIds = items.map((i) => String(i.productId || i.id || ""));
  const contents = items.map((i) => ({
    id: String(i.productId || i.id || ""),
    quantity: Number(i.quantity || i.qty) || 1,
    item_price: Number(i.price) || 0,
  }));
  const value = Number(order.totalAmount || order.subtotal) || 0;
  const numItems = items.reduce((acc, i) => acc + (Number(i.quantity || i.qty) || 1), 0);

  track("Purchase", {
    content_ids: contentIds,
    content_name: `Order #${orderId}`,
    content_type: "product",
    contents,
    value,
    currency: "PKR",
    num_items: numItems,
    order_id: orderId,
  }, {
    eventId: orderId, // Crucial for deduplication with webhook/server purchase
    userData: {
      email: customerData.email || order.email,
      phone: customerData.phone || order.phone || order.shippingAddress?.phone,
      firstName: customerData.firstName || order.shippingAddress?.firstName,
      lastName: customerData.lastName || order.shippingAddress?.lastName,
      city: customerData.city || order.shippingAddress?.city,
      zip: customerData.zip || order.shippingAddress?.zip,
      country: "PK",
    },
  });
}

/**
 * Search
 */
export function trackSearch(searchQuery, resultsCount = 0) {
  if (!searchQuery || searchQuery.trim().length === 0) return;

  track("Search", {
    search_string: searchQuery.trim(),
    content_type: "product",
    num_items: resultsCount,
  });
}

/**
 * Category / Collection browsing (Custom Event)
 */
export function trackViewCategory(categoryName, productCount = 0) {
  if (!categoryName) return;

  track("ViewCategory", {
    category_name: categoryName,
    content_type: "product_group",
    num_items: productCount,
  }, { isCustomEvent: true });
}
