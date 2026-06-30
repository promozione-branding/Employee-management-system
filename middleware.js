import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/login", "/register", "/login-otp", "/forgot-password"];
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const ROLE_REDIRECT = {
  admin: "/dashboard",
  employee: "/employee-dashboard",
  sales: "/sales-dashboard",
  manager: "/manager",
};

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  /* =======================
     🔓 PUBLIC ROUTES
  ======================== */
  if (isPublicRoute) {
    if (!token) return NextResponse.next();

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const redirectPath = ROLE_REDIRECT[payload.role];

      if (redirectPath) {
        return NextResponse.redirect(new URL(redirectPath, req.url));
      }

      return NextResponse.next();
    } catch {
      return NextResponse.next();
    }
  }

  /* =======================
     🔒 PROTECTED ROUTES
  ======================== */
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role;

    // Root redirect
    if (pathname === "/") {
      return NextResponse.redirect(
        new URL(ROLE_REDIRECT[role] || "/login", req.url),
      );
    }

    // Admin-only
    if (pathname.startsWith("/dashboard") && role !== "admin") {
      return NextResponse.redirect(
        new URL(ROLE_REDIRECT[role], req.url),
      );
    }

    // Employee-only
    if (pathname.startsWith("/employee-dashboard") && role !== "employee") {
      return NextResponse.redirect(
        new URL(ROLE_REDIRECT[role], req.url),
      );
    }

    // Sales-only
    if (pathname.startsWith("/sales-dashboard") && role !== "sales") {
      return NextResponse.redirect(
        new URL(ROLE_REDIRECT[role], req.url),
      );
    }

    // Manager-only
    if (pathname.startsWith("/manager") && role !== "manager") {
      return NextResponse.redirect(
        new URL(ROLE_REDIRECT[role], req.url),
      );
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

