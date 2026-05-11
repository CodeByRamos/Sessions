"use client";

import { useMemo, useState } from "react";
import type { Competition, CompetitionStatus } from "@/types/circuit";
import type { UserRole } from "@/types/user";

type AdminCircuitsTableProps = {
  competitions: Competition[];
  organizerNames: Record<string, string>;
  role: UserRole;
};

const reviewStatuses: Array<{ value: CompetitionStatus; label: string }> = [
  { value: "approved", label: "aprovar" },
  { value: "changes_requested", label: "pedir ajustes" },
  { value: "rejected", label: "recusar" },
  { value: "cancelled", label: "cancelar" },
  { value: "finished", label: "finalizar" },
];

export function AdminCircuitsTable({
  competitions,
  organizerNames,
  role,
}: AdminCircuitsTableProps) {
  const [filter, setFilter] = useState<CompetitionStatus | "all">("all");
  const [message, setMessage] = useState("");
  const canModerate = role === "MODERATOR" || role === "ADMIN";
  const visibleCompetitions = useMemo(
    () =>
      filter === "all"
        ? competitions
        : competitions.filter((competition) => competition.status === filter),
    [competitions, filter],
  );

  async function moderate(id: string, status: CompetitionStatus) {
    const needsReason = ["rejected", "changes_requested", "cancelled"].includes(status);
    const reason = needsReason
      ? window.prompt("Escreva uma mensagem curta para o organizador.")
      : "";

    if (needsReason && !reason) {
      return;
    }

    setMessage("Salvando decisão...");
    const response = await fetch(`/api/circuits/${id}/moderate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason }),
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(data.error ?? "Não foi possível salvar a decisão.");
      return;
    }

    setMessage(
      status === "approved"
        ? "Evento aprovado."
        : status === "changes_requested"
          ? "Ajustes solicitados."
          : "Decisão salva.",
    );
  }

  return (
    <section className="surface rounded-[20px] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="section-kicker">circuitos</p>
          <h2 className="mt-1 text-2xl font-black text-white">
            {canModerate ? "Eventos da plataforma" : "Meus eventos"}
          </h2>
        </div>
        <select
          className="field max-w-xs"
          value={filter}
          onChange={(event) => setFilter(event.target.value as CompetitionStatus | "all")}
        >
          <option value="all">todos os status</option>
          <option value="pending_review">em análise</option>
          <option value="approved">aprovados</option>
          <option value="changes_requested">ajustes pedidos</option>
          <option value="rejected">recusados</option>
          <option value="cancelled">cancelados</option>
          <option value="finished">finalizados</option>
        </select>
      </div>

      {message ? (
        <p className="mt-4 rounded-2xl border border-tide-300/20 bg-tide-300/10 p-3 text-sm font-bold text-tide-100">
          {message}
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        {visibleCompetitions.map((competition) => (
          <article
            key={competition.id}
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="line-clamp-1 text-lg font-black text-white">
                    {competition.name}
                  </h3>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-tide-200">
                    {competition.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-sand-100/62">
                  {competition.description}
                </p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-sand-100/45">
                  {competition.location} · {competition.city}/{competition.state} ·{" "}
                  {new Date(competition.startsAt).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
                <p className="mt-2 text-xs text-sand-100/55">
                  Organizador: {organizerNames[competition.createdByUserId] ?? competition.organizerName}
                </p>
                {competition.moderationReason ? (
                  <p className="mt-3 rounded-xl border border-coral-400/20 bg-coral-400/10 p-3 text-sm text-coral-100">
                    {competition.moderationReason}
                  </p>
                ) : null}
              </div>

              {canModerate ? (
                <div className="flex min-w-48 flex-wrap gap-2 lg:justify-end">
                  {reviewStatuses.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => moderate(competition.id, status.value)}
                      className="secondary-button px-3 py-2 text-xs"
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        ))}

        {visibleCompetitions.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm text-sand-100/62">
            Ainda não há eventos nessa lista.
          </p>
        ) : null}
      </div>
    </section>
  );
}
