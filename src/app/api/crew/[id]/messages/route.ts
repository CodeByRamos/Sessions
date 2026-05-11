import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { createId, readDb, writeDb } from "@/lib/db";
import { canModerate } from "@/lib/roles";
import { trimLimit } from "@/lib/validation";
import type { UserRole } from "@/types/user";

type CrewMessagesRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function canAccessCrewChat(
  crew: { creatorUserId: string; confirmedUserIds: string[] },
  user: { id: string; role: UserRole },
) {
  return (
    crew.creatorUserId === user.id ||
    crew.confirmedUserIds.includes(user.id) ||
    canModerate(user.role)
  );
}

export async function GET(request: NextRequest, { params }: CrewMessagesRouteProps) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json({ error: "Faça login para ver o chat." }, { status: 401 });
  }

  const { id } = await params;
  const db = await readDb();
  const crew = db.crewSessions.find((item) => item.id === id);

  if (!crew) {
    return NextResponse.json({ error: "Crew não encontrada." }, { status: 404 });
  }

  if (!canAccessCrewChat(crew, user)) {
    return NextResponse.json(
      { error: "Confirme presença para entrar no chat." },
      { status: 403 },
    );
  }

  const messages = db.crewMessages
    .filter((message) => message.crewSessionId === id && !message.deletedAt)
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((message) => {
      const sender = db.users.find((item) => item.id === message.senderId);

      return {
        ...message,
        sender: sender
          ? {
              id: sender.id,
              name: sender.name,
              avatarUrl: sender.avatarUrl,
            }
          : null,
      };
    });

  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest, { params }: CrewMessagesRouteProps) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json({ error: "Faça login para conversar." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { message?: string };
  const messageText = trimLimit(body.message, 500);
  const db = await readDb();
  const crew = db.crewSessions.find((item) => item.id === id);

  if (!crew) {
    return NextResponse.json({ error: "Crew não encontrada." }, { status: 404 });
  }

  if (!canAccessCrewChat(crew, user)) {
    return NextResponse.json(
      { error: "Confirme presença para entrar no chat." },
      { status: 403 },
    );
  }

  if (!messageText) {
    return NextResponse.json({ error: "Escreva uma mensagem." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const message = {
    id: createId("crew-message"),
    crewSessionId: id,
    senderId: user.id,
    message: messageText,
    createdAt: now,
    updatedAt: now,
  };

  db.crewMessages.push(message);
  await writeDb(db);

  return NextResponse.json({ message }, { status: 201 });
}
