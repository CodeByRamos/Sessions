import { AdminBadgesPanel } from "@/components/admin/AdminBadgesPanel";
import { AdminShell } from "@/components/admin/AdminShell";
import { readDb } from "@/lib/db";
import { requirePanelUser } from "@/services/admin";

export default async function AdminBadgesPage() {
  const user = await requirePanelUser(["ADMIN"]);
  const db = await readDb();

  return (
    <AdminShell
      role={user.role}
      title="Badges"
      description="Cuide das conquistas especiais, ative badges e conceda marcos manuais quando fizer sentido."
    >
      <AdminBadgesPanel
        badges={db.badges}
        userBadges={db.userBadges}
        users={db.users.map((item) => ({ id: item.id, name: item.name }))}
      />
    </AdminShell>
  );
}
