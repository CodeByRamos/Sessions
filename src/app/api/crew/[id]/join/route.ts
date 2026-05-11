import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";

type CrewJoinProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: CrewJoinProps) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json({ error: "Faça login para entrar." }, { status: 401 });
  }

  const body = (await request.json()) as { action?: "interest" | "join" | "leave" };
  const { id } = await params;
  const db = await readDb();
  const crew = db.crewSessions.find((item) => item.id === id);

  if (!crew) {
    return NextResponse.json({ error: "Crew não encontrada." }, { status: 404 });
  }

  if (body.action !== "leave" && crew.status !== "open") {
    return NextResponse.json(
      { error: "Essa Crew não está aberta." },
      { status: 400 },
    );
  }

  if (body.action === "leave") {
    crew.confirmedUserIds = crew.confirmedUserIds.filter((id) => id !== user.id);
    if (crew.status === "full") {
      crew.status = "open";
    }
  } else if (body.action === "join") {
    if (!crew.confirmedUserIds.includes(user.id)) {
      crew.confirmedUserIds.push(user.id);
    }

    if (crew.confirmedUserIds.length >= crew.maxPeople) {
      crew.status = "full";
    }
  } else if (!crew.interestedUserIds.includes(user.id)) {
    crew.interestedUserIds.push(user.id);
  }

  crew.updatedAt = new Date().toISOString();
  await writeDb(db);

  return NextResponse.json({ crewSession: crew });
}
