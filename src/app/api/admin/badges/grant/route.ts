import { NextRequest, NextResponse } from "next/server";
import { createId, readDb, writeDb } from "@/lib/db";
import { requireApiRole } from "@/lib/roles";

export async function POST(request: NextRequest) {
  const { response } = await requireApiRole(request, ["ADMIN"]);

  if (response) {
    return response;
  }

  const body = (await request.json()) as {
    userId?: string;
    badgeId?: string;
  };
  const db = await readDb();
  const user = db.users.find((item) => item.id === body.userId);
  const badge = db.badges.find((item) => item.id === body.badgeId);

  if (!user || !badge) {
    return NextResponse.json(
      { error: "Escolha um surfista e uma badge válidos." },
      { status: 400 },
    );
  }

  if (db.userBadges.some((item) => item.userId === user.id && item.badgeId === badge.id)) {
    return NextResponse.json({ ok: true });
  }

  db.userBadges.push({
    id: createId("user-badge"),
    userId: user.id,
    badgeId: badge.id,
    unlockedAt: new Date().toISOString(),
  });
  await writeDb(db);

  return NextResponse.json({ ok: true }, { status: 201 });
}
