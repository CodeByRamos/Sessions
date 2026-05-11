import { readDb } from "@/lib/db";

export async function listAvatarOptions() {
  const db = await readDb();
  return db.avatarOptions;
}
