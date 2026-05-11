"use client";

import { LogOut, Shield, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserRole } from "@/types/user";

type AuthUser = {
  name: string;
  role: UserRole;
  avatarUrl: string;
};

function canOpenAdmin(role?: UserRole) {
  return role === "ADMIN" || role === "MODERATOR" || role === "ORGANIZER";
}

export function AuthActions() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/me")
      .then((response) => (response.ok ? response.json() : { user: null }))
      .then((data: { user: AuthUser | null }) => {
        if (!cancelled) {
          setUser(data.user);
        }
      })
      .catch(() => setUser(null));

    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/sign-in");
    router.refresh();
  }

  if (!user) {
    return (
      <div className="hidden items-center gap-2 md:flex">
        <Link
          href="/sign-in"
          className="px-3 py-2 text-sm font-bold text-sand-100/66 transition hover:text-white"
        >
          Entrar
        </Link>
        <Link href="/sign-up" className="secondary-button px-4 py-2.5">
          Criar conta
        </Link>
      </div>
    );
  }

  return (
    <div className="group relative hidden md:block">
      <button
        type="button"
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-2 py-2 transition hover:bg-white/[0.08]"
      >
        <span
          className="h-8 w-8 rounded-full bg-cover bg-center ring-2 ring-white/10"
          style={{ backgroundImage: `url(${user.avatarUrl})` }}
          aria-hidden="true"
        />
        <span className="hidden max-w-24 truncate text-sm font-bold text-sand-100/72 lg:block">
          {user.name}
        </span>
      </button>

      <div className="pointer-events-none absolute right-0 top-full z-50 min-w-56 translate-y-2 rounded-2xl border border-white/10 bg-ink-950/96 p-2 opacity-0 shadow-2xl shadow-black/35 backdrop-blur-xl transition group-hover:pointer-events-auto group-hover:translate-y-3 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-3 group-focus-within:opacity-100">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-sand-100/72 transition hover:bg-white/[0.08] hover:text-white"
        >
          <UserRound className="h-4 w-4 text-tide-300" />
          Perfil
        </Link>
        <Link
          href="/profile/edit"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-sand-100/72 transition hover:bg-white/[0.08] hover:text-white"
        >
          <UserRound className="h-4 w-4 text-tide-300" />
          Editar perfil
        </Link>
        {canOpenAdmin(user.role) ? (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-sand-100/72 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Shield className="h-4 w-4 text-sun-400" />
            Painel
          </Link>
        ) : null}
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-sand-100/72 transition hover:bg-white/[0.08] hover:text-white"
        >
          <LogOut className="h-4 w-4 text-coral-400" />
          Sair
        </button>
      </div>
    </div>
  );
}
