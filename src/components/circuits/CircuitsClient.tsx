"use client";

import { useMemo, useState } from "react";
import { CircuitCard } from "@/components/circuits/CircuitCard";
import { CircuitModerationPanel } from "@/components/circuits/CircuitModerationPanel";
import { CircuitSubmitForm } from "@/components/circuits/CircuitSubmitForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { Competition, CompetitionStatus } from "@/types/circuit";
import type { Spot } from "@/types/spot";
import type { User } from "@/types/user";

type CircuitsClientProps = {
  competitions: Competition[];
  spots: Spot[];
  currentUser: User | null;
};

const filters: Array<{ value: CompetitionStatus | "all"; label: string }> = [
  { value: "all", label: "todos" },
  { value: "approved", label: "aprovados" },
  { value: "pending_review", label: "em análise" },
  { value: "changes_requested", label: "ajustes" },
  { value: "finished", label: "finalizados" },
];

export function CircuitsClient({
  competitions: initialCompetitions,
  spots,
  currentUser,
}: CircuitsClientProps) {
  const [competitions, setCompetitions] = useState(initialCompetitions);
  const [activeFilter, setActiveFilter] = useState<CompetitionStatus | "all">("all");
  const canCreate = Boolean(
    currentUser && ["ORGANIZER", "MODERATOR", "ADMIN"].includes(currentUser.role),
  );
  const canModerate = Boolean(
    currentUser && ["MODERATOR", "ADMIN"].includes(currentUser.role),
  );

  const visibleCompetitions = useMemo(
    () =>
      competitions.filter((competition) => {
        if (competition.status === "approved") {
          return true;
        }

        if (canModerate) {
          return true;
        }

        return currentUser?.id === competition.createdByUserId;
      }),
    [canModerate, competitions, currentUser?.id],
  );

  const filteredCompetitions = useMemo(
    () =>
      visibleCompetitions.filter((competition) =>
        activeFilter === "all" ? true : competition.status === activeFilter,
      ),
    [activeFilter, visibleCompetitions],
  );

  const approvedCount = competitions.filter(
    (competition) => competition.status === "approved",
  ).length;
  const pendingCount = competitions.filter(
    (competition) => competition.status === "pending_review",
  ).length;

  function addCompetition(competition: Competition) {
    setCompetitions((current) => [competition, ...current]);
    setActiveFilter("pending_review");
  }

  function updateCompetition(competition: Competition) {
    setCompetitions((current) =>
      current.map((item) => (item.id === competition.id ? competition : item)),
    );
  }

  return (
    <div className="page-shell space-y-8 fade-in">
      <header className="grid gap-5 lg:grid-cols-[1fr_0.42fr] lg:items-end">
        <SectionTitle
          eyebrow="circuitos"
          title="Campeonatos, desafios e eventos locais."
          description="Descubra onde competir, acompanhar a comunidade e colocar seu surf em movimento."
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="metric-tile">
            <p className="text-3xl font-black text-white">{approvedCount}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-sand-300/58">
              aprovados
            </p>
          </div>
          <div className="metric-tile">
            <p className="text-3xl font-black text-sun-400">{pendingCount}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-sand-300/58">
              em análise
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
        <div className="space-y-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
                  activeFilter === filter.value
                    ? "border-tide-300/35 bg-tide-300/12 text-tide-300"
                    : "border-white/10 bg-white/[0.035] text-sand-300/62 hover:border-white/20"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {filteredCompetitions.length ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredCompetitions.map((competition) => (
                <CircuitCard key={competition.id} competition={competition} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhum Circuito nesse filtro"
              description="Ainda não há eventos com esse recorte. Tente outro filtro ou volte mais tarde."
              actionLabel="Ver todos"
              actionHref="/circuits"
            />
          )}
        </div>

        <aside className="space-y-5">
          {canCreate ? (
            <CircuitSubmitForm spots={spots} onCreated={addCompetition} />
          ) : (
            <div className="surface rounded-[18px] p-5">
              <p className="section-kicker">organizadores</p>
              <h2 className="mt-2 text-xl font-black text-white">
                Cadastre eventos com uma conta organizadora.
              </h2>
              <p className="mt-2 text-sm leading-6 text-sand-100/62">
                Entre como organizador para enviar campeonatos e desafios para análise.
              </p>
            </div>
          )}

          {canModerate ? (
            <CircuitModerationPanel
              competitions={competitions}
              onUpdated={updateCompetition}
            />
          ) : null}
        </aside>
      </section>
    </div>
  );
}
