import type { Session } from "@/types/session";
import { createId, readDb, writeDb } from "@/lib/db";

export type CreateSessionInput = Omit<Session, "id" | "userId" | "createdAt">;

export async function listAllSessions() {
  const db = await readDb();
  return db.sessions;
}

export async function listPublicSessions() {
  const db = await readDb();
  return db.sessions.filter((session) => session.isPublic);
}

export async function listSessionsByUser(userId: string) {
  const db = await readDb();
  return db.sessions.filter((session) => session.userId === userId);
}

export async function findSessionById(id: string) {
  const db = await readDb();
  return db.sessions.find((session) => session.id === id);
}

export async function listSessionsBySpot(spotId: string) {
  const db = await readDb();
  return db.sessions.filter((session) => session.spotId === spotId);
}

export async function createSession(userId: string, input: CreateSessionInput) {
  const db = await readDb();
  const session = {
    ...input,
    id: createId("session"),
    userId,
    createdAt: new Date().toISOString(),
  } satisfies Session;

  db.sessions.unshift(session);
  await writeDb(db);

  return session;
}
