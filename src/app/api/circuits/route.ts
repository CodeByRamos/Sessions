import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { createId, readDb, writeDb } from "@/lib/db";
import { canModerate, requireApiRole } from "@/lib/roles";
import { isFutureDateTime, isValidUrl, limits, trimLimit } from "@/lib/validation";
import type { Competition } from "@/types/circuit";

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  const db = await readDb();
  const competitions = db.competitions.filter((competition) => {
    if (competition.status === "approved") {
      return true;
    }

    if (!user) {
      return false;
    }

    return canModerate(user.role) || competition.createdByUserId === user.id;
  });

  return NextResponse.json({ competitions });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireApiRole(request, [
    "ORGANIZER",
    "MODERATOR",
    "ADMIN",
  ]);

  if (response || !user) {
    return response;
  }

  const body = (await request.json()) as Partial<Competition> & {
    categoriesText?: string;
  };
  const name = trimLimit(body.name, limits.competitionName);
  const startsAt = String(body.startsAt ?? "");
  const officialUrl = trimLimit(body.officialUrl, limits.url);
  const organizerProfileUrl = trimLimit(body.organizerProfileUrl, limits.url);
  const organizerContact = trimLimit(body.organizerContact, 120);
  const description = trimLimit(body.description, limits.shortDescription);
  const verificationFileUrl = trimLimit(body.verificationFileUrl, limits.url);
  const imageUrl = trimLimit(body.imageUrl, limits.url);

  if (!name || !startsAt || !description || !officialUrl || !organizerContact) {
    return NextResponse.json(
      { error: "Preencha nome, data, descrição, link oficial e contato." },
      { status: 400 },
    );
  }

  if (!isFutureDateTime(startsAt)) {
    return NextResponse.json(
      { error: "Circuitos precisam ter data futura." },
      { status: 400 },
    );
  }

  if (
    !isValidUrl(officialUrl) ||
    !isValidUrl(organizerProfileUrl, true) ||
    !isValidUrl(verificationFileUrl, true) ||
    !isValidUrl(imageUrl, true)
  ) {
    return NextResponse.json(
      { error: "Informe links válidos para inscrição, imagem ou verificação." },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const competition: Competition = {
    id: createId("competition"),
    name,
    startsAt,
    spotId: body.spotId,
    location: trimLimit(body.location, limits.beachName),
    city: trimLimit(body.city, 60),
    state: trimLimit(body.state, 30),
    country: trimLimit(body.country, 60) || "Brasil",
    description,
    categories: String(body.categoriesText ?? "")
      .split(",")
      .map((category) => category.trim())
      .filter(Boolean)
      .slice(0, 8),
    officialUrl,
    organizerName: trimLimit(body.organizerName, 80) || user.name,
    organizerProfileUrl,
    organizerContact,
    verificationFileUrl,
    reviewMessage: trimLimit(body.reviewMessage, limits.shortDescription),
    status: "pending_review",
    imageUrl,
    rules: trimLimit(body.rules, limits.shortDescription),
    prize: trimLimit(body.prize, 120),
    recommendedLevel: trimLimit(body.recommendedLevel, 80),
    estimatedParticipants: body.estimatedParticipants
      ? Math.max(0, Number(body.estimatedParticipants))
      : undefined,
    prestige: body.prestige ?? "local",
    createdByUserId: user.id,
    createdAt: now,
    updatedAt: now,
  };

  const db = await readDb();
  db.competitions.unshift(competition);
  db.eventVerifications.unshift({
    id: createId("event-verification"),
    competitionId: competition.id,
    officialUrl,
    organizerProfileUrl,
    organizerContact,
    verificationFileUrl: competition.verificationFileUrl,
    reviewMessage: competition.reviewMessage,
    createdAt: now,
  });
  await writeDb(db);

  return NextResponse.json({ competition }, { status: 201 });
}
