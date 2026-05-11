"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, ShieldCheck, Square, XCircle } from "lucide-react";
import type { Competition, CompetitionStatus } from "@/types/circuit";

type CircuitModerationPanelProps = {
  competitions: Competition[];
  onUpdated: (competition: Competition) => void;
};

const moderationActions: {
  status: CompetitionStatus;
  label: string;
  icon: typeof CheckCircle2;
}[] = [
  { status: "approved", label: "aprovar", icon: CheckCircle2 },
  { status: "rejected", label: "recusar", icon: XCircle },
  { status: "changes_requested", label: "pedir ajustes", icon: Clock3 },
  { status: "finished", label: "finalizar", icon: Square },
];

export function CircuitModerationPanel({
  competitions,
  onUpdated,
}: CircuitModerationPanelProps) {
  const [loadingId, setLoadingId] = useState("");
  const [error, setError] = useState("");
  const reviewQueue = competitions.filter((competition) =>
    ["pending_review", "changes_requested"].includes(competition.status),
  );

  async function updateStatus(id: string, status: CompetitionStatus) {
    const needsReason = ["rejected", "changes_requested"].includes(status);
    const reason = needsReason
      ? window.prompt("Explique a decisão para o organizador.")
      : "";

    if (needsReason && !reason?.trim()) {
      setError("Informe um motivo para essa decisão.");
      return;
    }

    setLoadingId(`${id}-${status}`);
    setError("");

    const response = await fetch(`/api/circuits/${id}/moderate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason }),
    });
    const data = (await response.json()) as {
      competition?: Competition;
      error?: string;
    };

    if (!response.ok || !data.competition) {
      setError(data.error ?? "Não foi possível moderar o Circuito.");
      setLoadingId("");
      return;
    }

    onUpdated(data.competition);
    setLoadingId("");
  }

  return (
    <section className="surface rounded-[18px] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sun-400/12 text-sun-400 ring-1 ring-sun-400/20">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">Moderação</h2>
          <p className="mt-1 text-sm leading-6 text-sand-100/62">
            Revise eventos enviados por organizadores antes de publicar para a comunidade.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-coral-400/25 bg-coral-400/10 p-3 text-sm font-bold text-coral-400">
          {error}
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        {reviewQueue.length ? (
          reviewQueue.map((competition) => (
            <div
              key={competition.id}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-sun-400">
                    <Clock3 className="h-4 w-4" />
                    em análise
                  </p>
                  <h3 className="mt-2 line-clamp-1 text-lg font-black text-white">
                    {competition.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-sand-100/62">
                    {competition.reviewMessage || competition.description}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {moderationActions.map((action) => {
                    const Icon = action.icon;
                    const isLoading = loadingId === `${competition.id}-${action.status}`;

                    return (
                      <button
                        key={action.status}
                        type="button"
                        disabled={Boolean(loadingId)}
                        onClick={() => updateStatus(competition.id, action.status)}
                        className="secondary-button px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Icon className="h-4 w-4" />
                        {isLoading ? "salvando..." : action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-sand-100/62">
            Nenhum Circuito aguardando análise agora.
          </div>
        )}
      </div>
    </section>
  );
}
