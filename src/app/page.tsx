import {
  ArrowRight,
  BookOpen,
  Compass,
  Flame,
  MapPin,
  Plus,
  Shield,
  Waves,
} from "lucide-react";
import Link from "next/link";
import { BadgeCard } from "@/components/profile/BadgeCard";
import { SessionCard } from "@/components/sessions/SessionCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { listPublicSessions, listSessionsByUser } from "@/services/sessions";
import { getCurrentUser, getFeaturedUser } from "@/services/users";
import { getMostSurfedSpot } from "@/services/spots";

const features = [
  {
    title: "Diário de evolução",
    description: "Registre pico, condição, prancha, mood e relato em poucos passos.",
    icon: BookOpen,
  },
  {
    title: "Feed local",
    description: "Veja como outros surfistas viveram o mesmo mar, sem ruído.",
    icon: Compass,
  },
  {
    title: "Perfil RPG",
    description: "Level, XP, streak e badges dão forma para a sua trajetória.",
    icon: Shield,
  },
];

const localSpots = [
  { name: "Praia do Tombo", sessions: 42, mood: "base local" },
  { name: "Bostrô", sessions: 18, mood: "zero hora" },
  { name: "Praia das Astúrias", sessions: 27, mood: "memória afetiva" },
];

export default async function HomePage() {
  const [publicSessions, currentUser, featuredUser] = await Promise.all([
    listPublicSessions(),
    getCurrentUser(),
    getFeaturedUser(),
  ]);
  const mockUser = currentUser ?? featuredUser;
  const userSessions = currentUser
    ? await listSessionsByUser(currentUser.id)
    : publicSessions;
  const mostSurfedSpot = await getMostSurfedSpot(mockUser.id);
  const featuredSession = publicSessions[0];
  const latestSessions = userSessions.slice(0, 3);
  const rareBadges = mockUser.badges.filter((badge) => badge.rarity !== "base");
  const unlockedBadges = mockUser.badges.filter((badge) => badge.unlocked).length;
  const heroMetrics = [
    {
      label: "sessions",
      value: mockUser.totalSessions,
      helper: "registradas",
      icon: Waves,
    },
    {
      label: "streak",
      value: `${mockUser.streak} dias`,
      helper: "ritmo atual",
      icon: Flame,
    },
    {
      label: "badges",
      value: unlockedBadges,
      helper: "liberadas",
      icon: Shield,
    },
  ];

  return (
    <div className="fade-in">
      <section className="page-shell">
        <div className="grid gap-6 lg:grid-cols-[0.58fr_0.42fr]">
          <div className="surface overflow-hidden rounded-[18px] p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="section-kicker">
                {currentUser ? `Olá, ${mockUser.name}` : "surf journal social"}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-sand-100/62">
                MVP 1
              </span>
            </div>
            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-none text-white sm:text-7xl">
              {currentUser ? "Seu dashboard no mar." : "Registre o mar sem perder a alma."}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-sand-100/70 sm:text-lg">
              {currentUser
                ? "Acompanhe evolução, badges, picos e últimas memórias registradas."
                : "Sessions mistura diário cinematográfico, evolução pessoal e conexão entre surfistas locais. Bonito para lembrar, rápido para usar."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/sessions/new" className="primary-button">
                <Plus className="h-5 w-5" />
                criar session
              </Link>
              <Link href={currentUser ? "/picos" : "/sign-up"} className="secondary-button">
                {currentUser ? "ver picos" : "criar conta"}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {heroMetrics.map((metric) => {
                const MetricIcon = metric.icon;
                return (
                  <div key={metric.label} className="metric-tile">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-sand-300/60">
                        {metric.label}
                      </p>
                      <MetricIcon className="h-4 w-4 text-tide-300" />
                    </div>
                    <p className="mt-3 text-2xl font-black text-white">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-xs text-sand-100/54">{metric.helper}</p>
                  </div>
                );
              })}
            </div>
            {mostSurfedSpot ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-sand-300/60">
                  pico mais surfado
                </p>
                <p className="mt-2 text-lg font-black text-white">
                  {mostSurfedSpot.spot.name} · {mostSurfedSpot.total} sessions
                </p>
              </div>
            ) : null}
          </div>

          <div
            className="surface flex min-h-[520px] items-end overflow-hidden rounded-[18px] bg-cover bg-center p-5"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(6,16,18,0.05), rgba(6,16,18,0.92)), url(https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80)",
            }}
          >
            <div>
              <p className="section-kicker">prévia do feed</p>
              <h2 className="mt-2 text-3xl font-black text-white">
                {featuredSession.title}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-sand-100/70">
                {featuredSession.cinematicText}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-sm font-bold text-white">
                  {featuredSession.beach}
                </span>
                <span className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-sm font-bold text-white">
                  {featuredSession.waveSize}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell space-y-6">
        <SectionTitle
          eyebrow="produto"
          title="Fluxo simples, memória forte"
          description="O app fica bonito porque a informação está no lugar certo: registrar, revisar, publicar e acompanhar evolução."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div key={feature.title} className="surface interactive-card p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.065] text-tide-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-black text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-sand-100/62">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="page-shell space-y-6">
        <SectionTitle
          eyebrow="feed"
          title="Sessions recentes"
          description="Registros públicos com imagem, mood, condição e narrativa em leitura rápida."
          actionLabel="ver feed completo"
          actionHref="/feed"
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {latestSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              authorName={mockUser.name}
              authorAvatarUrl={mockUser.avatarUrl}
            />
          ))}
        </div>
      </section>

      <section className="page-shell grid gap-6 lg:grid-cols-[0.58fr_0.42fr]">
        <div className="space-y-6">
          <SectionTitle
            eyebrow="badges raras"
            title="Conquistas com história"
            description="As badges precisam parecer lembranças, não adesivos."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {rareBadges.slice(0, 4).map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <SectionTitle
            eyebrow="picos"
            title="Comunidades locais"
            description="Uma prévia leve para explorar praias e ritmos da costa."
          />
          <div className="surface rounded-[18px] p-5">
            <div className="space-y-3">
              {localSpots.map((spot) => (
                <Link
                  key={spot.name}
                  href="/picos"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-tide-300/25 hover:bg-white/[0.065]"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-tide-300/10 text-tide-300">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-black text-white">{spot.name}</span>
                      <span className="text-sm text-sand-100/58">{spot.mood}</span>
                    </span>
                  </span>
                  <span className="text-sm font-black text-sand-100/70">
                    {spot.sessions}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="page-shell">
        <div className="soft-divider flex flex-col gap-2 pt-6 text-sm text-sand-100/52 sm:flex-row sm:items-center sm:justify-between">
          <p>Sessions MVP 1</p>
          <p>diário, evolução e cultura local</p>
        </div>
      </footer>
    </div>
  );
}
