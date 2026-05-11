"use client";

import { useState } from "react";
import type { Session } from "@/types/session";

type AdminSessionsPanelProps = {
  sessions: Session[];
  userNames: Record<string, string>;
};

export function AdminSessionsPanel({ sessions, userNames }: AdminSessionsPanelProps) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const filteredSessions = sessions.filter((session) => {
    const value = `${session.title} ${session.beach} ${session.mood} ${userNames[session.userId] ?? ""}`.toLowerCase();
    return value.includes(query.toLowerCase());
  });

  async function setVisibility(sessionId: string, isPublic: boolean) {
    if (!window.confirm(isPublic ? "Restaurar essa session no feed público?" : "Ocultar essa session do feed público?")) {
      return;
    }

    setMessage("Salvando session...");
    const response = await fetch(`/api/admin/sessions/${sessionId}/visibility`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic }),
    });
    const data = (await response.json()) as { error?: string };

    setMessage(response.ok ? "Session atualizada." : data.error ?? "Não foi possível salvar.");
  }

  return (
    <section className="surface rounded-[20px] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="section-kicker">sessions</p>
          <h2 className="mt-1 text-2xl font-black text-white">Registros públicos</h2>
        </div>
        <input
          className="field max-w-sm"
          placeholder="Buscar por surfista, pico ou mood"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {message ? (
        <p className="mt-4 rounded-2xl border border-tide-300/20 bg-tide-300/10 p-3 text-sm font-bold text-tide-100">
          {message}
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        {filteredSessions.map((session) => (
          <article
            key={session.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="min-w-0">
              <p className="line-clamp-1 text-sm font-black text-white">{session.title}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-sand-100/45">
                {userNames[session.userId] ?? "surfista"} · {session.beach} ·{" "}
                {new Date(session.date).toLocaleDateString("pt-BR")}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-sand-100/58">
                {session.description}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-tide-200">
                {session.isPublic ? "pública" : "oculta"}
              </span>
              <button
                type="button"
                className="secondary-button px-3 py-2 text-xs"
                onClick={() => setVisibility(session.id, !session.isPublic)}
              >
                {session.isPublic ? "ocultar" : "restaurar"}
              </button>
            </div>
          </article>
        ))}
        {filteredSessions.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm text-sand-100/62">
            Nenhuma session encontrada.
          </p>
        ) : null}
      </div>
    </section>
  );
}
