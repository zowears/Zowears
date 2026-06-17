import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/admin/login"];

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  // Only protect /admin/* routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Allow the login page itself
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = req.cookies.get("__admin_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    // Token invalid or expired — clear cookie and redirect
    const res = NextResponse.redirect(new URL("/admin/login", req.url));
    res.cookies.set("__admin_token", "", { maxAge: 0, path: "/" });
    return res;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
