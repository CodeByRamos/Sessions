"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Film,
  Hand,
  MapPin,
  MessageCircle,
  Plus,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { CrewSession, CrewSessionStatus, CrewSessionStyle } from "@/types/circuit";
import type { Spot } from "@/types/spot";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionTitle } from "@/components/ui/SectionTitle";

type CrewBoardProps = {
  crewSessions: CrewSession[];
  spots: Spot[];
  currentUserId?: string;
};

const styles: CrewSessionStyle[] = [
  "treino",
  "free surf",
  "dawn patrol",
  "filmagem",
  "longboard",
  "iniciante",
  "campeonato",
];

const statusStyles: Record<CrewSessionStatus, { label: string; className: string }> = {
  open: {
    label: "aberta",
    className: "border-tide-300/25 bg-tide-300/10 text-tide-300",
  },
  full: {
    label: "cheia",
    className: "border-sun-400/25 bg-sun-400/10 text-sun-400",
  },
  closed: {
    label: "encerrada",
    className: "border-white/10 bg-white/[0.05] text-sand-300/66",
  },
  cancelled: {
    label: "cancelada",
    className: "border-coral-400/25 bg-coral-400/10 text-coral-400",
  },
};

const emptyForm = {
  title: "",
  spotId: "",
  date: "",
  time: "",
  desiredLevel: "qualquer nível",
  style: "free surf" as CrewSessionStyle,
  description: "",
  maxPeople: "4",
  hasExtraBoard: false,
  acceptsBeginners: true,
  wantsFilmer: false,
};

function formatCrewDate(date: string, time: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(`${date}T${time}:00`));
}

export function CrewBoard({
  crewSessions: initialCrewSessions,
  spots,
  currentUserId,
}: CrewBoardProps) {
  const [crewSessions, setCrewSessions] = useState(initialCrewSessions);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({
    spotId: "",
    date: "",
    desiredLevel: "",
    style: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [actionStatus, setActionStatus] = useState("");
  const [error, setError] = useState("");

  const spotById = useMemo(
    () => new Map(spots.map((spot) => [spot.id, spot])),
    [spots],
  );

  const filteredCrew = useMemo(
    () =>
      crewSessions.filter((crew) => {
        const levelMatch = filters.desiredLevel
          ? crew.desiredLevel.toLowerCase().includes(filters.desiredLevel.toLowerCase())
          : true;

        return (
          (!filters.spotId || crew.spotId === filters.spotId) &&
          (!filters.date || crew.date === filters.date) &&
          (!filters.style || crew.style === filters.style) &&
          levelMatch
        );
      }),
    [crewSessions, filters],
  );

  function updateForm<Key extends keyof typeof form>(
    key: Key,
    value: (typeof form)[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const response = await fetch("/api/crew", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        maxPeople: Number(form.maxPeople),
      }),
    });
    const data = (await response.json()) as {
      crewSession?: CrewSession;
      error?: string;
    };

    if (!response.ok || !data.crewSession) {
      setError(data.error ?? "Não foi possível criar a Crew.");
      setStatus("idle");
      return;
    }

    setCrewSessions((current) => [data.crewSession as CrewSession, ...current]);
    setForm(emptyForm);
    setStatus("success");
  }

  async function crewAction(id: string, action: "interest" | "join") {
    setActionStatus(`${id}-${action}`);
    setError("");

    const response = await fetch(`/api/crew/${id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = (await response.json()) as {
      crewSession?: CrewSession;
      error?: string;
    };

    if (!response.ok || !data.crewSession) {
      setError(data.error ?? "Ação não concluída.");
      setActionStatus("");
      return;
    }

    setCrewSessions((current) =>
      current.map((crew) => (crew.id === id ? (data.crewSession as CrewSession) : crew)),
    );
    setActionStatus("");
  }

  return (
    <div className="page-shell space-y-8 fade-in">
      <header className="grid gap-5 lg:grid-cols-[1fr_0.42fr] lg:items-end">
        <SectionTitle
          eyebrow="crew"
          title="Encontre gente para cair junto."
          description="Combine uma dawn patrol, marque treino no seu pico favorito ou chame alguém para filmar uma session."
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="metric-tile">
            <p className="text-3xl font-black text-white">{crewSessions.length}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-sand-300/58">
              crews criadas
            </p>
          </div>
          <div className="metric-tile">
            <p className="text-3xl font-black text-tide-300">
              {crewSessions.filter((crew) => crew.status === "open").length}
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-sand-300/58">
              abertas
            </p>
          </div>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-coral-400/25 bg-coral-400/10 p-3 text-sm font-bold text-coral-400">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.42fr_1fr]">
        <aside className="surface h-fit rounded-[18px] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tide-300/12 text-tide-300 ring-1 ring-tide-300/20">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Criar Crew</h2>
              <p className="mt-1 text-sm leading-6 text-sand-100/62">
                Marque uma session futura com regras claras antes de chamar a galera.
              </p>
            </div>
          </div>

          {!currentUserId ? (
            <div className="mt-5 rounded-2xl border border-sun-400/20 bg-sun-400/10 p-3 text-sm leading-6 text-sun-400">
              Entre na conta para criar ou confirmar presença em uma Crew.
              <Link href="/sign-in" className="mt-3 flex font-black text-white">
                fazer login
              </Link>
            </div>
          ) : null}

          <form onSubmit={handleCreate} className="mt-5 space-y-4">
            <label className="space-y-2">
              <span className="label">nome da Crew</span>
              <input
                className="field"
                maxLength={80}
                placeholder="Dawn patrol no Tombo"
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="label">praia</span>
              <select
                className="field"
                value={form.spotId}
                onChange={(event) => updateForm("spotId", event.target.value)}
                required
              >
                <option value="">escolha o pico</option>
                {spots.map((spot) => (
                  <option key={spot.id} value={spot.id}>
                    {spot.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="label">data</span>
                <input
                  className="field"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={form.date}
                  onChange={(event) => updateForm("date", event.target.value)}
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="label">hora</span>
                <input
                  className="field"
                  type="time"
                  value={form.time}
                  onChange={(event) => updateForm("time", event.target.value)}
                  required
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="label">nível desejado</span>
              <input
                className="field"
                maxLength={60}
                value={form.desiredLevel}
                onChange={(event) => updateForm("desiredLevel", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="label">estilo</span>
              <select
                className="field"
                value={form.style}
                onChange={(event) =>
                  updateForm("style", event.target.value as CrewSessionStyle)
                }
              >
                {styles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="label">descrição</span>
              <textarea
                className="field min-h-28 resize-y leading-6"
                maxLength={280}
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
                required
              />
            </label>

            <label className="space-y-2">
              <span className="label">máximo de pessoas</span>
              <input
                className="field"
                type="number"
                min={2}
                max={20}
                value={form.maxPeople}
                onChange={(event) => updateForm("maxPeople", event.target.value)}
              />
            </label>

            <div className="grid gap-2 text-sm">
              {[
                ["hasExtraBoard", "tem prancha sobrando"],
                ["acceptsBeginners", "aceita iniciantes"],
                ["wantsFilmer", "quer alguém para filmar"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sand-100/72"
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(form[key as keyof typeof form])}
                    onChange={(event) =>
                      updateForm(key as keyof typeof form, event.target.checked as never)
                    }
                  />
                </label>
              ))}
            </div>

            {status === "success" ? (
              <div className="flex items-start gap-3 rounded-2xl border border-tide-300/25 bg-tide-300/10 p-3 text-sm text-tide-300">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                Crew criada.
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!currentUserId || status === "loading"}
              className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Users className="h-4 w-4" />
              {status === "loading" ? "criando..." : "publicar Crew"}
            </button>
          </form>
        </aside>

        <div className="space-y-5">
          <div className="surface rounded-[18px] p-4">
            <div className="grid gap-3 md:grid-cols-4">
              <select
                className="field"
                value={filters.spotId}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, spotId: event.target.value }))
                }
              >
                <option value="">todas as praias</option>
                {spots.map((spot) => (
                  <option key={spot.id} value={spot.id}>
                    {spot.name}
                  </option>
                ))}
              </select>
              <input
                className="field"
                type="date"
                value={filters.date}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, date: event.target.value }))
                }
              />
              <select
                className="field"
                value={filters.style}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, style: event.target.value }))
                }
              >
                <option value="">todos os estilos</option>
                {styles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
              <input
                className="field"
                placeholder="nível"
                value={filters.desiredLevel}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    desiredLevel: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          {filteredCrew.length ? (
            <div className="grid gap-4">
              {filteredCrew.map((crew) => {
                const spot = spotById.get(crew.spotId);
                const statusStyle = statusStyles[crew.status];
                const joined = currentUserId
                  ? crew.confirmedUserIds.includes(currentUserId)
                  : false;
                const interested = currentUserId
                  ? crew.interestedUserIds.includes(currentUserId)
                  : false;

                return (
                  <article
                    key={crew.id}
                    className="surface interactive-card rounded-[18px] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${statusStyle.className}`}
                          >
                            {statusStyle.label}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-sand-100/72">
                            {crew.style}
                          </span>
                        </div>

                        <h3 className="mt-4 line-clamp-2 text-2xl font-black text-white">
                          {crew.title ?? `${spot?.name ?? "Pico secreto"} às ${crew.time}`}
                        </h3>
                        <p className="mt-2 line-clamp-3 max-w-2xl text-sm leading-6 text-sand-100/66">
                          {crew.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm sm:min-w-72">
                        <div className="metric-tile">
                          <p className="flex items-center gap-2 text-sand-300/58">
                            <CalendarDays className="h-4 w-4 text-tide-300" />
                            quando
                          </p>
                          <p className="mt-1 font-black text-sand-100">
                            {formatCrewDate(crew.date, crew.time)}
                          </p>
                        </div>
                        <div className="metric-tile">
                          <p className="flex items-center gap-2 text-sand-300/58">
                            <MapPin className="h-4 w-4 text-tide-300" />
                            pico
                          </p>
                          <p className="mt-1 line-clamp-1 font-black text-sand-100">
                            {spot?.name ?? crew.spotId}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                        <p className="flex items-center gap-2 text-xs text-sand-300/58">
                          <Shield className="h-4 w-4 text-tide-300" />
                          nível
                        </p>
                        <p className="mt-1 line-clamp-1 font-black text-sand-100">
                          {crew.desiredLevel}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                        <p className="flex items-center gap-2 text-xs text-sand-300/58">
                          <Users className="h-4 w-4 text-tide-300" />
                          confirmados
                        </p>
                        <p className="mt-1 font-black text-sand-100">
                          {crew.confirmedUserIds.length}/{crew.maxPeople}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                        <p className="text-xs text-sand-300/58">iniciantes</p>
                        <p className="mt-1 font-black text-sand-100">
                          {crew.acceptsBeginners ? "sim" : "não"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                        <p className="flex items-center gap-2 text-xs text-sand-300/58">
                          <Film className="h-4 w-4 text-tide-300" />
                          filmagem
                        </p>
                        <p className="mt-1 font-black text-sand-100">
                          {crew.wantsFilmer ? "procura" : "opcional"}
                        </p>
                      </div>
                    </div>

                    <div className="soft-divider mt-4 flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="flex items-center gap-2 text-sm text-sand-100/62">
                        <Clock3 className="h-4 w-4 text-tide-300" />
                        {crew.hasExtraBoard
                          ? "Tem prancha sobrando"
                          : "Cada um leva seu equipamento"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/crew/${crew.id}`}
                          className="secondary-button px-3 py-2 text-xs"
                        >
                          <MessageCircle className="h-4 w-4" />
                          {joined ? "abrir chat" : "ver detalhes"}
                        </Link>
                        <button
                          type="button"
                          disabled={!currentUserId || interested || joined || crew.status !== "open"}
                          onClick={() => crewAction(crew.id, "interest")}
                          className="secondary-button px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Hand className="h-4 w-4" />
                          {actionStatus === `${crew.id}-interest`
                            ? "salvando..."
                            : interested
                              ? "interesse enviado"
                              : "tenho interesse"}
                        </button>
                        <button
                          type="button"
                          disabled={!currentUserId || joined || crew.status !== "open"}
                          onClick={() => crewAction(crew.id, "join")}
                          className="primary-button px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Users className="h-4 w-4" />
                          {actionStatus === `${crew.id}-join`
                            ? "entrando..."
                            : joined
                              ? "confirmado"
                              : "entrar na Crew"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Nenhuma Crew encontrada"
              description="Ajuste os filtros ou crie a próxima session coletiva do pico."
              actionLabel="Nova session"
              actionHref="/sessions/new"
            />
          )}
        </div>
      </section>
    </div>
  );
}
