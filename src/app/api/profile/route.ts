import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { readDb, toPublicUser, writeDb } from "@/lib/db";
import type { SkillLevel } from "@/types/user";

const skillLevels: SkillLevel[] = [
  "iniciante",
  "intermediário",
  "avançado",
  "competidor",
];

export async function PATCH(request: NextRequest) {
  const currentUser = await getRequestUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: "Faça login para editar o perfil." }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    avatarUrl?: string;
    bio?: string;
    homeBeach?: string;
    skillLevel?: SkillLevel;
    favoriteBoard?: string;
  };
  const db = await readDb();
  const user = db.users.find((item) => item.id === currentUser.id);

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }

  user.name = name;
  user.avatarUrl = body.avatarUrl?.trim() || user.avatarUrl;
  user.bio = body.bio?.trim() || "";
  user.homeBeach = body.homeBeach?.trim() || "Praia do Tombo";
  user.skillLevel = skillLevels.includes(body.skillLevel as SkillLevel)
    ? body.skillLevel
    : "iniciante";
  user.favoriteBoard = body.favoriteBoard?.trim() || "Prancha favorita";
  user.mainBoard = user.favoriteBoard;
  user.updatedAt = new Date().toISOString();

  await writeDb(db);

  return NextResponse.json({ user: toPublicUser(user, db) });
}
