import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/profile", "/sessions/new"];
const sessionCookie = "sessions_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  if (request.cookies.get(sessionCookie)?.value) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/sign-in";
  url.searchParams.set("next", pathname);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/profile/:path*", "/sessions/new/:path*"],
};
