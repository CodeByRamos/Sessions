import {
  Anchor,
  ArrowDown,
  BookOpen,
  Camera,
  CalendarDays,
  Compass,
  Flame,
  Film,
  ListChecks,
  Lock,
  MapPin,
  Moon,
  RefreshCcw,
  Shell,
  Sparkles,
  Sun,
  TrendingUp,
  Trophy,
  Users,
  Waves,
  Wind,
} from "lucide-react";
import Link from "next/link";
import type { Badge } from "@/types/user";

type BadgeCardProps = {
  badge: Badge;
  href?: string;
};

const badgeIcons = {
  anchor: Anchor,
  sparkles: Sparkles,
  "arrow-down": ArrowDown,
  waves: Waves,
  "book-open": BookOpen,
  camera: Camera,
  calendar: CalendarDays,
  "calendar-days": CalendarDays,
  "calendar-heart": CalendarDays,
  compass: Compass,
  film: Film,
  "list-checks": ListChecks,
  "map-pin": MapPin,
  map: MapPin,
  moon: Moon,
  "refresh-ccw": RefreshCcw,
  shell: Shell,
  storm: Waves,
  sun: Sun,
  trophy: Trophy,
  "trending-up": TrendingUp,
  users: Users,
  flame: Flame,
  wind: Wind,
};

const rarityStyles = {
  base: {
    card: "border-tide-300/18 text-tide-300",
    label: "comum",
  },
  common: {
    card: "border-tide-300/18 text-tide-300",
    label: "comum",
  },
  uncommon: {
    card: "border-emerald-300/25 text-emerald-300",
    label: "incomum",
  },
  rare: {
    card: "border-sun-400/25 text-sun-400",
    label: "rara",
  },
  epic: {
    card: "border-coral-400/25 text-coral-400",
    label: "épica",
  },
  legendary: {
    card: "border-tide-300/35 text-tide-300",
    label: "lendária",
  },
  secret: {
    card: "border-white/15 text-sand-100",
    label: "secreta",
  },
};

function ZeroHoraCrewIcon() {
  const penguins = [18, 32, 46];

  return (
    <svg viewBox="0 0 64 48" className="h-9 w-12" aria-hidden="true">
      <defs>
        <linearGradient id="zeroHoraSky" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#10282a" />
          <stop offset="55%" stopColor="#173337" />
          <stop offset="100%" stopColor="#ff947f" />
        </linearGradient>
      </defs>
      <rect x="2" y="3" width="60" height="42" rx="14" fill="url(#zeroHoraSky)" opacity="0.45" />
      <path d="M7 34 C18 27 29 29 39 34 C47 38 54 36 59 31" fill="none" stroke="#47e0c6" strokeWidth="1.5" opacity="0.75" />
      {penguins.map((x, index) => (
        <g key={x} transform={`translate(${x} ${index === 1 ? 9 : 12})`}>
          <ellipse cx="0" cy="16" rx="7" ry="12" fill="#061012" stroke="#47e0c6" strokeWidth="0.8" />
          <ellipse cx="0" cy="18" rx="4.6" ry="8" fill="#f2ead8" opacity="0.92" />
          <circle cx="-2.2" cy="10.5" r="0.9" fill="#f2ead8" />
          <circle cx="2.2" cy="10.5" r="0.9" fill="#f2ead8" />
          <path d="M-1.5 13 L0 15 L1.5 13" fill="#ff947f" />
          <path d="M-3.8 29 L-7 32" stroke="#ff947f" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M3.8 29 L7 32" stroke="#ff947f" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

function UaradeiIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-11 w-11" aria-hidden="true">
      <defs>
        <radialGradient id="uaradeiAura" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#f6c85f" />
          <stop offset="45%" stopColor="#47e0c6" />
          <stop offset="100%" stopColor="#10282a" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="29" r="19" fill="url(#uaradeiAura)" opacity="0.82" />
      <circle cx="32" cy="29" r="25" fill="none" stroke="#47e0c6" strokeWidth="1.4" opacity="0.35" />
      <path d="M13 40 C22 33 31 34 39 40 C45 44 51 42 56 36" fill="none" stroke="#f2ead8" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M25 46 L43 26" stroke="#061012" strokeWidth="4" strokeLinecap="round" />
      <path d="M27 45 L45 25" stroke="#ff947f" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M21 19 C25 13 38 12 43 19" fill="none" stroke="#f6c85f" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 52 C28 56 38 56 46 52" fill="none" stroke="#47e0c6" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

function BrazilianStormIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-11 w-11" aria-hidden="true">
      <defs>
        <linearGradient id="stormGold" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f6c85f" />
          <stop offset="100%" stopColor="#47e0c6" />
        </linearGradient>
      </defs>
      <path d="M7 32 L32 12 L57 32 L32 52 Z" fill="#1fb86a" stroke="#47e0c6" strokeWidth="1.2" />
      <path d="M18 32 L32 22 L46 32 L32 42 Z" fill="#f6c85f" opacity="0.95" />
      <circle cx="32" cy="32" r="8" fill="#173b7a" />
      <path d="M14 35 C24 25 40 23 50 32 C42 29 35 31 29 38 C38 36 45 38 51 45 C39 43 28 48 19 39 C26 42 33 41 39 34 C30 36 22 35 14 35 Z" fill="url(#stormGold)" stroke="#061012" strokeWidth="1" opacity="0.95" />
      <path d="M22 18 C31 10 47 14 53 25" fill="none" stroke="#f2ead8" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
      <path d="M12 46 C23 58 43 58 54 44" fill="none" stroke="#47e0c6" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function BadgeCard({ badge, href }: BadgeCardProps) {
  const Icon = badgeIcons[badge.icon as keyof typeof badgeIcons] ?? Sparkles;
  const isZeroHoraCrew = badge.id === "zero-hora-crew";
  const isUaradei = badge.id === "uaradei";
  const isBrazilianStorm = badge.id === "brazilian-storm";
  const rarity = rarityStyles[badge.rarity] ?? rarityStyles.common;
  const lockedSecret = badge.isSecret && !badge.unlocked;
  const content = (
    <div
      className={`interactive-card h-full rounded-[18px] border p-5 ${
        badge.unlocked
          ? isZeroHoraCrew
            ? "border-sun-400/35 bg-[linear-gradient(145deg,rgba(16,40,42,0.72),rgba(255,148,127,0.10))] text-sun-400"
            : isUaradei
              ? "border-tide-300/35 bg-[radial-gradient(circle_at_30%_10%,rgba(246,200,95,0.16),transparent_32%),rgba(255,255,255,0.045)] text-tide-300"
              : isBrazilianStorm
                ? "border-tide-300/45 bg-[linear-gradient(145deg,rgba(31,184,106,0.18),rgba(246,200,95,0.12),rgba(16,40,42,0.76))] text-tide-300"
                : `${rarity.card} bg-white/[0.045]`
          : "border-white/10 text-sand-300/38 opacity-65"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            isZeroHoraCrew || isUaradei || isBrazilianStorm
              ? "bg-ink-950/70 ring-1 ring-sun-400/25"
              : "bg-white/[0.065]"
          }`}
        >
          {badge.unlocked ? (
            isZeroHoraCrew ? (
              <ZeroHoraCrewIcon />
            ) : isUaradei ? (
              <UaradeiIcon />
            ) : isBrazilianStorm ? (
              <BrazilianStormIcon />
            ) : (
              <Icon className="h-6 w-6" />
            )
          ) : (
            <Lock className="h-5 w-5" />
          )}
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sand-300/62">
          {rarity.label}
        </span>
      </div>
      <h3 className="mt-5 text-lg font-black text-white">
        {lockedSecret ? "Badge secreta" : badge.name}
      </h3>
      <p className="mt-2 text-sm leading-6 text-sand-100/62">
        {lockedSecret
          ? "Uma conquista escondida. Continue registrando suas sessions."
          : badge.description}
      </p>
      {badge.category && !lockedSecret ? (
        <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-sand-300/48">
          {badge.category}
        </p>
      ) : null}
      {badge.unlockRule ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-ink-950/36 px-3 py-2 text-xs leading-5 text-sand-100/58">
          <span className="font-black text-sand-100/78">Critério:</span>{" "}
          {lockedSecret ? "secreto por enquanto" : badge.unlockRule}
        </div>
      ) : null}
      {isZeroHoraCrew && badge.unlocked ? (
        <div className="mt-4 rounded-2xl border border-tide-300/15 bg-ink-950/45 px-3 py-2 text-xs font-bold text-tide-300/86">
          três amigos, uma madrugada, uma memória
        </div>
      ) : null}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}
