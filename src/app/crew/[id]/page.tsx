import {
  CalendarDays,
  Clock3,
  Film,
  MapPin,
  Shield,
  Users,
  Waves,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CrewChat } from "@/components/crew/CrewChat";
import { CrewPresenceControls } from "@/components/crew/CrewPresenceControls";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { readDb, toPublicUser } from "@/lib/db";
import { canModerate } from "@/lib/roles";
import { findCrewSessionById, listCrewMessages } from "@/services/crew";
import { getCurrentUser } from "@/services/users";
import type { CrewSessionStatus } from "@/types/circuit";

type CrewDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

function formatCrewDate(date: string, time: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(`${date}T${time}:00`));
}

export default async function CrewDetailPage({ params }: CrewDetailPageProps) {
  const [{ id }, currentUser] = await Promise.all([params, getCurrentUser()]);
  const crew = await findCrewSessionById(id);

  if (!crew) {
    notFound();
  }

  const db = await readDb();
  const spot = db.spots.find((item) => item.id === crew.spotId);
  const creator = db.users.find((user) => user.id === crew.creatorUserId);
  const participantUsers = db.users
    .filter((user) => crew.confirmedUserIds.includes(user.id))
    .map((user) => toPublicUser(user, db));
  const joined = currentUser ? crew.confirmedUserIds.includes(currentUser.id) : false;
  const isCreator = currentUser?.id === crew.creatorUserId;
  const canChat = Boolean(
    currentUser && (joined || isCreator || canModerate(currentUser.role)),
  );
  const messages = canChat ? await listCrewMessages(crew.id) : [];
  const statusStyle = statusStyles[crew.status];

  return (
    <div className="page-shell space-y-8 fade-in">
      <section
        className="surface overflow-hidden rounded-[24px] border-white/10"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(6,16,18,0.92), rgba(6,16,18,0.68)), url(${spot?.imageUrl ?? ""})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-10">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] ${statusStyle.className}`}
              >
                <Users className="h-3.5 w-3.5" />
                {statusStyle.label}
              </span>
              <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-sand-100 backdrop-blur">
                {crew.style}
              </span>
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.98] text-white sm:text-6xl">
              {crew.title ?? `Crew no ${spot?.name ?? "pico"}`}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-sand-100/78">
              {crew.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="metric-tile bg-black/25">
                <CalendarDays className="h-5 w-5 text-tide-300" />
                <p className="mt-2 text-sm font-black text-white">
                  {formatCrewDate(crew.date, crew.time)}
                </p>
              </div>
              <div className="metric-tile bg-black/25">
                <MapPin className="h-5 w-5 text-tide-300" />
                <p className="mt-2 text-sm font-black text-white">
                  {spot?.name ?? crew.spotId}
                </p>
              </div>
              <div className="metric-tile bg-black/25">
                <Shield className="h-5 w-5 text-tide-300" />
                <p className="mt-2 text-sm font-black text-white">
                  {crew.desiredLevel}
                </p>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-[20px] border border-white/10 bg-black/35 p-5 backdrop-blur">
            <p className="section-kicker">presença</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="metric-tile">
                <p className="text-3xl font-black text-white">
                  {crew.confirmedUserIds.length}/{crew.maxPeople}
                </p>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-sand-300/58">
                  confirmados
                </p>
              </div>
              <div className="metric-tile">
                <p className="text-3xl font-black text-tide-300">
                  {crew.interestedUserIds.length}
                </p>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-sand-300/58">
                  interesses
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-sand-100/68">
              <p className="flex items-center gap-2">
                <Waves className="h-4 w-4 text-tide-300" />
                {crew.hasExtraBoard ? "Tem prancha sobrando" : "Cada um leva seu equipamento"}
              </p>
              <p className="flex items-center gap-2">
                <Users className="h-4 w-4 text-tide-300" />
                {crew.acceptsBeginners ? "Iniciantes são bem-vindos" : "Para quem já tem base"}
              </p>
              <p className="flex items-center gap-2">
                <Film className="h-4 w-4 text-tide-300" />
                {crew.wantsFilmer ? "A Crew quer alguém para filmar" : "Filmagem opcional"}
              </p>
            </div>

            <div className="mt-5">
              <CrewPresenceControls
                crewSessionId={crew.id}
                status={crew.status}
                currentUserId={currentUser?.id}
                joined={joined || Boolean(isCreator)}
                isCreator={Boolean(isCreator)}
              />
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.68fr)_minmax(280px,0.32fr)]">
        <CrewChat
          crewSessionId={crew.id}
          canChat={canChat}
          currentUser={
            currentUser
              ? {
                  id: currentUser.id,
                  name: currentUser.name,
                  avatarUrl: currentUser.avatarUrl,
                }
              : undefined
          }
          initialMessages={messages}
        />

        <aside className="space-y-5">
          <section className="surface rounded-[18px] p-5">
            <SectionTitle
              eyebrow="confirmados"
              title="Quem vai cair"
              description="A Crew fica melhor quando todo mundo sabe quem está junto."
            />
            <div className="mt-5 space-y-3">
              {participantUsers.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3"
                >
                  <div
                    className="h-10 w-10 rounded-full bg-cover bg-center ring-2 ring-white/10"
                    style={{ backgroundImage: `url(${participant.avatarUrl})` }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-black text-white">
                      {participant.name}
                    </p>
                    <p className="text-xs text-sand-300/58">
                      {participant.id === creator?.id ? "criador da Crew" : "confirmado"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Link href="/crew" className="secondary-button w-full justify-center">
            <Clock3 className="h-4 w-4" />
            voltar para Crew
          </Link>
        </aside>
      </section>
    </div>
  );
}
