import { Clock, SlidersHorizontal, TrendingUp, Waves } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SessionCard } from "@/components/sessions/SessionCard";
import { listPublicSessions } from "@/services/sessions";
import { getFeaturedUser } from "@/services/users";

const feedMoods = ["Tudo", "mágico", "limpo", "clássico", "evolução", "pesado"];

export default async function FeedPage() {
  const [publicSessions, mockUser] = await Promise.all([
    listPublicSessions(),
    getFeaturedUser(),
  ]);

  return (
    <div className="page-shell space-y-6 fade-in">
      <header className="space-y-5">
        <SectionTitle
          eyebrow="feed público"
          title="Memórias recentes da costa"
          description="Sessions abertas de surfistas locais, organizadas para ler rápido sem perder a atmosfera."
          aside={
            <button className="secondary-button w-fit px-4 py-2.5">
              <SlidersHorizontal className="h-4 w-4" />
              filtros
            </button>
          }
        />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {feedMoods.map((mood, index) => (
            <button
              key={mood}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${
                index === 0
                  ? "border-tide-300/35 bg-tide-300/12 text-tide-300"
                  : "border-white/10 bg-white/[0.045] text-sand-100/62 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </header>

      {publicSessions.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="grid gap-5 md:grid-cols-2">
            {publicSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                authorName={mockUser.name}
                authorAvatarUrl={mockUser.avatarUrl}
              />
            ))}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="surface rounded-[18px] p-5">
              <p className="section-kicker">lineup agora</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="metric-tile">
                  <p className="text-sand-300/58">públicas</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {publicSessions.length}
                  </p>
                </div>
                <div className="metric-tile">
                  <p className="text-sand-300/58">mood top</p>
                  <p className="mt-1 text-2xl font-black text-white">limpo</p>
                </div>
              </div>
            </div>

            <div className="surface rounded-[18px] p-5">
              <p className="section-kicker">sinais</p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                  <span className="flex items-center gap-2 text-sand-100/68">
                    <Clock className="h-4 w-4 text-tide-300" />
                    melhor janela
                  </span>
                  <span className="font-black text-white">05:40</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                  <span className="flex items-center gap-2 text-sand-100/68">
                    <TrendingUp className="h-4 w-4 text-sun-400" />
                    pico quente
                  </span>
                  <span className="font-black text-white">Matadeiro</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <EmptyState
          title="Nada no lineup ainda"
          description="Quando sessions públicas forem criadas, elas aparecem aqui."
          icon={<Waves className="h-7 w-7" />}
          actionLabel="criar session"
          actionHref="/sessions/new"
        />
      )}
    </div>
  );
}
