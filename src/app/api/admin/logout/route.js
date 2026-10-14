import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const isProd = process.env.NODE_ENV === "production";

  for (const name of ["__admin_token", "__admin_token_client"]) {
    response.cookies.set(name, "", {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    if (isProd) {
      response.cookies.set(name, "", {
        httpOnly: false,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        domain: ".zowears.com",
        maxAge: 0,
      });
    }
  }

  return response;
}
