import { AdminSessionsPanel } from "@/components/admin/AdminSessionsPanel";
import { AdminShell } from "@/components/admin/AdminShell";
import { readDb } from "@/lib/db";
import { requirePanelUser } from "@/services/admin";

export default async function AdminSessionsPage() {
  const user = await requirePanelUser(["MODERATOR", "ADMIN"]);
  const db = await readDb();
  const userNames = Object.fromEntries(db.users.map((item) => [item.id, item.name] as const));

  return (
    <AdminShell
      role={user.role}
      title="Sessions"
      description="Revise registros públicos e oculte conteúdo quando for preciso."
    >
      <AdminSessionsPanel sessions={db.sessions} userNames={userNames} />
    </AdminShell>
  );
}
