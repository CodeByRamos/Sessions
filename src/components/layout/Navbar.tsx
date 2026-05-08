"use client";

import {
  Award,
  Compass,
  Plus,
  UserRound,
  Waves,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/layout/MobileNav";
import { AuthActions } from "@/components/auth/AuthActions";

const navItems = [
  { href: "/", label: "Dashboard", icon: Compass },
  { href: "/sessions/new", label: "Criar Session", icon: Plus },
  { href: "/picos", label: "Picos", icon: Waves },
  { href: "/badges", label: "Badges", icon: Award },
  { href: "/profile", label: "Perfil", icon: UserRound },
  { href: "/about", label: "Sobre", icon: Compass },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <>
    <header className="nav-glass fixed left-0 top-0 z-50 w-full border-b">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:h-[76px] lg:px-8">
        <Link href="/" className="flex items-center gap-3">
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

        <div className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.045] p-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  isActive
                    ? "bg-white text-ink-950"
                    : "text-sand-100/68 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
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
