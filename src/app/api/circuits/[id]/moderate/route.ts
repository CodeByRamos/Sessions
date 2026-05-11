import { NextRequest, NextResponse } from "next/server";
import { createId, readDb, writeDb } from "@/lib/db";
import { requireApiRole } from "@/lib/roles";
import type { CompetitionStatus } from "@/types/circuit";

type ModerateRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const allowed: CompetitionStatus[] = [
  "approved",
  "rejected",
  "changes_requested",
  "cancelled",
  "finished",
];

export async function PATCH(request: NextRequest, { params }: ModerateRouteProps) {
  const { user, response } = await requireApiRole(request, ["MODERATOR", "ADMIN"]);

  if (response || !user) {
    return response;
  }

  const { id } = await params;
  const body = (await request.json()) as {
    status?: CompetitionStatus;
    reason?: string;
  };

  if (!body.status || !allowed.includes(body.status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const reason = String(body.reason ?? "").trim().slice(0, 400);
  if (["rejected", "changes_requested", "cancelled"].includes(body.status) && reason.length < 4) {
    return NextResponse.json(
      { error: "Informe um motivo para essa decisão." },
      { status: 400 },
    );
  }

  const db = await readDb();
  const competition = db.competitions.find((item) => item.id === id);

  if (!competition) {
    return NextResponse.json({ error: "Circuito não encontrado." }, { status: 404 });
  }

  competition.status = body.status;
  competition.moderationReason = reason;
  competition.updatedAt = new Date().toISOString();
  db.circuitModerationLogs.unshift({
    id: createId("moderation-log"),
    competitionId: competition.id,
    moderatorId: user.id,
    action: body.status,
    reason,
    createdAt: new Date().toISOString(),
  });
  await writeDb(db);

  return NextResponse.json({ competition });
}
