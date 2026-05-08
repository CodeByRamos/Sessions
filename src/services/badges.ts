import { readDb } from "@/lib/db";

export async function listBadgesForUser(userId?: string) {
  const db = await readDb();
  const userBadges = userId
    ? db.userBadges.filter((badge) => badge.userId === userId)
    : [];

  return db.badges.map((badge) => {
    const unlocked = userBadges.find((item) => item.badgeId === badge.id);

    return {
      ...badge,
      unlocked: Boolean(unlocked),
      earnedAt: unlocked?.unlockedAt,
    };
  });
}
