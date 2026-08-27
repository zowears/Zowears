/**
 * whatsapp.js — Abstracted WhatsApp OTP service
 *
 * This module is intentionally provider-agnostic. All third-party API calls
 * are behind the two exported functions below. When you have a provider
 * account, fill in the relevant TODO block and delete the others.
 *
 * Recommended providers for Pakistan:
 *   1. Gupshup   — https://www.gupshup.io  (large PK install base)
 *   2. WATI      — https://www.wati.io      (easy REST API, good dashboard)
 *   3. Twilio    — https://www.twilio.com/whatsapp  (most flexible, global)
 *
 * Required environment variables (set in .env.local, see .env.example):
 *   WHATSAPP_PROVIDER      one of: gupshup | wati | twilio
 *   + provider-specific keys (see .env.example)
 *
 * OTP storage:
 *   OTPs are held in a server-side in-memory Map with a 5-minute TTL.
 *   This works fine for a single-process dev/small-prod deployment.
 *   For multi-instance production, swap OTP_STORE for a Redis client call.
 */

// ─── In-Memory OTP Store ──────────────────────────────────────────────────────
// { phone → { code: string, expiresAt: number } }

const OTP_STORE = new Map();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a cryptographically-adequate 6-digit OTP and store it.
 * @param {string} phone  Normalised E.164 phone number (+923XXXXXXXXX)
 * @returns {string}      The generated OTP code
 */
function generateAndStoreOTP(phone) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  OTP_STORE.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS });
  return code;
}

// ─── Provider Dispatch ────────────────────────────────────────────────────────

/**
 * Send a 6-digit WhatsApp OTP to a verified Pakistani mobile number.
 *
 * @param {string} phone  Normalised E.164 phone (+923XXXXXXXXX)
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
export async function sendWhatsAppOTP(phone) {
  const code = generateAndStoreOTP(phone);
  const provider = process.env.WHATSAPP_PROVIDER || "stub";

  // ── DEVELOPMENT STUB ──────────────────────────────────────────────────────
  // When no provider is configured, log the OTP to the server console so you
  // can test the flow without a real WhatsApp account.
  if (provider === "stub" || !process.env.WHATSAPP_PROVIDER) {
    console.log(
      `\n[WhatsApp OTP STUB] Phone: ${phone}  Code: ${code}  (expires in 5 min)\n`
    );
    return { success: true, messageId: "stub-" + Date.now() };
  }

  // ── GUPSHUP ───────────────────────────────────────────────────────────────
  // TODO: Set WHATSAPP_PROVIDER=gupshup in .env.local, then fill in:
  //   GUPSHUP_API_KEY, GUPSHUP_SOURCE_NUMBER, GUPSHUP_APP_NAME
  //
  // Create a WhatsApp template named "otp_verification" in the Gupshup
  // dashboard first, with one body variable: {{1}} for the code.
  if (provider === "gupshup") {
    // TODO: Replace this block with your actual Gupshup template message call
    const res = await fetch("https://api.gupshup.io/wa/api/v1/template/msg", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        apikey: process.env.GUPSHUP_API_KEY,
      },
      body: new URLSearchParams({
        channel: "whatsapp",
        source: process.env.GUPSHUP_SOURCE_NUMBER,
        destination: phone.replace("+", ""),
        "src.name": process.env.GUPSHUP_APP_NAME || "ZowearsOTP",
        template: JSON.stringify({
          id: "YOUR_TEMPLATE_ID_HERE", // TODO: fill in from Gupshup dashboard
          params: [code],
        }),
      }),
    });
    const data = await res.json();
    if (data.status === "submitted") {
      return { success: true, messageId: data.messageId };
    }
    return { success: false, error: data.message || "Gupshup send failed" };
  }

  // ── WATI ──────────────────────────────────────────────────────────────────
  // TODO: Set WHATSAPP_PROVIDER=wati in .env.local, then fill in:
  //   WATI_API_URL (e.g. https://live-mt-server.wati.io/12345), WATI_API_TOKEN
  //
  // Create a template "otp_verification" in the WATI panel with {{1}} for code.
  if (provider === "wati") {
    const res = await fetch(
      `${process.env.WATI_API_URL}/api/v1/sendTemplateMessage?whatsappNumber=${phone.replace("+", "")}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WATI_API_TOKEN}`,
        },
        body: JSON.stringify({
          template_name: "otp_verification", // TODO: match your WATI template name
          broadcast_name: "otp",
          parameters: [{ name: "1", value: code }],
        }),
      }
    );
    const data = await res.json();
    if (data.result) {
      return { success: true, messageId: data.id };
    }
    return { success: false, error: data.info || "WATI send failed" };
  }

  // ── TWILIO WhatsApp ───────────────────────────────────────────────────────
  // TODO: Set WHATSAPP_PROVIDER=twilio in .env.local, then fill in:
  //   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
  //
  // Use a Twilio-approved content template or the sandbox for testing.
  if (provider === "twilio") {
    const credentials = Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
    ).toString("base64");

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          From: process.env.TWILIO_WHATSAPP_FROM, // e.g. whatsapp:+14155238886
          To: `whatsapp:${phone}`,
          Body: `Your Zowears verification code is: *${code}*\n\nThis code expires in 5 minutes. Do not share it with anyone.`,
        }),
      }
    );
    const data = await res.json();
    if (data.sid) {
      return { success: true, messageId: data.sid };
    }
    return { success: false, error: data.message || "Twilio send failed" };
  }

  return { success: false, error: `Unknown provider: ${provider}` };
}

/**
 * Verify a 6-digit OTP code against the stored value for a given phone.
 *
 * @param {string} phone  Normalised E.164 phone (+923XXXXXXXXX)
 * @param {string} code   The code entered by the user
 * @returns {{ valid: boolean, error?: string }}
 */
export function verifyWhatsAppOTP(phone, code) {
  const entry = OTP_STORE.get(phone);

  if (!entry) {
    return { valid: false, error: "No OTP found — please request a new code" };
  }

  if (Date.now() > entry.expiresAt) {
    OTP_STORE.delete(phone);
    return { valid: false, error: "OTP has expired — please request a new code" };
  }

  if (entry.code !== String(code).trim()) {
    return { valid: false, error: "Incorrect code — please try again" };
  }

  // Consume the OTP so it can't be reused
  OTP_STORE.delete(phone);
  return { valid: true };
}
