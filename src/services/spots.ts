import { readDb } from "@/lib/db";

export async function listSpots() {
  const db = await readDb();
  return db.spots;
}

export async function findSpotById(id: string) {
  const db = await readDb();
  return db.spots.find((spot) => spot.id === id);
}

export async function getSpotStats(spotId: string) {
  const db = await readDb();
  const sessions = db.sessions.filter((session) => session.spotId === spotId);
  const total = sessions.length;
  const averageWaves = total
    ? Math.round(
        sessions.reduce((sum, session) => sum + session.wavesCount, 0) / total,
      )
    : 0;
  const lastSession = sessions
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const moodCount = new Map<string, number>();
  const boardCount = new Map<string, number>();

  sessions.forEach((session) => {
    moodCount.set(session.mood, (moodCount.get(session.mood) ?? 0) + 1);
    boardCount.set(session.board, (boardCount.get(session.board) ?? 0) + 1);
  });

  const mostCommonMood =
    [...moodCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "sem mood";
  const mostUsedBoard =
    [...boardCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "sem prancha";

  return {
    total,
    averageWaves,
    lastSurfedAt: lastSession?.date ?? null,
    mostCommonMood,
    mostUsedBoard,
  };
}

export async function getMostSurfedSpot(userId: string) {
  const db = await readDb();
  const counts = new Map<string, number>();

  db.sessions
    .filter((session) => session.userId === userId && session.spotId)
    .forEach((session) => {
      const spotId = session.spotId as string;
      counts.set(spotId, (counts.get(spotId) ?? 0) + 1);
    });

  const [spotId, total] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
  const spot = db.spots.find((item) => item.id === spotId);

  return spot ? { spot, total } : null;
}

export async function countSessionsBySpot() {
  const db = await readDb();
  return db.spots.map((spot) => ({
    spot,
    total: db.sessions.filter((session) => session.spotId === spot.id).length,
  }));
}
