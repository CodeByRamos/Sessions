import { NextRequest, NextResponse } from "next/server";
import { clearAuthSession, clearSessionCookie, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await clearAuthSession(request.cookies.get(SESSION_COOKIE)?.value);
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);

  return response;
}
