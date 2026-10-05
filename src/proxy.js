import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/admin/login"];
const JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  "f0d086119ef4c436832dbf3e1a7d6ba71d1313e6d4c21d8a3360d9c66251bf2708ffdd61d35d91d33c219f8deab7daf99b619ed840bbe80f48e4f211ba53d9ce";

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  // Only protect /admin/* routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const token =
    req.cookies.get("__admin_token")?.value ||
    req.cookies.get("__admin_token_client")?.value;

  // If user is already authenticated and visits /admin/login, send to /admin
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (token) {
      try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL("/admin", req.url));
      } catch {
        // Token invalid, allow login page
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (err) {
    console.error("[Proxy] Token invalid or expired:", err.message);
    const res = NextResponse.redirect(new URL("/admin/login", req.url));
    res.cookies.set("__admin_token", "", { maxAge: 0, path: "/" });
    res.cookies.set("__admin_token_client", "", { maxAge: 0, path: "/" });
    return res;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
