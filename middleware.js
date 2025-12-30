import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/login", "/register","/login-otp"];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET
);

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // 🔓 PUBLIC ROUTES
  if (isPublicRoute) {
    if (!token) return NextResponse.next();

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      if (payload.role === "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (payload.role === "employee") {
        return NextResponse.redirect(
          new URL("/employee-dashboard", req.url)
        );
      }
    } catch {
      return NextResponse.next();
    }
  }

  // 🔒 PROTECTED ROUTES
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Root redirect
    if (pathname === "/") {
      if (payload.role === "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (payload.role === "employee") {
        return NextResponse.redirect(
          new URL("/employee-dashboard", req.url)
        );
      }
    }

    // Admin-only routes
    if (pathname.startsWith("/dashboard") && payload.role !== "admin") {
      return NextResponse.redirect(
        new URL("/employee-dashboard", req.url)
      );
    }

    // Employee-only routes
    if (
      pathname.startsWith("/employee-dashboard") &&
      payload.role !== "employee"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
