import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { evaluateBadgesForUser } from "@/lib/badges";
import { createId, readDb, writeDb } from "@/lib/db";
import { moodOptions } from "@/lib/moods";
import { canModerate } from "@/lib/roles";
import { isPastOrToday, isValidUrl, limits, trimLimit } from "@/lib/validation";
import type { Mood, Session } from "@/types/session";

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  const db = await readDb();
  const sessions = db.sessions.filter((session) => {
    if (session.isPublic) {
      return true;
    }

    return Boolean(user && (session.userId === user.id || canModerate(user.role)));
  });

  return NextResponse.json({ sessions });
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
    difficulty?: Session["difficulty"];
    rating?: number;
    wavesCount?: number;
    maneuvers?: string;
    description?: string;
    mediaUrl?: string;
    mediaUrls?: string[];
    isPublic?: boolean;
    country?: string;
    isCompetition?: boolean;
    sessionType?: "common" | "competition" | "crew";
    competitionId?: string;
    competitionCategory?: string;
    competitionResult?: string;
    competitionRound?: string;
    competitionScore?: string;
    competitionFeeling?: string;
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

  if (!isPastOrToday(body.date)) {
    return NextResponse.json(
      { error: "Sessions realizadas precisam ter data de hoje ou do passado." },
      { status: 400 },
    );
  }

  const description = trimLimit(body.description, limits.longText);

  if (description.length < 12) {
    return NextResponse.json(
      { error: "Escreva um relato com pelo menos 12 caracteres." },
      { status: 400 },
    );
  }

  const mood = body.mood && moodOptions.includes(body.mood) ? body.mood : "evolução";
  const wavesCount = Math.max(0, Number(body.wavesCount ?? 0));
  const rawMediaUrls = [
    ...(Array.isArray(body.mediaUrls) ? body.mediaUrls : []),
    body.mediaUrl,
  ]
    .map((value) => trimLimit(value, Math.max(limits.url, limits.longText)))
    .filter(Boolean)
    .slice(0, 4);

  for (const mediaUrl of rawMediaUrls) {
    if (!isValidUrl(mediaUrl)) {
      return NextResponse.json(
        { error: "Use uma imagem válida." },
        { status: 400 },
      );
    }
  }

  const competition = body.competitionId
    ? db.competitions.find((item) => item.id === body.competitionId)
    : undefined;
  const isCompetitionSession = body.sessionType === "competition" || Boolean(body.isCompetition);

  if (isCompetitionSession) {
    if (!competition) {
      return NextResponse.json(
        { error: "Escolha um Circuito aprovado para a session de campeonato." },
        { status: 400 },
      );
    }

    if (competition.status !== "approved") {
      return NextResponse.json(
        { error: "O Circuito precisa estar aprovado para receber sessions." },
        { status: 400 },
      );
    }
  }

  const mediaUrls = rawMediaUrls.length ? rawMediaUrls : [spot.imageUrl];
  const board = trimLimit(body.board, 60);
  const wind = trimLimit(body.wind, 80);
  const title = trimLimit(body.title, limits.sessionTitle);
  const difficultyOptions: Array<NonNullable<Session["difficulty"]>> = [
    "leve",
    "moderada",
    "difícil",
    "casca grossa",
  ];
  const difficulty = difficultyOptions.includes(body.difficulty ?? "moderada")
    ? body.difficulty
    : "moderada";
  const now = new Date().toISOString();
  const session: Session = {
    id: createId("session"),
    userId: user.id,
    spotId: spot.id,
    sessionType: isCompetitionSession ? "competition" : "common",
    competitionId: competition?.id,
    competitionCategory: trimLimit(body.competitionCategory, 60),
    competitionResult: trimLimit(body.competitionResult, 60),
    competitionRound: trimLimit(body.competitionRound, 60),
    competitionScore: trimLimit(body.competitionScore, 40),
    competitionFeeling: trimLimit(body.competitionFeeling, limits.shortDescription),
    title: title || `${spot.name} · ${mood}`,
    beach: spot.name,
    date: body.date,
    waveSize: trimLimit(body.waveSize, 60),
    wind,
    windCondition: wind,
    board,
    boardUsed: board,
    mood,
    difficulty,
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
          .slice(0, 12)
      : [],
    isPublic: body.isPublic ?? true,
    country: body.country?.trim() || "Brasil",
    isCompetition: isCompetitionSession,
    createdAt: now,
    updatedAt: now,
  };

  db.sessions.unshift(session);
  const unlockedBadgeIds = evaluateBadgesForUser(db, user.id, session, competition);

  await writeDb(db);

  return NextResponse.json({ session, unlockedBadgeIds }, { status: 201 });
}
