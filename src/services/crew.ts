import { readDb } from "@/lib/db";

export async function listCrewSessions() {
  const db = await readDb();
  return db.crewSessions;
}

export async function findCrewSessionById(id: string) {
  const db = await readDb();
  return db.crewSessions.find((crew) => crew.id === id) ?? null;
}

export async function listCrewMessages(crewSessionId: string) {
  const db = await readDb();

  return db.crewMessages
    .filter((message) => message.crewSessionId === crewSessionId && !message.deletedAt)
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((message) => {
      const sender = db.users.find((user) => user.id === message.senderId);

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
}
