import {
  CalendarDays,
  EyeOff,
  Layers,
  Star,
  Wind,
  Waves,
} from "lucide-react";
import type { Session } from "@/types/session";
import type { User } from "@/types/user";
import { MoodTag } from "@/components/sessions/MoodTag";

type SessionHeroProps = {
  session: Session;
  user: User;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function SessionHero({ session, user }: SessionHeroProps) {
  return (
    <section
      className="relative overflow-hidden border-b border-white/10 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(6, 16, 18, 0.98), rgba(6, 16, 18, 0.8), rgba(6, 16, 18, 0.22)), url(${session.photoUrl})`,
      }}
    >
      <div className="page-shell grid min-h-[620px] items-end gap-6 pb-8 lg:grid-cols-[0.68fr_0.32fr]">
        <div className="slide-up max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <MoodTag mood={session.mood} />
            {!session.isPublic ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-coral-400/25 bg-coral-400/12 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-coral-400">
                <EyeOff className="h-4 w-4" />
                privada
              </span>
            ) : null}
          </div>

          <h1 className="mt-5 text-5xl font-black leading-none text-white sm:text-7xl">
            {session.title}
          </h1>
          <p className="mt-6 max-w-3xl text-2xl font-black leading-10 text-sand-100 sm:text-3xl">
            {session.cinematicText}
          </p>

          <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-sand-100/72">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/28 px-3 py-2 backdrop-blur">
              <CalendarDays className="h-4 w-4 text-tide-300" />
              {formatDate(session.date)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/28 px-3 py-2 backdrop-blur">
              <Waves className="h-4 w-4 text-tide-300" />
              {session.beach}
            </span>
          </div>
        </div>

        <div className="surface rounded-[18px] p-5">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-full bg-cover bg-center ring-2 ring-white/10"
              style={{ backgroundImage: `url(${user.avatarUrl})` }}
              aria-hidden="true"
            />
            <div>
              <p className="font-black text-white">{user.name}</p>
              <p className="text-sm text-sand-300/65">@{user.username}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
            <div className="metric-tile">
              <p className="text-sand-300/58">Mar</p>
              <p className="mt-1 font-black text-white">{session.waveSize}</p>
            </div>
            <div className="metric-tile">
              <p className="text-sand-300/58">Ondas</p>
              <p className="mt-1 font-black text-white">{session.wavesCount}</p>
            </div>
            <div className="metric-tile">
              <p className="flex items-center gap-2 text-sand-300/58">
                <Wind className="h-4 w-4 text-tide-300" />
                Vento
              </p>
              <p className="mt-1 font-black text-white">{session.wind}</p>
            </div>
            <div className="metric-tile">
              <p className="flex items-center gap-2 text-sand-300/58">
                <Star className="h-4 w-4 text-sun-400" />
                Nota
              </p>
              <p className="mt-1 font-black text-white">{session.rating}/5</p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-sand-300/60">
              <Layers className="h-4 w-4 text-tide-300" />
              prancha
            </p>
            <p className="mt-2 font-black text-white">{session.board}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
