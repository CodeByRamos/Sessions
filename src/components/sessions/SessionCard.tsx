import {
  ArrowUpRight,
  CalendarDays,
  Heart,
  MessageCircle,
  Star,
  Trophy,
  Waves,
  Wind,
} from "lucide-react";
import Link from "next/link";
import type { Session } from "@/types/session";
import type { Badge } from "@/types/user";
import { MoodTag } from "@/components/sessions/MoodTag";

type SessionCardProps = {
  session: Session;
  authorName?: string;
  authorAvatarUrl?: string;
  badges?: Badge[];
  compact?: boolean;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function SessionCard({
  session,
  authorName,
  authorAvatarUrl,
  badges = [],
  compact = false,
}: SessionCardProps) {
  const imageClass = compact ? "h-48" : "h-64 sm:h-72";

  return (
    <Link
      href={`/session/${session.id}`}
      className="group surface interactive-card block overflow-hidden rounded-[18px]"
    >
      <div
        className={`relative ${imageClass} bg-cover bg-center transition duration-500 group-hover:scale-[1.015]`}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(6, 16, 18, 0.02), rgba(6, 16, 18, 0.88)), url(${session.photoUrl})`,
        }}
      >
        <div className="absolute left-4 top-4">
          <MoodTag mood={session.mood} showIcon />
        </div>
        {session.sessionType === "competition" ? (
          <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-sun-400/25 bg-black/40 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-sun-400 backdrop-blur">
            <Trophy className="h-4 w-4" />
            campeonato
          </div>
        ) : null}
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-sm font-black text-sun-400 backdrop-blur">
          <Star className="h-4 w-4 fill-current" />
          {session.rating}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-tide-300">
              <Waves className="h-4 w-4" />
              {session.beach}
            </p>
            <h3 className="mt-2 text-2xl font-black leading-tight text-white">
              {session.title}
            </h3>
            <p className="mt-2 flex items-center gap-2 text-sm font-bold text-sand-100/62">
              <CalendarDays className="h-4 w-4" />
              {formatDate(session.date)}
            </p>
          </div>
          <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-sand-300/42 transition group-hover:text-tide-300" />
        </div>

        {authorName ? (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            {authorAvatarUrl ? (
              <div
                className="h-9 w-9 rounded-full bg-cover bg-center ring-2 ring-white/10"
                style={{ backgroundImage: `url(${authorAvatarUrl})` }}
                aria-hidden="true"
              />
            ) : null}
            <div>
              <p className="text-sm font-bold text-sand-100">{authorName}</p>
              <p className="text-xs text-sand-300/65">surfista local</p>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <p className="text-sand-300/55">Mar</p>
            <p className="mt-1 font-black text-sand-100">{session.waveSize}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <p className="text-sand-300/55">Vento</p>
            <p className="mt-1 line-clamp-1 font-black text-sand-100">
              {session.wind}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <p className="text-sand-300/55">Ondas</p>
            <p className="mt-1 font-black text-sand-100">{session.wavesCount}</p>
          </div>
        </div>

        {!compact ? (
          <p className="line-clamp-3 text-sm leading-6 text-sand-100/70">
            {session.cinematicText || session.description}
          </p>
        ) : null}

        {badges.length ? (
          <div className="flex flex-wrap gap-2">
            {badges.slice(0, 3).map((badge) => (
              <span
                key={badge.id}
                className="rounded-full border border-sun-400/20 bg-sun-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-sun-400"
              >
                {badge.name}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex items-center justify-between soft-divider pt-4 text-xs font-black uppercase tracking-[0.14em] text-sand-300/62">
          <span className="inline-flex min-w-0 items-center gap-2">
            <Wind className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{session.board}</span>
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {session.rating * 8}
            </span>
            <span className="inline-flex items-center gap-1 text-tide-300">
              <MessageCircle className="h-4 w-4" />2
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
