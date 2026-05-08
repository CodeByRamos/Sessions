import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { createId, readDb, writeDb } from "@/lib/db";
import type { Mood, Session } from "@/types/session";

const moods: Mood[] = [
  "mágico",
  "clássico",
  "pesado",
  "frustrante",
  "limpo",
  "calmo",
  "evolução",
];

function unlockBadge(
  db: Awaited<ReturnType<typeof readDb>>,
  userId: string,
  badgeId: string,
) {
  if (db.userBadges.some((badge) => badge.userId === userId && badge.badgeId === badgeId)) {
    return;
  }

  db.userBadges.push({
    id: createId("user-badge"),
    userId,
    badgeId,
    unlockedAt: new Date().toISOString(),
  });
}

export async function GET() {
  const db = await readDb();
  return NextResponse.json({ sessions: db.sessions });
}

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json(
      { error: "Faça login para registrar uma session." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as {
    spotId?: string;
    title?: string;
    date?: string;
    waveSize?: string;
    wind?: string;
    board?: string;
    mood?: Mood;
    rating?: number;
    wavesCount?: number;
    maneuvers?: string;
    description?: string;
    mediaUrl?: string;
    isPublic?: boolean;
    country?: string;
    isCompetition?: boolean;
  };
  const db = await readDb();
  const spot = db.spots.find((item) => item.id === body.spotId);

  if (!spot) {
    return NextResponse.json({ error: "Escolha um pico válido." }, { status: 400 });
  }

  if (!body.date || !body.waveSize || !body.wind || !body.board) {
    return NextResponse.json(
      { error: "Preencha pico, data, tamanho do mar, vento e prancha." },
      { status: 400 },
    );
  }

  const description = body.description?.trim() ?? "";

  if (description.length < 12) {
    return NextResponse.json(
      { error: "Escreva um relato com pelo menos 12 caracteres." },
      { status: 400 },
    );
  }

  const mood = body.mood && moods.includes(body.mood) ? body.mood : "evolução";
  const wavesCount = Math.max(0, Number(body.wavesCount ?? 0));
  const mediaUrls = body.mediaUrl?.trim() ? [body.mediaUrl.trim()] : [spot.imageUrl];
  const board = body.board.trim();
  const wind = body.wind.trim();
  const now = new Date().toISOString();
  const session: Session = {
    id: createId("session"),
    userId: user.id,
    spotId: spot.id,
    title: body.title?.trim() || `${spot.name} · ${mood}`,
    beach: spot.name,
    date: body.date,
    waveSize: body.waveSize.trim(),
    wind,
    windCondition: wind,
    board,
    boardUsed: board,
    mood,
    rating: Math.min(Math.max(Number(body.rating ?? 4), 1), 5),
    wavesCount,
    wavesCaught: wavesCount,
    description,
    notes: description,
    cinematicText: "",
    photoUrl: mediaUrls[0],
    mediaUrls,
    maneuvers: body.maneuvers
      ? body.maneuvers
          .split(",")
          .map((maneuver) => maneuver.trim())
          .filter(Boolean)
      : [],
    isPublic: body.isPublic ?? true,
    country: body.country?.trim() || "Brasil",
    isCompetition: Boolean(body.isCompetition),
    createdAt: now,
  };

  db.sessions.unshift(session);

  const userSessions = db.sessions.filter((item) => item.userId === user.id);
  unlockBadge(db, user.id, "primeira-session");

  if (wavesCount > 0) {
    unlockBadge(db, user.id, "primeiro-drop");
  }

  if (description.toLowerCase().includes("evolu") || mood === "evolução") {
    unlockBadge(db, user.id, "primeira-onda-em-pe");
  }

  if (userSessions.length >= 7) {
    unlockBadge(db, user.id, "7-dias-surfando");
  }

  const emotionalSessions = userSessions.filter((item) => (item.description ?? "").length >= 140);
  if (description.length >= 180 || emotionalSessions.length >= 7) {
    unlockBadge(db, user.id, "uaradei");
  }

  const spotsSurf = new Set(userSessions.map((item) => item.spotId));
  if (spotsSurf.size > 1) {
    unlockBadge(db, user.id, "novo-pico");
  }

  if ((session.country ?? "Brasil").toLowerCase() !== "brasil" || session.isCompetition) {
    unlockBadge(db, user.id, "brazilian-storm");
  }

  await writeDb(db);

  return NextResponse.json({ session }, { status: 201 });
}
