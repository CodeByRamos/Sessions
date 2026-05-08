import { Flame, MapPin, Shield, Waves } from "lucide-react";
import type { User } from "@/types/user";
import { XPBar } from "@/components/ui/XPBar";

type ProfileHeaderProps = {
  user: User;
};

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const unlockedBadges = user.badges.filter((badge) => badge.unlocked).length;

  return (
    <section className="surface overflow-hidden rounded-[18px]">
      <div
        className="min-h-[360px] bg-cover bg-center p-5 sm:p-7"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(6, 16, 18, 0.97), rgba(6, 16, 18, 0.78), rgba(6, 16, 18, 0.2)), url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80)",
        }}
      >
        <div className="flex min-h-[320px] flex-col justify-end gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div
              className="h-24 w-24 rounded-3xl bg-cover bg-center ring-4 ring-tide-300/25"
              style={{ backgroundImage: `url(${user.avatarUrl})` }}
              aria-label={`Avatar de ${user.name}`}
            />
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-tide-300">
                @{user.username}
              </p>
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-sand-100/76">
                level {user.level}
              </span>
            </div>
            <h1 className="mt-3 text-4xl font-black leading-none text-white sm:text-6xl">
              {user.name}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-sand-100/78">
              {user.bio}
            </p>
            <div className="mt-6 max-w-xl">
              <XPBar current={user.xp} max={user.nextLevelXp} label="XP" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-80">
            <div className="rounded-2xl border border-white/10 bg-black/28 p-4 backdrop-blur">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-sand-300/70">
                <Shield className="h-4 w-4 text-sun-400" />
                level
              </p>
              <p className="mt-2 text-3xl font-black text-white">{user.level}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/28 p-4 backdrop-blur">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-sand-300/70">
                <Flame className="h-4 w-4 text-coral-400" />
                streak
              </p>
              <p className="mt-2 text-3xl font-black text-white">{user.streak}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/28 p-4 backdrop-blur">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-sand-300/70">
                <MapPin className="h-4 w-4 text-tide-300" />
                praia
              </p>
              <p className="mt-2 text-sm font-black text-white">{user.homeBeach}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/28 p-4 backdrop-blur">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-sand-300/70">
                <Waves className="h-4 w-4 text-sky-200" />
                badges
              </p>
              <p className="mt-2 text-3xl font-black text-white">{unlockedBadges}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
