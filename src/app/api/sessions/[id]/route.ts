import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";
import { moodOptions } from "@/lib/moods";
import { isPastOrToday, isValidUrl, limits, trimLimit } from "@/lib/validation";
import type { Mood, Session } from "@/types/session";

type SessionRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: SessionRouteProps) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json({ error: "Faça login para editar." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
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
  };
  const db = await readDb();
  const session = db.sessions.find((item) => item.id === id && item.userId === user.id);

  if (!session) {
    return NextResponse.json({ error: "Session não encontrada." }, { status: 404 });
  }

  if (body.date && !isPastOrToday(body.date)) {
    return NextResponse.json(
      { error: "Sessions realizadas precisam ter data de hoje ou do passado." },
      { status: 400 },
    );
  }

  const mediaUrl = trimLimit(body.mediaUrl, Math.max(limits.url, limits.longText));
  if (mediaUrl && !isValidUrl(mediaUrl)) {
    return NextResponse.json({ error: "Use uma imagem válida." }, { status: 400 });
  }

  const difficultyOptions: Array<NonNullable<Session["difficulty"]>> = [
    "leve",
    "moderada",
    "difícil",
    "casca grossa",
  ];

  session.title = trimLimit(body.title ?? session.title, limits.sessionTitle);
  session.date = body.date ?? session.date;
  session.waveSize = trimLimit(body.waveSize ?? session.waveSize, 60);
  session.wind = trimLimit(body.wind ?? session.wind, 80);
  session.windCondition = session.wind;
  session.board = trimLimit(body.board ?? session.board, 60);
  session.boardUsed = session.board;
  session.mood = body.mood && moodOptions.includes(body.mood) ? body.mood : session.mood;
  session.difficulty = difficultyOptions.includes(body.difficulty ?? session.difficulty ?? "moderada")
    ? (body.difficulty ?? session.difficulty ?? "moderada")
    : "moderada";
  session.rating = Math.min(Math.max(Number(body.rating ?? session.rating), 1), 5);
  session.wavesCount = Math.max(0, Number(body.wavesCount ?? session.wavesCount));
  session.wavesCaught = session.wavesCount;
  session.description = trimLimit(body.description ?? session.description, limits.longText);
  session.notes = session.description;
  session.maneuvers = body.maneuvers
    ? body.maneuvers
        .split(",")
        .map((maneuver) => maneuver.trim())
        .filter(Boolean)
        .slice(0, 12)
    : session.maneuvers ?? [];

  if (mediaUrl) {
    session.photoUrl = mediaUrl;
    session.mediaUrls = [mediaUrl];
  }

  session.updatedAt = new Date().toISOString();

  await writeDb(db);
  return NextResponse.json({ session });
}

export async function DELETE(request: NextRequest, { params }: SessionRouteProps) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json({ error: "Faça login para excluir." }, { status: 401 });
  }

  const { id } = await params;
  const db = await readDb();
  const index = db.sessions.findIndex((item) => item.id === id && item.userId === user.id);

  if (index === -1) {
    return NextResponse.json({ error: "Session não encontrada." }, { status: 404 });
  }

  db.sessions.splice(index, 1);
  await writeDb(db);

  return NextResponse.json({ ok: true });
}
