/**
 * emailVerify.js — Abstracted email deliverability / verification service
 *
 * Used by the /api/checkout/verify-email route to catch:
 *   - Disposable / throwaway email addresses (mailinator, guerrillamail, etc.)
 *   - Invalid domains (MX record doesn't exist)
 *   - Obviously malformed addresses that slip past client-side regex
 *
 * Recommended providers for Pakistan / global use:
 *   1. Abstract API — https://www.abstractapi.com/email-verification
 *      Free tier: 100 req/month. Good for low-volume stores.
 *   2. ZeroBounce   — https://www.zerobounce.net
 *      Free tier: 100 credits. More detailed bounce classification.
 *
 * Required environment variables (set in .env.local, see .env.example):
 *   EMAIL_VERIFY_PROVIDER  one of: abstractapi | zerobounce | stub
 *   + provider-specific keys (see .env.example)
 */

/**
 * Verify the deliverability of an email address.
 *
 * @param {string} email
 * @returns {Promise<{
 *   deliverable: boolean,
 *   reason?: string,        // human-readable explanation if not deliverable
 *   raw?: object            // full provider response for logging
 * }>}
 */
export async function verifyEmail(email) {
  const provider = process.env.EMAIL_VERIFY_PROVIDER || "stub";

  // ── DEVELOPMENT STUB ──────────────────────────────────────────────────────
  // Accepts all well-formed addresses. Rejects obvious disposable domains.
  // This lets you build/test the flow without burning API credits.
  if (provider === "stub") {
    const disposableDomains = [
      "mailinator.com",
      "guerrillamail.com",
      "tempmail.com",
      "throwam.com",
      "yopmail.com",
      "sharklasers.com",
      "fakeinbox.com",
      "trashmail.com",
      "dispostable.com",
      "maildrop.cc",
    ];

    const domain = email.split("@")[1]?.toLowerCase() || "";

    if (disposableDomains.includes(domain)) {
      return {
        deliverable: false,
        reason: "Disposable email addresses are not accepted",
      };
    }

    // In stub mode, everything else is accepted
    console.log(`[Email Verify STUB] Accepted: ${email}`);
    return { deliverable: true };
  }

  // ── ABSTRACT API ─────────────────────────────────────────────────────────
  // TODO: Set EMAIL_VERIFY_PROVIDER=abstractapi in .env.local, then:
  //   1. Sign up at https://www.abstractapi.com/email-verification
  //   2. Grab your API key from the dashboard
  //   3. Set ABSTRACT_API_KEY=<your_key> in .env.local
  if (provider === "abstractapi") {
    const key = process.env.ABSTRACT_API_KEY;
    if (!key) {
      console.warn("[emailVerify] ABSTRACT_API_KEY not set — falling back to accept");
      return { deliverable: true, reason: "API key missing — bypassed" };
    }

    const res = await fetch(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${key}&email=${encodeURIComponent(email)}`
    );
    const data = await res.json();

    // Abstract API deliverability field: "DELIVERABLE" | "UNDELIVERABLE" | "RISKY" | "UNKNOWN"
    const deliverable =
      data.deliverability === "DELIVERABLE" ||
      data.deliverability === "UNKNOWN"; // be lenient on UNKNOWN to avoid false positives

    const isDisposable = data.is_disposable_email?.value === true;

    if (isDisposable) {
      return {
        deliverable: false,
        reason: "Disposable email addresses are not accepted",
        raw: data,
      };
    }

    if (!deliverable) {
      return {
        deliverable: false,
        reason: "This email address appears invalid or unreachable",
        raw: data,
      };
    }

    return { deliverable: true, raw: data };
  }

  // ── ZEROBOUNCE ────────────────────────────────────────────────────────────
  // TODO: Set EMAIL_VERIFY_PROVIDER=zerobounce in .env.local, then:
  //   1. Sign up at https://www.zerobounce.net
  //   2. Grab your API key from API → API Key
  //   3. Set ZEROBOUNCE_API_KEY=<your_key> in .env.local
  if (provider === "zerobounce") {
    const key = process.env.ZEROBOUNCE_API_KEY;
    if (!key) {
      console.warn("[emailVerify] ZEROBOUNCE_API_KEY not set — falling back to accept");
      return { deliverable: true, reason: "API key missing — bypassed" };
    }

    const res = await fetch(
      `https://api.zerobounce.net/v2/validate?api_key=${key}&email=${encodeURIComponent(email)}&ip_address=`
    );
    const data = await res.json();

    // ZeroBounce status values: valid, invalid, catch-all, unknown, spamtrap, abuse, do_not_mail
    const deliverable = ["valid", "catch-all", "unknown"].includes(data.status);

    if (!deliverable) {
      return {
        deliverable: false,
        reason:
          data.sub_status === "disposable"
            ? "Disposable email addresses are not accepted"
            : "This email address appears invalid or unreachable",
        raw: data,
      };
    }

    return { deliverable: true, raw: data };
  }

  // Unknown provider — fail open (don't block orders due to config error)
  console.error(`[emailVerify] Unknown provider: ${provider}`);
  return { deliverable: true, reason: "Verification bypassed — unknown provider" };
}
