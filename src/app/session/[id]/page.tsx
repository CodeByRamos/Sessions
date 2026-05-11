import { Medal, MessageCircle, Shield, Star, Trophy, Waves } from "lucide-react";
import { notFound } from "next/navigation";
import { SessionActions } from "@/components/sessions/SessionActions";
import { SessionHero } from "@/components/sessions/SessionHero";
import { MoodTag } from "@/components/sessions/MoodTag";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getSessionBadgeIds } from "@/lib/badges";
import { getMoodMeta } from "@/lib/moods";
import { canModerate } from "@/lib/roles";
import { findCompetitionById } from "@/services/circuits";
import { findSessionById } from "@/services/sessions";
import { getCurrentUser, getFeaturedUser, getUserById } from "@/services/users";
import { listBadgesForUser } from "@/services/badges";

type SessionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const comments = [
  {
    name: "Lia Costa",
    text: "Essa esquerda do Matadeiro quando abre cedo parece outro lugar.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Theo Marinho",
    text: "Relato bonito. Dá para sentir a remada e o silêncio antes do crowd chegar.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
];

const relatedSurfers = [
  {
    name: "Lia Costa",
    role: "longboard · Campeche",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Theo Marinho",
    role: "shortboard · Mole",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Nina Sal",
    role: "fish twin · Barra",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
];

const gallery = [
  "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=900&q=80",
];

export default async function SessionDetailPage({ params }: SessionPageProps) {
  const { id } = await params;
  const [session, featuredUser, currentUser] = await Promise.all([
    findSessionById(id),
    getFeaturedUser(),
    getCurrentUser(),
  ]);

  if (!session) {
    notFound();
  }

  if (
    !session.isPublic &&
    currentUser?.id !== session.userId &&
    !canModerate(currentUser?.role)
  ) {
    notFound();
  }

  const competition = session.competitionId
    ? await findCompetitionById(session.competitionId)
    : null;
  const sessionUser = (await getUserById(session.userId)) ?? featuredUser;
  const mood = getMoodMeta(session.mood);
  const badgeIds = getSessionBadgeIds(session);
  const badges = (await listBadgesForUser(session.userId)).filter((badge) =>
    badgeIds.includes(badge.id),
  );
  const isOwner = currentUser?.id === session.userId;

  return (
    <div className="fade-in">
      <SessionHero session={session} user={sessionUser} />

      <div className="page-shell grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="space-y-8">
          <section className="surface rounded-[18px] p-6 sm:p-8">
            <p className="section-kicker">relato bruto</p>
            <p className="mt-4 text-lg leading-9 text-sand-100/78">
              {session.description}
            </p>
          </section>

          <section className="surface rounded-[18px] p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="section-kicker">mood visual</p>
                <h2 className="mt-2 text-2xl font-black text-white">{mood.label}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-sand-100/62">
                  {mood.description}
                </p>
              </div>
              <MoodTag mood={session.mood} showIcon />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Dificuldade", session.difficulty ?? "moderada"],
                ["Prancha", session.board],
                ["Condição", `${session.waveSize} · ${session.wind}`],
              ].map(([label, value]) => (
                <div key={label} className="metric-tile">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-sand-300/55">
                    {label}
                  </p>
                  <p className="mt-2 line-clamp-2 font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {session.sessionType === "competition" ? (
            <section className="surface rounded-[18px] p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sun-400/12 text-sun-400 ring-1 ring-sun-400/25">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="section-kicker">session de campeonato</p>
                  <h2 className="mt-2 text-2xl font-black text-white">
                    {competition?.name ?? "Circuito vinculado"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-sand-100/62">
                    {session.competitionFeeling ||
                      "Uma bateria registrada como memória competitiva."}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Categoria", session.competitionCategory || "não informada"],
                  ["Resultado", session.competitionResult || "em aberto"],
                  ["Rodada", session.competitionRound || "sem fase"],
                  ["Pontuação", session.competitionScore || "sem nota"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                  >
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-sand-300/58">
                      {label === "Resultado" ? (
                        <Medal className="h-4 w-4 text-sun-400" />
                      ) : (
                        <Shield className="h-4 w-4 text-tide-300" />
                      )}
                      {label}
                    </p>
                    <p className="mt-2 line-clamp-2 font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-5">
            <SectionTitle
              eyebrow="galeria"
              title="Fragmentos da memória"
              description="As imagens que ajudam a lembrar a luz, o mar e a sensação daquele dia."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {[...(session.mediaUrls ?? [session.photoUrl]), ...gallery]
                .slice(0, 3)
                .map((photo, index) => (
                <div
                  key={photo}
                  className={`min-h-56 rounded-[18px] border border-white/10 bg-cover bg-center ${
                    index === 0 ? "sm:col-span-2" : ""
                  }`}
                  style={{
                    backgroundImage: `linear-gradient(180deg, transparent, rgba(6,16,18,0.36)), url(${photo})`,
                  }}
                />
              ))}
            </div>
          </section>

          {badges.length ? (
            <section className="space-y-5">
              <SectionTitle
                eyebrow="badges"
                title="Conquistas ligadas a esta memória"
                description="Badges que fazem sentido para o pico, mood ou marco desta session."
              />
              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <span
                    key={badge.id}
                    className="rounded-full border border-sun-400/20 bg-sun-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-sun-400"
                  >
                    {badge.name}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-5">
            <SectionTitle
              eyebrow="comentários"
              title="Lineup comentando"
              description="Reações da comunidade para manter a memória viva depois que a session termina."
            />
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.name}
                  className="surface flex gap-4 rounded-[18px] p-4"
                >
                  <div
                    className="h-11 w-11 shrink-0 rounded-full bg-cover bg-center ring-2 ring-white/10"
                    style={{ backgroundImage: `url(${comment.avatar})` }}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-black text-white">{comment.name}</p>
                    <p className="mt-1 text-sm leading-6 text-sand-100/66">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="surface rounded-[18px] p-5">
            <p className="section-kicker">memória</p>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <span className="flex items-center gap-2 text-sm text-sand-100/62">
                  <Star className="h-4 w-4 text-sun-400" />
                  nota
                </span>
                <span className="font-black text-white">{session.rating}/5</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <span className="flex items-center gap-2 text-sm text-sand-100/62">
                  <Waves className="h-4 w-4 text-tide-300" />
                  ondas
                </span>
                <span className="font-black text-white">{session.wavesCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <span className="flex items-center gap-2 text-sm text-sand-100/62">
                  <MessageCircle className="h-4 w-4 text-tide-300" />
                  comentários
                </span>
                <span className="font-black text-white">{comments.length}</span>
              </div>
            </div>
          </div>

          {isOwner ? (
            <div className="surface rounded-[18px] p-5">
              <p className="section-kicker">ações</p>
              <div className="mt-4">
                <SessionActions sessionId={session.id} />
              </div>
            </div>
          ) : null}

          <div className="surface rounded-[18px] p-5">
            <p className="section-kicker">surfistas próximos</p>
            <div className="mt-5 space-y-3">
              {relatedSurfers.map((surfer) => (
                <div
                  key={surfer.name}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3"
                >
                  <div
                    className="h-10 w-10 rounded-full bg-cover bg-center ring-2 ring-white/10"
                    style={{ backgroundImage: `url(${surfer.avatar})` }}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-black text-white">{surfer.name}</p>
                    <p className="text-xs text-sand-100/56">{surfer.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
