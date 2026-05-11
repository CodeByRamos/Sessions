import { MySessionsClient } from "@/components/sessions/MySessionsClient";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { listSessionsByUser } from "@/services/sessions";
import { listSpots } from "@/services/spots";
import { requireUser } from "@/services/users";

export default async function MySessionsPage() {
  const user = await requireUser();
  const [sessions, spots] = await Promise.all([
    listSessionsByUser(user.id),
    listSpots(),
  ]);

  return (
    <div className="page-shell space-y-6 fade-in">
      <SectionTitle
        eyebrow="minhas sessions"
        title="Seu histórico no mar"
        description="Todas as sessions registradas, com filtros, estatísticas, edição e exclusão segura."
        actionLabel="nova session"
        actionHref="/sessions/new"
      />
      <MySessionsClient initialSessions={sessions} spots={spots} />
    </div>
  );
}
