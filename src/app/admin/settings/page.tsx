import { AdminShell } from "@/components/admin/AdminShell";
import { requirePanelUser } from "@/services/admin";

const settings = [
  { label: "Novas contas", value: "abertas" },
  { label: "Circuitos", value: "com revisão" },
  { label: "Crew chat", value: "ativo" },
  { label: "Badges automáticas", value: "ativas" },
];

export default async function AdminSettingsPage() {
  const user = await requirePanelUser(["ADMIN"]);

  return (
    <AdminShell
      role={user.role}
      title="Ajustes"
      description="Configurações simples para manter a plataforma em bom ritmo."
    >
      <section className="grid gap-4 sm:grid-cols-2">
        {settings.map((setting) => (
          <div key={setting.label} className="surface rounded-[18px] p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sand-100/48">
              {setting.label}
            </p>
            <p className="mt-3 text-2xl font-black text-white">{setting.value}</p>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}
