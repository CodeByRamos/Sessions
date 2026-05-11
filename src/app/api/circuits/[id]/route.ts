import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";
import { canModerate } from "@/lib/roles";
import { isFutureDateTime, isValidUrl, limits, trimLimit } from "@/lib/validation";
import type { Competition } from "@/types/circuit";

type CircuitRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: CircuitRouteProps) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json({ error: "Faça login para editar o Circuito." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as Partial<Competition> & {
    categoriesText?: string;
    submitForReview?: boolean;
  };
  const db = await readDb();
  const competition = db.competitions.find((item) => item.id === id);

  if (!competition) {
    return NextResponse.json({ error: "Circuito não encontrado." }, { status: 404 });
  }

  if (competition.createdByUserId !== user.id && !canModerate(user.role)) {
    return NextResponse.json(
      { error: "Você só pode editar Circuitos criados por você." },
      { status: 403 },
    );
  }

  if (body.startsAt && !isFutureDateTime(body.startsAt)) {
    return NextResponse.json(
      { error: "Circuitos precisam ter data futura." },
      { status: 400 },
    );
  }

  const officialUrl = body.officialUrl
    ? trimLimit(body.officialUrl, limits.url)
    : competition.officialUrl;
  const organizerProfileUrl = body.organizerProfileUrl
    ? trimLimit(body.organizerProfileUrl, limits.url)
    : competition.organizerProfileUrl;
  const verificationFileUrl = body.verificationFileUrl
    ? trimLimit(body.verificationFileUrl, limits.url)
    : competition.verificationFileUrl;
  const imageUrl = body.imageUrl
    ? trimLimit(body.imageUrl, limits.url)
    : competition.imageUrl;

  if (
    !isValidUrl(officialUrl) ||
    !isValidUrl(organizerProfileUrl, true) ||
    !isValidUrl(verificationFileUrl ?? "", true) ||
    !isValidUrl(imageUrl ?? "", true)
  ) {
    return NextResponse.json({ error: "Revise os links informados." }, { status: 400 });
  }

  competition.name = body.name
    ? trimLimit(body.name, limits.competitionName)
    : competition.name;
  competition.startsAt = body.startsAt ?? competition.startsAt;
  competition.spotId = body.spotId ?? competition.spotId;
  competition.location = body.location
    ? trimLimit(body.location, limits.beachName)
    : competition.location;
  competition.city = body.city ? trimLimit(body.city, 60) : competition.city;
  competition.state = body.state ? trimLimit(body.state, 30) : competition.state;
  competition.country = body.country ? trimLimit(body.country, 60) : competition.country;
  competition.description = body.description
    ? trimLimit(body.description, limits.shortDescription)
    : competition.description;
  competition.officialUrl = officialUrl;
  competition.organizerName = body.organizerName
    ? trimLimit(body.organizerName, 80)
    : competition.organizerName;
  competition.organizerProfileUrl = organizerProfileUrl;
  competition.organizerContact = body.organizerContact
    ? trimLimit(body.organizerContact, 120)
    : competition.organizerContact;
  competition.verificationFileUrl = verificationFileUrl;
  competition.reviewMessage = body.reviewMessage
    ? trimLimit(body.reviewMessage, limits.shortDescription)
    : competition.reviewMessage;
  competition.imageUrl = imageUrl;
  competition.rules = body.rules
    ? trimLimit(body.rules, limits.shortDescription)
    : competition.rules;
  competition.prize = body.prize ? trimLimit(body.prize, 120) : competition.prize;
  competition.recommendedLevel = body.recommendedLevel
    ? trimLimit(body.recommendedLevel, 80)
    : competition.recommendedLevel;
  competition.estimatedParticipants =
    body.estimatedParticipants !== undefined
      ? Math.max(0, Number(body.estimatedParticipants))
      : competition.estimatedParticipants;
  competition.prestige = body.prestige ?? competition.prestige;

  if (body.categoriesText !== undefined) {
    competition.categories = String(body.categoriesText)
      .split(",")
      .map((category) => category.trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  if (body.submitForReview && competition.status !== "approved") {
    competition.status = "pending_review";
    competition.moderationReason = "";
  }

  competition.updatedAt = new Date().toISOString();
  await writeDb(db);

  return NextResponse.json({ competition });
}
