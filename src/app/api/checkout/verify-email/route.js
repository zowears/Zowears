/**
 * POST /api/checkout/verify-email
 *
 * Body: { email: string }
 *
 * Runs server-side email deliverability/disposability check via the configured
 * provider (or a local stub blocklist in dev mode).
 *
 * Responses:
 *   200 { deliverable: true }
 *   200 { deliverable: false, reason: "explanation" }
 *   400 { deliverable: false, reason: "validation message" }
 *   500 { deliverable: false, reason: "internal error" }
 */

import { validateEmailFormat } from "@/lib/validation";
import { verifyEmail } from "@/lib/emailVerify";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return Response.json(
        { deliverable: false, reason: "Email is required" },
        { status: 400 }
      );
    }

    // Quick client-style format check before burning API credits
    if (!validateEmailFormat(email)) {
      return Response.json(
        { deliverable: false, reason: "Invalid email format" },
        { status: 400 }
      );
    }

    const result = await verifyEmail(email);

    return Response.json(result);
  } catch (err) {
    console.error("[verify-email]", err);
    // Fail open — don't block orders due to email API errors
    return Response.json({ deliverable: true, reason: "Verification service unavailable" });
  }
}
