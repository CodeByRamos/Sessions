import { getOptionalCurrentUser, requireCurrentUser } from "@/lib/auth";
import { readDb, toPublicUser } from "@/lib/db";

export async function getCurrentUser() {
  return getOptionalCurrentUser();
}

export async function requireUser() {
  return requireCurrentUser();
}

export async function getFeaturedUser() {
  const db = await readDb();
  const user = db.users[0];

  return toPublicUser(user, db);
}
