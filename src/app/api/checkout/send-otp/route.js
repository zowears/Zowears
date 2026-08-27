/**
 * POST /api/checkout/send-otp
 *
 * Body: { phone: string }
 *
 * Normalises the phone number, generates a 6-digit OTP, and dispatches it
 * via the configured WhatsApp provider (or logs it to console in stub mode).
 *
 * Responses:
 *   200 { success: true,  phone: "+923XXXXXXXXX" }
 *   400 { success: false, error: "validation message" }
 *   500 { success: false, error: "internal error" }
 */

import { normalizePhone } from "@/lib/validation";
import { sendWhatsAppOTP } from "@/lib/whatsapp";

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return Response.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Normalise and validate the Pakistani number
    let normalized;
    try {
      normalized = normalizePhone(phone);
    } catch (err) {
      return Response.json(
        { success: false, error: err.message },
        { status: 400 }
      );
    }

    // Dispatch OTP via WhatsApp provider
    const result = await sendWhatsAppOTP(normalized);

    if (!result.success) {
      // The number may not be on WhatsApp — return a specific error so the
      // frontend can show the "prepaid only" fallback message.
      return Response.json(
        {
          success: false,
          error:
            result.error ||
            "Could not send WhatsApp OTP — the number may not be registered on WhatsApp",
          whatsappUnavailable: true,
        },
        { status: 422 }
      );
    }

    return Response.json({ success: true, phone: normalized });
  } catch (err) {
    console.error("[send-otp]", err);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
