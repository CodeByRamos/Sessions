import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { readDb, toPublicUser, writeDb } from "@/lib/db";
import type { SkillLevel } from "@/types/user";
import {
  isValidUrl,
  limits,
  trimLimit,
} from "@/lib/validation";

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

  const name = trimLimit(body.name, 80);

  if (!name) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }

  user.name = name;
  const avatarUrl = body.avatarUrl?.trim() ?? "";
  if (avatarUrl) {
    const isAllowedAvatar = db.avatarOptions.some((avatar) => avatar.imageUrl === avatarUrl);
    const isExternalImage = isValidUrl(avatarUrl);

    if (!isAllowedAvatar && !isExternalImage) {
      return NextResponse.json(
        { error: "Use um avatar válido." },
        { status: 400 },
      );
    }

    user.avatarUrl = avatarUrl;
  } else {
    user.avatarUrl = db.avatarOptions[0]?.imageUrl ?? user.avatarUrl;
  }
  user.bio = trimLimit(body.bio, limits.shortDescription);
  user.homeBeach = trimLimit(body.homeBeach, limits.beachName) || "Praia do Tombo";
  user.skillLevel = skillLevels.includes(body.skillLevel as SkillLevel)
    ? body.skillLevel
    : "iniciante";
  user.favoriteBoard = trimLimit(body.favoriteBoard, 80) || "Prancha favorita";
  user.mainBoard = user.favoriteBoard;
  user.updatedAt = new Date().toISOString();

  await writeDb(db);

  return NextResponse.json({ user: toPublicUser(user, db) });
}
