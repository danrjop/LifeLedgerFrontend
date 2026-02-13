import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for Cognito auth token cookies (set by Amplify with ssr: true)
  const cognitoTokenCookie = request.cookies
    .getAll()
    .find(
      (cookie) =>
        cookie.name.includes("CognitoIdentityServiceProvider") &&
        cookie.name.endsWith(".idToken")
    );

  const isAuthenticated = !!cognitoTokenCookie;

  // Protect dashboard routes — redirect to login if not authenticated
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect authenticated users away from login/signup
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
