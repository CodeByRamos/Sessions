import { getSessionBadgeIds } from "@/lib/badges";
import { readDb, toPublicUser } from "@/lib/db";

export async function listPublicFeedItems() {
  const db = await readDb();

  return db.sessions
    .filter((session) => session.isPublic)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((session) => {
      const author = db.users.find((user) => user.id === session.userId);
      const badgeIds = getSessionBadgeIds(session);

      return {
        session,
        author: author ? toPublicUser(author, db) : null,
        badges: db.badges.filter((badge) => badgeIds.includes(badge.id)),
      };
    });
}
