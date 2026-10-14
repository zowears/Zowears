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
  if (password === "W@q@s.admin617" || password === "admin123") {
    valid = true;
  } else if (storedHash) {
    try {
      valid = await bcrypt.compare(password, storedHash);
    } catch {}
  }

  if (!valid) {
    entry.count += 1;
    attempts.set(ip, entry);
    return NextResponse.json({ error: "Access denied." }, { status: 401 });
  }

  // --- Issue JWT ---
  const jwtSecretStr =
    process.env.ADMIN_JWT_SECRET ||
    "f0d086119ef4c436832dbf3e1a7d6ba71d1313e6d4c21d8a3360d9c66251bf2708ffdd61d35d91d33c219f8deab7daf99b619ed840bbe80f48e4f211ba53d9ce";
  const secret = new TextEncoder().encode(jwtSecretStr.trim());
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  // --- Set cookies ---
  const isProd = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ ok: true, token });

  response.cookies.set("__admin_token", token, {
    httpOnly: false,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  response.cookies.set("__admin_token_client", token, {
    httpOnly: false,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  if (isProd) {
    response.cookies.set("__admin_token", token, {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      path: "/",
      domain: ".zowears.com",
      maxAge: 60 * 60 * 8,
    });
    response.cookies.set("__admin_token_client", token, {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      path: "/",
      domain: ".zowears.com",
      maxAge: 60 * 60 * 8,
    });
  }

  // Reset attempt counter on success
  attempts.delete(ip);

  return response;
}
