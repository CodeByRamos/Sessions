"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Edit3, Trash2, Trophy, Waves } from "lucide-react";
import Link from "next/link";
import type { Session } from "@/types/session";
import type { Spot } from "@/types/spot";
import { MoodTag } from "@/components/sessions/MoodTag";

type MySessionsClientProps = {
  initialSessions: Session[];
  spots: Spot[];
};

function monthKey(date: string) {
  return date.slice(0, 7);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function MySessionsClient({ initialSessions, spots }: MySessionsClientProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const [spotFilter, setSpotFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [boardFilter, setBoardFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [message, setMessage] = useState("");

  const boards = [...new Set(sessions.map((session) => session.board).filter(Boolean))];
  const months = [...new Set(sessions.map((session) => monthKey(session.date)))];
  const filtered = sessions.filter((session) => {
    const spotMatch = spotFilter === "all" || session.spotId === spotFilter;
    const typeMatch = typeFilter === "all" || (session.sessionType ?? "common") === typeFilter;
    const boardMatch = boardFilter === "all" || session.board === boardFilter;
    const monthMatch = monthFilter === "all" || monthKey(session.date) === monthFilter;
    return spotMatch && typeMatch && boardMatch && monthMatch;
  });

  const stats = useMemo(() => {
    const totalWaves = sessions.reduce((sum, session) => sum + session.wavesCount, 0);
    const bestSession = sessions.slice().sort((a, b) => b.rating - a.rating)[0];
    const lastSession = sessions.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
    const spotCounts = new Map<string, number>();
    sessions.forEach((session) => {
      if (session.spotId) {
        spotCounts.set(session.spotId, (spotCounts.get(session.spotId) ?? 0) + 1);
      }
    });
    const mostSurfedSpotId = [...spotCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const mostSurfedSpot = spots.find((spot) => spot.id === mostSurfedSpotId)?.name ?? "sem pico";

    return {
      total: sessions.length,
      totalWaves,
      bestSession: bestSession?.title ?? "sem session",
      lastSession: lastSession ? formatDate(lastSession.date) : "sem registro",
      mostSurfedSpot,
    };
  }, [sessions, spots]);

  async function deleteSession(id: string) {
    const ok = window.confirm("Excluir esta session? Essa ação não pode ser desfeita.");

    if (!ok) {
      return;
    }

    const response = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(data.error ?? "Não foi possível excluir.");
      return;
    }

    setSessions((current) => current.filter((session) => session.id !== id));
    setMessage("Session excluída com segurança.");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-5">
        {[
          ["Total", stats.total],
          ["Pico top", stats.mostSurfedSpot],
          ["Ondas", stats.totalWaves],
          ["Melhor", stats.bestSession],
          ["Última", stats.lastSession],
        ].map(([label, value]) => (
          <div key={label} className="surface rounded-[18px] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sand-300/60">
              {label}
            </p>
            <p className="mt-2 line-clamp-2 text-xl font-black text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="surface rounded-[18px] p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <select className="field" value={spotFilter} onChange={(e) => setSpotFilter(e.target.value)}>
            <option value="all">Todas as praias</option>
            {spots.map((spot) => (
              <option key={spot.id} value={spot.id}>
                {spot.name}
              </option>
            ))}
          </select>
          <select className="field" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Todos os tipos</option>
            <option value="common">Comum</option>
            <option value="competition">Campeonato</option>
            <option value="crew">Crew</option>
          </select>
          <select className="field" value={boardFilter} onChange={(e) => setBoardFilter(e.target.value)}>
            <option value="all">Todas as pranchas</option>
            {boards.map((board) => (
              <option key={board} value={board}>
                {board}
              </option>
            ))}
          </select>
          <select className="field" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            <option value="all">Todos os meses</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl border border-tide-300/25 bg-tide-300/10 p-3 text-sm font-bold text-tide-300">
          {message}
        </div>
      ) : null}

      {filtered.length ? (
        <section className="space-y-3">
          {filtered.map((session) => (
            <article
              key={session.id}
              className="surface interactive-card grid gap-4 overflow-hidden rounded-[18px] p-4 md:grid-cols-[180px_minmax(0,1fr)_auto]"
            >
              <Link
                href={`/session/${session.id}`}
                className="min-h-36 rounded-2xl bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(180deg, transparent, rgba(6,16,18,0.42)), url(${session.photoUrl})`,
                }}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <MoodTag mood={session.mood} />
                  {session.sessionType === "competition" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-sun-400/25 bg-sun-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-sun-400">
                      <Trophy className="h-3.5 w-3.5" />
                      campeonato
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-3 break-words text-2xl font-black text-white">
                  {session.title}
                </h2>
                <p className="mt-2 flex flex-wrap items-center gap-3 text-sm font-bold text-sand-100/62">
                  <span className="inline-flex items-center gap-2">
                    <Waves className="h-4 w-4 text-tide-300" />
                    {session.beach}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-tide-300" />
                    {formatDate(session.date)}
                  </span>
                </p>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-sand-100/64">
                  {session.description}
                </p>
              </div>
              <div className="flex gap-2 md:flex-col">
                <Link href={`/sessions/${session.id}/edit`} className="secondary-button px-4 py-2">
                  <Edit3 className="h-4 w-4" />
                  editar
                </Link>
                <button
                  type="button"
                  onClick={() => deleteSession(session.id)}
                  className="secondary-button px-4 py-2 text-coral-400"
                >
                  <Trash2 className="h-4 w-4" />
                  excluir
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="surface rounded-[18px] p-8 text-center">
          <h2 className="text-2xl font-black text-white">Nenhuma session encontrada</h2>
          <p className="mt-2 text-sm text-sand-100/62">
            Ajuste os filtros ou registre uma nova memória.
          </p>
          <Link href="/sessions/new" className="primary-button mt-6">
            nova session
          </Link>
        </div>
      )}
    </div>
  );
}
