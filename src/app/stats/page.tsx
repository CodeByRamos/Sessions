import { Activity, BarChart3, Flame, Gauge, MapPin, Timer, Waves } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SessionCard } from "@/components/sessions/SessionCard";
import { getUserStats } from "@/services/stats";
import { requireUser } from "@/services/users";

export default async function StatsPage() {
  const user = await requireUser();
  const stats = await getUserStats(user.id);
  const metrics = [
    { label: "sessions", value: stats.totalSessions, icon: Activity },
    { label: "ondas", value: stats.totalWaves, icon: Waves },
    { label: "streak", value: `${stats.currentStreak} dias`, icon: Flame },
    { label: "melhor janela", value: stats.bestTime, icon: Timer },
  ];

  return (
    <div className="page-shell space-y-8 fade-in">
      <SectionTitle
        eyebrow="estatísticas"
        title="Sua evolução em leitura clara"
        description="Dados simples para entender constância, picos, prancha, moods e dificuldade sem transformar o Sessions em planilha."
      />

      <section className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div key={metric.label} className="surface rounded-[18px] p-5">
              <Icon className="h-5 w-5 text-tide-300" />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-sand-300/60">
                {metric.label}
              </p>
              <p className="mt-2 text-3xl font-black text-white">{metric.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {[
          {
            label: "praia mais surfada",
            value: stats.mostSurfedSpot?.label ?? "sem sessions",
            helper: `${stats.mostSurfedSpot?.total ?? 0} registros`,
            icon: MapPin,
          },
          {
            label: "prancha mais usada",
            value: stats.mostUsedBoard?.label ?? "sem prancha",
            helper: `${stats.mostUsedBoard?.total ?? 0} usos`,
            icon: Gauge,
          },
          {
            label: "mood frequente",
            value: stats.mostCommonMood?.label ?? "sem mood",
            helper: `${stats.mostCommonMood?.total ?? 0} sessions`,
            icon: BarChart3,
          },
          {
            label: "dificuldade dominante",
            value: stats.topDifficulty?.label ?? "sem dificuldade",
            helper: `${stats.topDifficulty?.total ?? 0} sessions`,
            icon: Waves,
          },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <div key={metric.label} className="surface rounded-[18px] p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-tide-300">
                    {metric.label}
                  </p>
                  <h2 className="mt-2 line-clamp-2 text-2xl font-black text-white">
                    {metric.value}
                  </h2>
                  <p className="mt-1 text-sm text-sand-100/58">{metric.helper}</p>
                </div>
                <Icon className="h-7 w-7 shrink-0 text-sand-300/45" />
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.42fr_1fr]">
        <div className="surface rounded-[18px] p-5">
          <p className="section-kicker">sessions por mês</p>
          <div className="mt-5 space-y-3">
            {stats.sessionsByMonth.length ? (
              stats.sessionsByMonth.map((month) => (
                <div key={month.label} className="flex items-center gap-3">
                  <span className="w-16 text-sm font-bold text-sand-100/62">
                    {month.label}
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-tide-300"
                      style={{
                        width: `${Math.max(10, month.total * 18)}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-black text-white">
                    {month.total}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-sand-100/62">
                Registre sessions para enxergar sua evolução mês a mês.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <SectionTitle
            eyebrow="histórico recente"
            title="Últimas leituras do mar"
            description="O contexto das estatísticas sempre volta para a memória."
          />
          <div className="grid gap-5 md:grid-cols-2">
            {stats.latestSessions.map((session) => (
              <SessionCard key={session.id} session={session} compact />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
