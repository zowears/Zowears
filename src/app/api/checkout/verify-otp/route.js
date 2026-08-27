/**
 * POST /api/checkout/verify-otp
 *
 * Body: { phone: string, code: string }
 *
 * Checks the supplied 6-digit code against the server-side OTP store for the
 * given (normalised) phone number.
 *
 * Responses:
 *   200 { valid: true }
 *   200 { valid: false, error: "reason" }
 *   400 { valid: false, error: "validation message" }
 *   500 { valid: false, error: "internal error" }
 */

import { normalizePhone } from "@/lib/validation";
import { verifyWhatsAppOTP } from "@/lib/whatsapp";

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return Response.json(
        { valid: false, error: "Phone and code are required" },
        { status: 400 }
      );
    }

    // Normalise the phone so we look up the correct key in the OTP store
    let normalized;
    try {
      normalized = normalizePhone(phone);
    } catch (err) {
      return Response.json(
        { valid: false, error: err.message },
        { status: 400 }
      );
    }

    const result = verifyWhatsAppOTP(normalized, code);

    return Response.json(result);
  } catch (err) {
    console.error("[verify-otp]", err);
    return Response.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
