"use client";

import { useState } from "react";
import { BadgeCard } from "@/components/profile/BadgeCard";
import type { Badge, UserBadge } from "@/types/user";

type AdminBadgesPanelProps = {
  badges: Badge[];
  userBadges: UserBadge[];
  users: Array<{ id: string; name: string }>;
};

export function AdminBadgesPanel({ badges, userBadges, users }: AdminBadgesPanelProps) {
  const [selectedBadge, setSelectedBadge] = useState(badges[0]?.id ?? "");
  const [selectedUser, setSelectedUser] = useState(users[0]?.id ?? "");
  const [message, setMessage] = useState("");

  async function toggleBadge(badge: Badge) {
    setMessage("Salvando badge...");
    const response = await fetch(`/api/admin/badges/${badge.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !badge.isActive }),
    });
    const data = (await response.json()) as { error?: string };

    setMessage(response.ok ? "Badge atualizada." : data.error ?? "Não foi possível salvar.");
  }

  async function grantBadge() {
    if (!selectedBadge || !selectedUser) {
      setMessage("Escolha uma badge e um usuário.");
      return;
    }

    setMessage("Concedendo badge...");
    const response = await fetch("/api/admin/badges/grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ badgeId: selectedBadge, userId: selectedUser }),
    });
    const data = (await response.json()) as { error?: string };

    setMessage(response.ok ? "Badge concedida." : data.error ?? "Não foi possível conceder.");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.34fr_1fr]">
      <aside className="surface rounded-[20px] p-5">
        <p className="section-kicker">conceder badge</p>
        <div className="mt-5 space-y-3">
          <label className="space-y-2">
            <span className="label">surfista</span>
            <select
              className="field"
              value={selectedUser}
              onChange={(event) => setSelectedUser(event.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="label">badge</span>
            <select
              className="field"
              value={selectedBadge}
              onChange={(event) => setSelectedBadge(event.target.value)}
            >
              {badges.map((badge) => (
                <option key={badge.id} value={badge.id}>
                  {badge.name}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="primary-button w-full" onClick={grantBadge}>
            conceder badge
          </button>
          {message ? (
            <p className="rounded-2xl border border-tide-300/20 bg-tide-300/10 p-3 text-sm font-bold text-tide-100">
              {message}
            </p>
          ) : null}
        </div>
      </aside>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {badges.map((badge) => (
          <div key={badge.id} className="space-y-3">
            <BadgeCard badge={{ ...badge, unlocked: true }} />
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
              <span className="text-xs font-bold text-sand-100/58">
                {userBadges.filter((item) => item.badgeId === badge.id).length} conquista(s)
              </span>
              <button
                type="button"
                className="secondary-button px-3 py-2 text-xs"
                onClick={() => toggleBadge(badge)}
              >
                {badge.isActive === false ? "ativar" : "desativar"}
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
