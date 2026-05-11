import { readDb } from "@/lib/db";

function topEntry(items: string[]) {
  const counts = new Map<string, number>();

  items.filter(Boolean).forEach((item) => {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  });

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
}

function monthLabel(date: string) {
  const parsed = new Date(`${date}T12:00:00`);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
  }).format(parsed);
}

function streakFromDates(dates: string[]) {
  const uniqueDates = [...new Set(dates)].sort((a, b) => b.localeCompare(a));
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(12, 0, 0, 0);

  for (const date of uniqueDates) {
    const current = new Date(`${date}T12:00:00`);
    const diff = Math.round((cursor.getTime() - current.getTime()) / 86400000);

    if (diff === streak || (streak === 0 && diff <= 1)) {
      streak += 1;
      cursor = current;
    } else {
      break;
    }
  }

  return streak;
}

export async function getUserStats(userId: string) {
  const db = await readDb();
  const sessions = db.sessions
    .filter((session) => session.userId === userId)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
  const spotNameById = new Map(db.spots.map((spot) => [spot.id, spot.name]));
  const totalWaves = sessions.reduce((sum, session) => sum + session.wavesCount, 0);
  const topSpot = topEntry(
    sessions.map((session) => spotNameById.get(session.spotId ?? "") ?? session.beach),
  );
  const topBoard = topEntry(sessions.map((session) => session.board));
  const topMood = topEntry(sessions.map((session) => session.mood));
  const topDifficulty = topEntry(sessions.map((session) => session.difficulty ?? "moderada"));
  const sessionsByMonth = new Map<string, number>();

  sessions.forEach((session) => {
    const label = monthLabel(session.date);
    sessionsByMonth.set(label, (sessionsByMonth.get(label) ?? 0) + 1);
  });

  return {
    totalSessions: sessions.length,
    totalWaves,
    mostSurfedSpot: topSpot ? { label: topSpot[0], total: topSpot[1] } : null,
    mostUsedBoard: topBoard ? { label: topBoard[0], total: topBoard[1] } : null,
    mostCommonMood: topMood ? { label: topMood[0], total: topMood[1] } : null,
    currentStreak: streakFromDates(sessions.map((session) => session.date)),
    bestTime: sessions.some((session) => session.mood === "zerohora")
      ? "05:30"
      : "manhã",
    topDifficulty: topDifficulty
      ? { label: topDifficulty[0], total: topDifficulty[1] }
      : null,
    sessionsByMonth: [...sessionsByMonth.entries()].map(([label, total]) => ({
      label,
      total,
    })),
    latestSessions: sessions.slice(0, 5),
  };
}
