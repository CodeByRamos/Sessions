import { MessageSquareWarning } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { requirePanelUser } from "@/services/admin";

export default async function AdminReportsPage() {
  const user = await requirePanelUser(["MODERATOR", "ADMIN"]);

  return (
    <AdminShell
      role={user.role}
      title="Denúncias"
      description="Acompanhe conteúdos sinalizados e conversas que precisam de atenção."
    >
      <EmptyState
        icon={<MessageSquareWarning className="h-7 w-7" />}
        title="Nenhuma denúncia pendente"
        description="Quando algo for sinalizado pela comunidade, vai aparecer aqui para revisão."
      />
    </AdminShell>
  );
}
