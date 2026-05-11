import { AdminCircuitsTable } from "@/components/admin/AdminCircuitsTable";
import { AdminShell } from "@/components/admin/AdminShell";
import { readDb } from "@/lib/db";
import { requirePanelUser } from "@/services/admin";

export default async function AdminModerationPage() {
  const user = await requirePanelUser(["MODERATOR", "ADMIN"]);
  const db = await readDb();
  const organizerNames = Object.fromEntries(
    db.users.map((item) => [item.id, item.name] as const),
  );
  const pendingCompetitions = db.competitions.filter(
    (competition) => competition.status === "pending_review",
  );

  return (
    <AdminShell
      role={user.role}
      title="Fila de moderação"
      description="Revise eventos enviados, peça ajustes quando necessário e publique só o que estiver confiável."
    >
      <AdminCircuitsTable
        competitions={pendingCompetitions}
        organizerNames={organizerNames}
        role={user.role}
      />
    </AdminShell>
  );
}
