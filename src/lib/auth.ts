import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest, NextResponse } from "next/server";
import type { User } from "@/types/user";
import { readDb, toPublicUser, writeDb } from "@/lib/db";

export const SESSION_COOKIE = "sessions_token";
const SESSION_DAYS = 30;

function expiresAt() {
  const date = new Date();
  date.setDate(date.getDate() + SESSION_DAYS);
  return date;
}

export function newSessionToken() {
  return randomBytes(32).toString("hex");
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt(),
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function createAuthSession(userId: string) {
  const db = await readDb();
  const token = newSessionToken();
  const createdAt = new Date().toISOString();
  const expires = expiresAt().toISOString();

  db.authSessions = db.authSessions.filter(
    (session) => new Date(session.expiresAt).getTime() > Date.now(),
  );
  db.authSessions.push({ token, userId, createdAt, expiresAt: expires });
  await writeDb(db);

  return token;
}

export async function clearAuthSession(token?: string) {
  if (!token) {
    return;
  }

  const db = await readDb();
  db.authSessions = db.authSessions.filter((session) => session.token !== token);
  await writeDb(db);
}

export async function getUserByToken(token?: string): Promise<User | null> {
  if (!token) {
    return null;
  }

  const db = await readDb();
  const authSession = db.authSessions.find(
    (session) =>
      session.token === token && new Date(session.expiresAt).getTime() > Date.now(),
  );

  if (!authSession) {
    return null;
  }

  const user = db.users.find((item) => item.id === authSession.userId);
  return user ? toPublicUser(user, db) : null;
}

export async function getRequestUser(request: NextRequest) {
  return getUserByToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function getOptionalCurrentUser() {
  const cookieStore = await cookies();
  return getUserByToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireCurrentUser() {
  const user = await getOptionalCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}
