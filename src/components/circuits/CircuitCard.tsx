import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  ShieldAlert,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type { Competition, CompetitionStatus } from "@/types/circuit";

type CircuitCardProps = {
  competition: Competition;
  compact?: boolean;
};

const statusStyles: Record<
  CompetitionStatus,
  { label: string; className: string; icon: typeof Clock3 }
> = {
  draft: {
    label: "rascunho",
    className: "border-white/10 bg-white/[0.055] text-sand-300/70",
    icon: Clock3,
  },
  pending: {
    label: "em análise",
    className: "border-sun-400/25 bg-sun-400/10 text-sun-400",
    icon: Clock3,
  },
  pending_review: {
    label: "em análise",
    className: "border-sun-400/25 bg-sun-400/10 text-sun-400",
    icon: Clock3,
  },
  approved: {
    label: "verificado",
    className: "border-tide-300/25 bg-tide-300/10 text-tide-300",
    icon: CheckCircle2,
  },
  rejected: {
    label: "recusado",
    className: "border-coral-400/25 bg-coral-400/10 text-coral-400",
    icon: XCircle,
  },
  changes_requested: {
    label: "ajustes",
    className: "border-sun-400/25 bg-sun-400/10 text-sun-400",
    icon: Clock3,
  },
  cancelled: {
    label: "cancelado",
    className: "border-coral-400/25 bg-coral-400/10 text-coral-400",
    icon: XCircle,
  },
  finished: {
    label: "finalizado",
    className: "border-white/10 bg-white/[0.055] text-sand-300/70",
    icon: ShieldAlert,
  },
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CircuitCard({ competition, compact = false }: CircuitCardProps) {
  const status = statusStyles[competition.status];
  const StatusIcon = status.icon;
  const banner =
    competition.imageUrl ||
    "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1400&q=80";

  return (
    <article className="surface interactive-card overflow-hidden rounded-[18px]">
      <div
        className={`${compact ? "h-36" : "h-52 sm:h-60"} relative bg-cover bg-center`}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(6,16,18,0.05), rgba(6,16,18,0.9)), url(${banner})`,
        }}
      >
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${status.className}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </span>
          <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-sand-100 backdrop-blur">
            {competition.prestige}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-tide-300">
              <Trophy className="h-4 w-4 shrink-0" />
              Circuito
            </p>
            <h3 className="mt-2 line-clamp-2 text-2xl font-black leading-tight text-white">
              {competition.name}
            </h3>
          </div>
          {competition.estimatedParticipants ? (
            <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 text-right">
              <p className="text-lg font-black text-white">
                {competition.estimatedParticipants}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sand-300/55">
                atletas
              </p>
            </div>
          ) : null}
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="metric-tile">
            <p className="flex items-center gap-2 text-sand-300/58">
              <CalendarDays className="h-4 w-4 text-tide-300" />
              data e horário
            </p>
            <p className="mt-1 font-black text-sand-100">
              {formatDateTime(competition.startsAt)}
            </p>
          </div>
          <div className="metric-tile">
            <p className="flex items-center gap-2 text-sand-300/58">
              <MapPin className="h-4 w-4 text-tide-300" />
              local
            </p>
            <p className="mt-1 line-clamp-1 font-black text-sand-100">
              {competition.location}, {competition.city}/{competition.state}
            </p>
          </div>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-sand-100/68">
          {competition.description}
        </p>

        {competition.categories.length ? (
          <div className="flex flex-wrap gap-2">
            {competition.categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-bold text-sand-100/72"
              >
                {category}
              </span>
            ))}
          </div>
        ) : null}

        {competition.moderationReason ? (
          <div className="rounded-2xl border border-sun-400/20 bg-sun-400/10 p-3 text-xs leading-5 text-sun-400">
            {competition.moderationReason}
          </div>
        ) : null}

        <div className="soft-divider flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-xs text-sand-300/62">
            <p className="line-clamp-1 font-bold text-sand-100">
              {competition.organizerName || "Organizador"}
            </p>
            <p className="line-clamp-1">{competition.rules || "Regras em breve."}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {competition.status === "approved" ? (
              <>
                <a
                  href={competition.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-button px-3 py-2 text-xs"
                >
                  <ExternalLink className="h-4 w-4" />
                  inscrição
                </a>
                <Link
                  href={`/sessions/new?competition=${competition.id}`}
                  className="primary-button px-3 py-2 text-xs"
                >
                  <Users className="h-4 w-4" />
                  registrar bateria
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
