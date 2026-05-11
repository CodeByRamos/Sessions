import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgeCard } from "@/components/profile/BadgeCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { listBadgesForUser } from "@/services/badges";
import { getCurrentUser } from "@/services/users";

type BadgeDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BadgeDetailPage({ params }: BadgeDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const badges = await listBadgesForUser(user?.id);
  const badge = badges.find((item) => item.id === id);

  if (!badge) {
    notFound();
  }

  const isLockedSecret = badge.isSecret && !badge.unlocked;

  return (
    <div className="page-shell space-y-8 fade-in">
      <SectionTitle
        eyebrow="badge"
        title={isLockedSecret ? "Badge secreta" : badge.name}
        description={
          isLockedSecret
            ? "Continue registrando suas sessions. Algumas conquistas só aparecem quando a história acontece."
            : badge.description
        }
        actionLabel="voltar para badges"
        actionHref="/badges"
      />

      <section className="grid gap-6 lg:grid-cols-[0.36fr_1fr]">
        <BadgeCard badge={badge} />

        <div className="surface rounded-[20px] p-5 sm:p-7">
          <p className="section-kicker">detalhes</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="metric-tile">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-sand-100/48">
                raridade
              </p>
              <p className="mt-2 text-2xl font-black text-white">{badge.rarity}</p>
            </div>
            <div className="metric-tile">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-sand-100/48">
                categoria
              </p>
              <p className="mt-2 text-2xl font-black text-white">
                {badge.category ?? "especial"}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sand-100/48">
              critério
            </p>
            <p className="mt-2 text-sm leading-6 text-sand-100/68">
              {isLockedSecret
                ? "Critério escondido por enquanto."
                : badge.unlockRule ?? "Conquista especial concedida pela equipe Sessions."}
            </p>
          </div>

          {badge.earnedAt ? (
            <div className="mt-5 rounded-2xl border border-tide-300/20 bg-tide-300/10 p-4">
              <p className="text-sm font-bold text-tide-100">
                Conquistada em {new Date(badge.earnedAt).toLocaleDateString("pt-BR")}.
              </p>
            </div>
          ) : (
            <Link href="/sessions/new" className="primary-button mt-6 w-fit">
              registrar uma session
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
