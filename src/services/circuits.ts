import { readDb } from "@/lib/db";

export async function listCompetitions() {
  const db = await readDb();
  return db.competitions;
}

export async function listApprovedCompetitions() {
  const db = await readDb();
  return db.competitions.filter((competition) => competition.status === "approved");
}

export async function findCompetitionById(id: string) {
  const db = await readDb();
  return db.competitions.find((competition) => competition.id === id);
}
