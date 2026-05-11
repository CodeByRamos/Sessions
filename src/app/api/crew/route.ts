import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { createId, readDb, writeDb } from "@/lib/db";
import { isFutureDateTime, limits, trimLimit } from "@/lib/validation";
import type { CrewSession, CrewSessionStyle } from "@/types/circuit";

const styles: CrewSessionStyle[] = [
  "treino",
  "free surf",
  "dawn patrol",
  "filmagem",
  "longboard",
  "iniciante",
  "campeonato",
];

export async function GET() {
  const db = await readDb();
  return NextResponse.json({ crewSessions: db.crewSessions });
}

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json({ error: "Faça login para criar uma Crew." }, { status: 401 });
  }

  const body = (await request.json()) as Partial<CrewSession>;
  const db = await readDb();
  const spot = db.spots.find((item) => item.id === body.spotId);

  if (!spot) {
    return NextResponse.json({ error: "Escolha uma praia válida." }, { status: 400 });
  }

  const date = String(body.date ?? "");
  const time = String(body.time ?? "");

  if (!date || !time || !isFutureDateTime(`${date}T${time}:00`)) {
    return NextResponse.json(
      { error: "Crew sessions precisam ter data e horário futuros." },
      { status: 400 },
    );
  }

  const description = trimLimit(body.description, limits.shortDescription);
  if (description.length < 8) {
    return NextResponse.json(
      { error: "Escreva uma descrição curta para a Crew." },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const crewSession: CrewSession = {
    id: createId("crew"),
    title: trimLimit(body.title, 80) || `${spot.name} às ${time}`,
    creatorUserId: user.id,
    spotId: spot.id,
    date,
    time,
    desiredLevel: trimLimit(body.desiredLevel, 60) || "qualquer nível",
    style: body.style && styles.includes(body.style) ? body.style : "free surf",
    description,
    maxPeople: Math.max(2, Math.min(Number(body.maxPeople ?? 4), 20)),
    hasExtraBoard: Boolean(body.hasExtraBoard),
    acceptsBeginners: Boolean(body.acceptsBeginners),
    wantsFilmer: Boolean(body.wantsFilmer),
    status: "open",
    interestedUserIds: [],
    confirmedUserIds: [user.id],
    createdAt: now,
    updatedAt: now,
  };

  db.crewSessions.unshift(crewSession);
  await writeDb(db);

  return NextResponse.json({ crewSession }, { status: 201 });
}
