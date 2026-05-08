"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AuthUser = {
  name: string;
};

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
        <Link href="/sign-in" className="px-3 py-2 text-sm font-bold text-sand-100/66 transition hover:text-white">
          Entrar
        </Link>
        <Link href="/sign-up" className="secondary-button px-4 py-2.5">
          Registro
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-3 md:flex">
      <span className="max-w-32 truncate text-sm font-bold text-sand-100/66">
        {user.name}
      </span>
      <button type="button" onClick={logout} className="secondary-button px-4 py-2.5">
        sair
      </button>
    </div>
  );
}
