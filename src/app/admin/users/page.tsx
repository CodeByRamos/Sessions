import { AdminShell } from "@/components/admin/AdminShell";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { readDb } from "@/lib/db";
import { requirePanelUser } from "@/services/admin";

export default async function AdminUsersPage() {
  const user = await requirePanelUser(["ADMIN"]);
  const db = await readDb();

  return (
    <AdminShell
      role={user.role}
      title="Usuários"
      description="Gerencie papéis, revise contas e mantenha a comunidade em ordem."
    >
      <AdminUsersTable
        users={db.users.map((item) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          role: item.role,
          homeBeach: item.homeBeach,
          createdAt: item.createdAt,
        }))}
      />
    </AdminShell>
  );
}
