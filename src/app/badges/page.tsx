import { Award, Lock, Sparkles } from "lucide-react";
import { BadgeCard } from "@/components/profile/BadgeCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { listBadgesForUser } from "@/services/badges";
import { getCurrentUser } from "@/services/users";

export default async function BadgesPage() {
  const user = await getCurrentUser();
  const badges = await listBadgesForUser(user?.id);
  const unlocked = badges.filter((badge) => badge.unlocked);
  const locked = badges.filter((badge) => !badge.unlocked);
  const featured = badges.filter((badge) =>
    ["zero-hora-crew", "uaradei", "brazilian-storm"].includes(badge.id),
  );
  const metrics = [
    { label: "desbloqueadas", value: unlocked.length, icon: Award },
    { label: "bloqueadas", value: locked.length, icon: Lock },
    { label: "raras/lendárias", value: featured.length, icon: Sparkles },
  ];

  return (
    <div className="page-shell space-y-8 fade-in">
      <SectionTitle
        eyebrow="badges"
        title="Conquistas com alma"
        description="Badges desbloqueiam comportamento, constância, amizade, coragem e evolução pessoal no mar."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => {
          const MetricIcon = metric.icon;

          return (
            <div key={metric.label} className="surface rounded-[18px] p-5">
              <MetricIcon className="h-5 w-5 text-tide-300" />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-sand-300/60">
                {metric.label}
              </p>
              <p className="mt-2 text-4xl font-black text-white">{metric.value}</p>
            </div>
          );
        })}
      </section>

      <section className="space-y-5">
        <SectionTitle
          eyebrow="destaques"
          title="Badges simbólicas"
          description="ZeroHoraCrew, UARADEI e Brazilian Storm são marcos de identidade dentro do Sessions."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} href={`/badges/${badge.id}`} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionTitle
          eyebrow="coleção"
          title="Todas as conquistas"
          description="Veja o que já foi liberado e o que ainda está chamando do horizonte."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} href={`/badges/${badge.id}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
