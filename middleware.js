import { NextResponse } from "next/server";

const publicRoutes = ["/register", "/login"];

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isPublicRoute = publicRoutes.includes(pathname);

  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
  
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
