import { NextResponse } from "next/server";
import crypto from "crypto";

// SHA-256 hashing helper for Meta User Data
function sha256(value) {
  if (!value || typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

// Normalize Pakistani / International phone number to E.164 without '+' or leading zeros
function normalizePhone(phone) {
  if (!phone || typeof phone !== "string") return undefined;
  // Remove all non-numeric characters
  let digits = phone.replace(/\D/g, "");
  // If Pakistani number starting with 0, replace with 92
  if (digits.startsWith("0") && digits.length === 11) {
    digits = "92" + digits.substring(1);
  }
  return digits || undefined;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { event_name, event_id, event_source_url, user_data = {}, custom_data = {} } = body;

    const pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
      console.warn("[Meta CAPI Warning] META_PIXEL_ID or META_ACCESS_TOKEN not set in environment.");
      return NextResponse.json({
        success: false,
        warning: "CAPI credentials missing in environment variables",
      });
    }

    // Extract Client IP and User Agent from request headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : request.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";

    // Parse cookies from request headers or body
    const cookieHeader = request.headers.get("cookie") || "";
    const parseCookie = (name) => {
      const match = cookieHeader.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
      return match ? decodeURIComponent(match[3]) : null;
    };

    const fbp = user_data.fbp || parseCookie("_fbp") || undefined;
    const fbc = user_data.fbc || parseCookie("_fbc") || undefined;

    // Hash user data fields according to Meta guidelines
    const hashedUserData = {
      client_ip_address: clientIp,
      client_user_agent: userAgent,
    };

    if (user_data.em) {
      const hashedEmail = sha256(user_data.em);
      if (hashedEmail) hashedUserData.em = [hashedEmail];
    }

    if (user_data.ph) {
      const cleanPhone = normalizePhone(user_data.ph);
      if (cleanPhone) {
        const hashedPhone = sha256(cleanPhone);
        if (hashedPhone) hashedUserData.ph = [hashedPhone];
      }
    }

    if (user_data.fn) {
      const hfn = sha256(user_data.fn);
      if (hfn) hashedUserData.fn = [hfn];
    }

    if (user_data.ln) {
      const hln = sha256(user_data.ln);
      if (hln) hashedUserData.ln = [hln];
    }

    if (user_data.ct) {
      const hct = sha256(user_data.ct);
      if (hct) hashedUserData.ct = [hct];
    }

    if (user_data.zp) {
      const hzp = sha256(user_data.zp);
      if (hzp) hashedUserData.zp = [hzp];
    }

    if (user_data.country) {
      const hcountry = sha256(user_data.country);
      if (hcountry) hashedUserData.country = [hcountry];
    }

    if (fbp) hashedUserData.fbp = fbp;
    if (fbc) hashedUserData.fbc = fbc;

    // Build the Meta Conversions API event object
    const eventPayload = {
      event_name: event_name || "PageView",
      event_time: Math.floor(Date.now() / 1000),
      event_id: event_id, // Shared with client pixel for deduplication
      event_source_url: event_source_url || "https://zowears.com",
      action_source: "website",
      user_data: hashedUserData,
      custom_data: {
        ...custom_data,
        currency: custom_data.currency || "PKR",
      },
    };

    const metaPayload = {
      data: [eventPayload],
    };

    // Test Event Code for Meta Events Manager testing
    const testCode = process.env.META_TEST_EVENT_CODE || body.test_event_code;
    if (testCode) {
      metaPayload.test_event_code = testCode;
    }

    // Dispatch to Meta Graph API
    const metaEndpoint = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

    const metaRes = await fetch(metaEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metaPayload),
    });

    const metaData = await metaRes.json();

    if (!metaRes.ok) {
      console.error("[Meta CAPI Error Response]:", metaData);
      return NextResponse.json(
        {
          success: false,
          error: metaData.error?.message || "Meta API request failed",
          metaData,
        },
        { status: metaRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      events_received: metaData.events_received,
      fbtrace_id: metaData.fbtrace_id,
      dedup_event_id: event_id,
    });
  } catch (error) {
    console.error("[Meta CAPI Exception]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
