"use client";

import {
  Award,
  BookOpen,
  Compass,
  Home,
  Map,
  Menu,
  Plus,
  Rss,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type MobileNavProps = {
  pathname: string;
};

const quickItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/sessions/new", label: "Nova", icon: Plus, featured: true },
  { href: "/crew", label: "Crew", icon: Users },
];

const moreItems = [
  { href: "/my-sessions", label: "Minhas Sessions", icon: BookOpen },
  { href: "/circuits", label: "Circuitos", icon: Trophy },
  { href: "/map", label: "Mapa", icon: Map },
  { href: "/badges", label: "Badges", icon: Award },
  { href: "/profile", label: "Perfil", icon: UserRound },
  { href: "/explore", label: "Explorar", icon: Compass },
];

export function MobileNav({ pathname }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? (
        <div className="fixed inset-x-3 bottom-24 z-50 rounded-[22px] border border-white/10 bg-ink-950/96 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {moreItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-sm font-black text-sand-100/74 transition active:scale-[0.98]"
                >
                  <Icon className="h-4 w-4 text-tide-300" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-white/10 bg-ink-950/92 px-2 pb-3 pt-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {quickItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-black transition ${
                  item.featured
                    ? "bg-tide-400 text-ink-950"
                    : isActive
                      ? "bg-white text-ink-950"
                      : "text-sand-100/62 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-black transition ${
              open
                ? "bg-white text-ink-950"
                : "text-sand-100/62 hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            <Menu className="h-5 w-5" />
            Mais
          </button>
        </div>
      </nav>
    </>
  );
}
