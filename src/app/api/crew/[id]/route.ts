import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";
import { canModerate } from "@/lib/roles";
import type { CrewSessionStatus } from "@/types/circuit";

type CrewRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const allowedStatus: CrewSessionStatus[] = ["open", "closed", "cancelled"];

export async function PATCH(request: NextRequest, { params }: CrewRouteProps) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: CrewSessionStatus };
  const db = await readDb();
  const crew = db.crewSessions.find((item) => item.id === id);

  if (!crew) {
    return NextResponse.json({ error: "Crew não encontrada." }, { status: 404 });
  }

  if (crew.creatorUserId !== user.id && !canModerate(user.role)) {
    return NextResponse.json(
      { error: "Só o criador da Crew pode alterar essa session." },
      { status: 403 },
    );
  }

  if (!body.status || !allowedStatus.includes(body.status)) {
    return NextResponse.json({ error: "Escolha um status válido." }, { status: 400 });
  }

  crew.status = body.status;
  crew.updatedAt = new Date().toISOString();
  await writeDb(db);

  return NextResponse.json({ crewSession: crew });
}
