import { notFound } from "next/navigation";
import Link from "next/link";
import { Filter, Waves } from "lucide-react";
import { SessionCard } from "@/components/sessions/SessionCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { findSpotById, getSpotStats } from "@/services/spots";
import { listSessionsBySpot } from "@/services/sessions";
import { getFeaturedUser } from "@/services/users";

type SpotDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SpotDetailPage({ params }: SpotDetailPageProps) {
  const { id } = await params;
  const [spot, sessions, stats, author] = await Promise.all([
    findSpotById(id),
    listSessionsBySpot(id),
    getSpotStats(id),
    getFeaturedUser(),
  ]);

  if (!spot) {
    notFound();
  }

  return (
    <div className="fade-in">
      <section
        className="relative flex min-h-[460px] items-end border-b border-white/10 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(6,16,18,0.98), rgba(6,16,18,0.78), rgba(6,16,18,0.26)), url(${spot.imageUrl})`,
        }}
      >
        <div className="page-shell pb-8">
          <p className="section-kicker">{spot.city}</p>
          <h1 className="mt-4 text-5xl font-black leading-none text-white sm:text-7xl">
            {spot.name}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-sand-100/72">
            {spot.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/sessions/new?spot=${spot.id}`} className="primary-button">
              <Waves className="h-4 w-4" />
              registrar session
            </Link>
            <span className="secondary-button pointer-events-none">
              {spot.bestConditions}
            </span>
          </div>
        </div>
      </section>

      <div className="page-shell grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-5">
          <SectionTitle
            eyebrow="sessions do pico"
            title="Histórico registrado"
            description="Encontre sessions por condição, prancha ou sentimento e entenda melhor o ritmo desse pico."
          />
          <div className="surface rounded-[18px] p-4">
            <div className="flex flex-wrap gap-2">
              {["data", "tamanho do mar", "prancha usada", "mood"].map((filter) => (
                <button
                  key={filter}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-sand-100/62"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {sessions.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  authorName={author.name}
                  authorAvatarUrl={author.avatarUrl}
                />
              ))}
            </div>
          ) : (
            <div className="surface rounded-[18px] p-8 text-center">
              <h2 className="text-2xl font-black text-white">Nenhuma session aqui ainda</h2>
              <p className="mt-2 text-sm text-sand-100/62">
                Seja o primeiro a transformar esse pico em memória.
              </p>
              <Link href={`/sessions/new?spot=${spot.id}`} className="primary-button mt-6">
                registrar session
              </Link>
            </div>
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="surface rounded-[18px] p-5">
            <p className="section-kicker">estatísticas</p>
            <div className="mt-5 space-y-3">
              {[
                ["total de sessions", stats.total],
                ["média de ondas", stats.averageWaves],
                ["último dia surfado", stats.lastSurfedAt ?? "sem registro"],
                ["mood comum", stats.mostCommonMood],
                ["prancha mais usada", stats.mostUsedBoard],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm"
                >
                  <span className="text-sand-100/62">{label}</span>
                  <span className="text-right font-black text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
