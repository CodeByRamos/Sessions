"use client";

import {
  Award,
  BarChart3,
  BookOpen,
  ChevronDown,
  Compass,
  Map,
  Plus,
  Rss,
  Trophy,
  Users,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/layout/MobileNav";
import { AuthActions } from "@/components/auth/AuthActions";

const mainItems = [
  { href: "/", label: "Início", icon: Compass },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/crew", label: "Crew", icon: Users },
  { href: "/circuits", label: "Circuitos", icon: Trophy },
  { href: "/map", label: "Mapa", icon: Map },
];

const sessionItems = [
  { href: "/my-sessions", label: "Minhas Sessions", icon: BookOpen },
  { href: "/sessions/new", label: "Criar Session", icon: Plus },
  { href: "/explore", label: "Explorar", icon: Compass },
];

const evolutionItems = [
  { href: "/badges", label: "Badges", icon: Award },
  { href: "/stats", label: "Estatísticas", icon: BarChart3 },
  { href: "/picos", label: "Picos", icon: Waves },
];

function isItemActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  pathname: string;
}) {
  const active = isItemActive(pathname, href);

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
        active
          ? "bg-white text-ink-950"
          : "text-sand-100/68 hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function NavMenu({
  label,
  icon: Icon,
  items,
  pathname,
}: {
  label: string;
  icon: LucideIcon;
  items: typeof sessionItems;
  pathname: string;
}) {
  const active = items.some((item) => isItemActive(pathname, item.href));

  return (
    <div className="group relative">
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
          active
            ? "bg-white text-ink-950"
            : "text-sand-100/68 hover:bg-white/[0.08] hover:text-white"
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      <div className="pointer-events-none absolute left-0 top-full z-50 min-w-56 translate-y-2 rounded-2xl border border-white/10 bg-ink-950/96 p-2 opacity-0 shadow-2xl shadow-black/35 backdrop-blur-xl transition group-hover:pointer-events-auto group-hover:translate-y-3 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-3 group-focus-within:opacity-100">
        {items.map((item) => {
          const ItemIcon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-sand-100/72 transition hover:bg-white/[0.08] hover:text-white"
            >
              <ItemIcon className="h-4 w-4 text-tide-300" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <>
      <header className="nav-glass fixed left-0 top-0 z-50 w-full border-b">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 md:h-[76px] lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-tide-400 text-ink-950">
              <Waves className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-lg font-black leading-none text-white">
                Sessions
              </span>
              <span className="hidden text-xs font-bold uppercase tracking-[0.2em] text-sand-300/58 sm:block">
                surf journal
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.045] p-1 md:flex">
            {mainItems.map((item) => (
              <NavLink key={item.href} {...item} pathname={pathname} />
            ))}
            <NavMenu label="Sessions" icon={BookOpen} items={sessionItems} pathname={pathname} />
            <NavMenu label="Evolução" icon={Award} items={evolutionItems} pathname={pathname} />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <AuthActions />
            <Link href="/sessions/new" className="primary-button px-4 py-2.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Session</span>
              <span className="sm:hidden">Nova</span>
            </Link>
          </div>
        </nav>
      </header>
      <MobileNav pathname={pathname} />
    </>
  );
}
