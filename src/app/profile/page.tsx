import Link from "next/link";
import { BadgeCard } from "@/components/profile/BadgeCard";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { SessionCard } from "@/components/sessions/SessionCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { listSessionsByUser } from "@/services/sessions";
import { requireUser } from "@/services/users";

export default async function ProfilePage() {
  const user = await requireUser();
  const sessions = await listSessionsByUser(user.id);
  const unlockedBadges = user.badges.filter((badge) => badge.unlocked);

  return (
    <div className="page-shell space-y-8 fade-in">
      <ProfileHeader user={user} />
      <ProfileStats user={user} />

      <section className="space-y-5">
        <SectionTitle
          eyebrow="badges"
          title="Conquistas do surfista"
          description={`${unlockedBadges.length} badges desbloqueadas. Cada uma marca um comportamento, um pico ou uma virada de evolução.`}
          aside={
            <div className="flex flex-wrap gap-2">
              <Link href="/profile/edit" className="secondary-button px-4 py-2.5">
                editar perfil
              </Link>
              <Link href="/sessions/new" className="primary-button px-4 py-2.5">
                nova session
              </Link>
            </div>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {user.badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <SectionTitle
            eyebrow="minhas sessions"
            title="Últimas entradas"
            description="Histórico recente com condição, mood e narrativa para acompanhar evolução."
          />
          <div className="grid gap-5 md:grid-cols-2">
            {sessions.slice(0, 4).map((session) => (
              <SessionCard key={session.id} session={session} compact />
            ))}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="surface rounded-[18px] p-5">
            <p className="section-kicker">estatísticas</p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <span className="text-sand-100/62">praia base</span>
                <span className="font-black text-white">{user.homeBeach}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <span className="text-sand-100/62">prancha principal</span>
                <span className="font-black text-white">{user.mainBoard}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <span className="text-sand-100/62">média de ondas</span>
                <span className="font-black text-white">11.4</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <span className="text-sand-100/62">mood dominante</span>
                <span className="font-black text-white">evolução</span>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
