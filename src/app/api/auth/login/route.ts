import { NextResponse } from "next/server";
import { createAuthSession, setSessionCookie } from "@/lib/auth";
import { readDb, toPublicUser } from "@/lib/db";
import { verifyPassword } from "@/lib/security";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Informe email e senha para entrar." },
      { status: 400 },
    );
  }

  const db = await readDb();
  const user = db.users.find((item) => item.email.toLowerCase() === email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { error: "Email ou senha inválidos." },
      { status: 401 },
    );
  }

  const token = await createAuthSession(user.id);
  const response = NextResponse.json({ user: toPublicUser(user, db) });
  setSessionCookie(response, token);

  return response;
}
