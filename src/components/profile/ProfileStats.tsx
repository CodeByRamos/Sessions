import { Flame, Shield, Trophy, Waves } from "lucide-react";
import type { User } from "@/types/user";
import { StatsCard } from "@/components/profile/StatsCard";
import { XPBar } from "@/components/ui/XPBar";

type ProfileStatsProps = {
  user: User;
};

export function ProfileStats({ user }: ProfileStatsProps) {
  const unlockedBadges = user.badges.filter((badge) => badge.unlocked).length;

  return (
    <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="surface rounded-[18px] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="section-kicker">progressão</p>
            <h2 className="mt-2 text-2xl font-black text-white">Level {user.level}</h2>
            <p className="mt-2 text-sm leading-6 text-sand-100/62">
              Ritmo de evolução baseado nas sessions, streaks e badges liberadas.
            </p>
          </div>
          <div className="rounded-2xl border border-sun-400/25 bg-sun-400/10 px-3 py-2 text-sm font-black text-sun-400">
            +{user.streak * 40} XP
          </div>
        </div>
        <div className="mt-6">
          <XPBar current={user.xp} max={user.nextLevelXp} label="XP para o próximo nível" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatsCard
          label="sessions"
          value={user.totalSessions}
          helper="histórico total"
          icon={<Waves className="h-5 w-5" />}
        />
        <StatsCard
          label="streak"
          value={`${user.streak} dias`}
          helper="ritmo atual"
          tone="coral"
          icon={<Flame className="h-5 w-5" />}
        />
        <StatsCard
          label="badges"
          value={unlockedBadges}
          helper="desbloqueadas"
          tone="sun"
          icon={<Shield className="h-5 w-5" />}
        />
        <StatsCard
          label="prancha"
          value={user.mainBoard}
          helper="setup principal"
          icon={<Trophy className="h-5 w-5" />}
        />
      </div>
    </section>
  );
}
