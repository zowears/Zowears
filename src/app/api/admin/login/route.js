import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
// In-memory rate limiter: { ip -> { count, resetAt } }
const attempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getRateLimitEntry(ip) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    const fresh = { count: 0, resetAt: now + WINDOW_MS };
    attempts.set(ip, fresh);
    return fresh;
  }
  return entry;
}

export async function POST(req) {
  // --- Rate limiting ---
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const entry = getRateLimitEntry(ip);
  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  // --- Parse body ---
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { password } = body || {};
  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // --- Artificial delay (makes timing attacks/brute-force slower) ---
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

  // --- Verify password ---
  const storedHash = process.env.ADMIN_PASSWORD_HASH;

  let valid = false;
  if (storedHash) {
    valid = await bcrypt.compare(password, storedHash);
  }

  if (!valid && !storedHash) {
    console.error("[Admin Auth] ADMIN_PASSWORD_HASH is not set in .env.local");
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  if (!valid) {
    entry.count += 1;
    attempts.set(ip, entry);
    // Generic message — never reveal "wrong password" vs "wrong user"
    return NextResponse.json({ error: "Access denied." }, { status: 401 });
  }

  // --- Issue JWT ---
  const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  // --- Set cookies ---
  const response = NextResponse.json({ ok: true, token });
  response.cookies.set("__admin_token", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  response.cookies.set("__admin_token_client", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  // Reset attempt counter on success
  attempts.delete(ip);

  return response;
}
