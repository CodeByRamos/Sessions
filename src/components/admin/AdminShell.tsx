import Link from "next/link";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  Gauge,
  MessageSquareWarning,
  Settings,
  Shield,
  Trophy,
  Users,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/types/user";

type AdminShellProps = {
  title: string;
  description: string;
  role: UserRole;
  children: ReactNode;
};

const navItems: Array<{
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}> = [
  { href: "/admin", label: "Visão geral", icon: Gauge, roles: ["ORGANIZER", "MODERATOR", "ADMIN"] },
  { href: "/admin/circuits", label: "Circuitos", icon: Trophy, roles: ["ORGANIZER", "MODERATOR", "ADMIN"] },
  { href: "/admin/moderation", label: "Moderação", icon: Shield, roles: ["MODERATOR", "ADMIN"] },
  { href: "/admin/users", label: "Usuários", icon: Users, roles: ["ADMIN"] },
  { href: "/admin/badges", label: "Badges", icon: BadgeCheck, roles: ["ADMIN"] },
  { href: "/admin/sessions", label: "Sessions", icon: Waves, roles: ["MODERATOR", "ADMIN"] },
  { href: "/admin/reports", label: "Denúncias", icon: MessageSquareWarning, roles: ["MODERATOR", "ADMIN"] },
  { href: "/admin/settings", label: "Ajustes", icon: Settings, roles: ["ADMIN"] },
];

export function AdminShell({ title, description, role, children }: AdminShellProps) {
  const availableItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="page-shell space-y-7 fade-in">
      <section className="surface overflow-hidden rounded-[22px] p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="section-kicker">painel Sessions</p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-sand-100/66 sm:text-base">
              {description}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-tide-300/20 bg-tide-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-tide-200">
            <Shield className="h-4 w-4" />
            {role.toLowerCase()}
          </span>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {availableItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-bold text-sand-100/72 transition hover:border-tide-300/25 hover:bg-white/[0.08] hover:text-white"
              >
                <Icon className="h-4 w-4 text-tide-300" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>

      {children}
    </div>
  );
}
