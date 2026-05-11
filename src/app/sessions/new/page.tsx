import { SessionForm } from "@/components/sessions/SessionForm";
import { listApprovedCompetitions } from "@/services/circuits";
import { listSpots } from "@/services/spots";
import { requireUser } from "@/services/users";

type NewSessionPageProps = {
  searchParams: Promise<{
    spot?: string;
    competition?: string;
  }>;
};

export default async function NewSessionPage({ searchParams }: NewSessionPageProps) {
  await requireUser();
  const [{ spot, competition }, spots, competitions] = await Promise.all([
    searchParams,
    listSpots(),
    listApprovedCompetitions(),
  ]);

  return (
    <div className="page-shell space-y-6 fade-in">
      <header>
        <p className="section-kicker">nova entrada</p>
        <h1 className="mt-3 text-4xl font-black leading-none text-white sm:text-6xl">
          Criar session
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-sand-100/66 sm:text-base">
          Um fluxo claro para transformar condição, sensação e relato em uma
          memória pronta para o feed.
        </p>
      </header>

      <SessionForm
        spots={spots}
        competitions={competitions}
        initialSpotId={spot}
        initialCompetitionId={competition}
      />
    </div>
  );
}
