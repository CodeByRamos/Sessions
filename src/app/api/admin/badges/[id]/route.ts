import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { requireApiRole } from "@/lib/roles";
import type { BadgeCategory, BadgeRarity } from "@/types/user";

type BadgeRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const rarities: BadgeRarity[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "secret",
];
const categories: BadgeCategory[] = [
  "frequência",
  "praia",
  "horário",
  "evolução",
  "comunidade",
  "circuitos",
  "exploração",
  "especial",
];

export async function PATCH(request: NextRequest, { params }: BadgeRouteProps) {
  const { response } = await requireApiRole(request, ["ADMIN"]);

  if (response) {
    return response;
  }

  const { id } = await params;
  const body = (await request.json()) as {
    name?: string;
    description?: string;
    unlockRule?: string;
    rarity?: BadgeRarity;
    category?: BadgeCategory;
    isSecret?: boolean;
    isAutomatic?: boolean;
    isActive?: boolean;
  };
  const db = await readDb();
  const badge = db.badges.find((item) => item.id === id);

  if (!badge) {
    return NextResponse.json({ error: "Badge não encontrada." }, { status: 404 });
  }

  if (typeof body.name === "string") {
    badge.name = body.name.trim().slice(0, 80) || badge.name;
  }

  if (typeof body.description === "string") {
    badge.description = body.description.trim().slice(0, 220) || badge.description;
  }

  if (typeof body.unlockRule === "string") {
    badge.unlockRule = body.unlockRule.trim().slice(0, 220);
  }

  if (body.rarity && rarities.includes(body.rarity)) {
    badge.rarity = body.rarity;
  }

  if (body.category && categories.includes(body.category)) {
    badge.category = body.category;
  }

  if (typeof body.isSecret === "boolean") {
    badge.isSecret = body.isSecret;
  }

  if (typeof body.isAutomatic === "boolean") {
    badge.isAutomatic = body.isAutomatic;
  }

  if (typeof body.isActive === "boolean") {
    badge.isActive = body.isActive;
  }

  await writeDb(db);
  return NextResponse.json({ badge });
}
