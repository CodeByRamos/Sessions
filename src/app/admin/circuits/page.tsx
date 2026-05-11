import { AdminCircuitsTable } from "@/components/admin/AdminCircuitsTable";
import { AdminShell } from "@/components/admin/AdminShell";
import { readDb } from "@/lib/db";
import { canModerate } from "@/lib/roles";
import { requirePanelUser } from "@/services/admin";

export default async function AdminCircuitsPage() {
  const user = await requirePanelUser(["ORGANIZER", "MODERATOR", "ADMIN"]);
  const db = await readDb();
  const competitions = canModerate(user.role)
    ? db.competitions
    : db.competitions.filter((competition) => competition.createdByUserId === user.id);
  const organizerNames = Object.fromEntries(
    db.users.map((item) => [item.id, item.name] as const),
  );

  return (
    <AdminShell
      role={user.role}
      title="Circuitos"
      description={
        canModerate(user.role)
          ? "Revise eventos, publique campeonatos e acompanhe o que entra na comunidade."
          : "Acompanhe seus eventos enviados e veja o status de análise."
      }
    >
      <AdminCircuitsTable
        competitions={competitions}
        organizerNames={organizerNames}
        role={user.role}
      />
    </AdminShell>
  );
}
