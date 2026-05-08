import { NextResponse } from "next/server";
import { createAuthSession, setSessionCookie } from "@/lib/auth";
import { createId, readDb, toPublicUser, writeDb, type StoredUser } from "@/lib/db";
import { hashPassword } from "@/lib/security";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!name || !email || password.length < 8) {
    return NextResponse.json(
      { error: "Preencha nome, email e uma senha com pelo menos 8 caracteres." },
      { status: 400 },
    );
  }

  const db = await readDb();

  if (db.users.some((user) => user.email.toLowerCase() === email)) {
    return NextResponse.json(
      { error: "Já existe uma conta com esse email." },
      { status: 409 },
    );
  }

  const createdAt = new Date().toISOString();
  const username = email.split("@")[0].replace(/[^a-z0-9._-]/gi, "").toLowerCase();
  const user: StoredUser = {
    id: createId("user"),
    username: username || "surfista",
    name,
    email,
    passwordHash: hashPassword(password),
    avatarUrl:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=600&q=80",
    level: 1,
    homeBeach: "Praia do Tombo",
    mainBoard: "Prancha favorita",
    favoriteBoard: "Prancha favorita",
    skillLevel: "iniciante",
    bio: "Surfista em evolução, registrando cada queda, remada e memória.",
    totalSessions: 0,
    streak: 0,
    xp: 0,
    nextLevelXp: 600,
    createdAt,
    updatedAt: createdAt,
  };

  db.users.push(user);
  await writeDb(db);

  const token = await createAuthSession(user.id);
  const response = NextResponse.json({ user: toPublicUser(user, await readDb()) });
  setSessionCookie(response, token);

  return response;
}
