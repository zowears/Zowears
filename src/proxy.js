import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/admin/login"];
const SECRETS = [
  process.env.ADMIN_JWT_SECRET,
  "f0d086119ef4c436832dbf3e1a7d6ba71d1313e6d4c21d8a3360d9c66251bf2708ffdd61d35d91d33c219f8deab7daf99b619ed840bbe80f48e4f211ba53d9ce"
].filter(Boolean);

async function verifyToken(token) {
  if (!token) return false;
  for (const secretStr of SECRETS) {
    try {
      const secret = new TextEncoder().encode(secretStr.trim());
      const res = await jwtVerify(token, secret);
      if (res?.payload) return true;
    } catch {}
  }
  return false;
}

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  // Only protect /admin/* routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const token =
    req.cookies.get("__admin_token")?.value ||
    req.cookies.get("__admin_token_client")?.value;

  const targetHost = req.nextUrl.hostname === "zowears.com" ? "https://www.zowears.com" : req.url;

  // If user is visiting /admin/login
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (token && (await verifyToken(token))) {
      return NextResponse.redirect(new URL("/admin", targetHost));
    }
    return NextResponse.next();
  }

  // If on a protected /admin route and no token is in cookie
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", targetHost));
  }

  // Verify token with all known secrets
  const isValid = await verifyToken(token);
  if (isValid) {
    return NextResponse.next();
  }

  // Token is present but failed verification: clear cookie and redirect
  console.warn("[Proxy] Token invalid or expired for pathname:", pathname);
  const res = NextResponse.redirect(new URL("/admin/login", targetHost));
  const isProd = req.nextUrl.hostname.includes("zowears.com");
  res.cookies.set("__admin_token", "", { maxAge: 0, path: "/" });
  res.cookies.set("__admin_token_client", "", { maxAge: 0, path: "/" });
  if (isProd) {
    res.cookies.set("__admin_token", "", { maxAge: 0, path: "/", domain: ".zowears.com" });
    res.cookies.set("__admin_token_client", "", { maxAge: 0, path: "/", domain: ".zowears.com" });
  }
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
