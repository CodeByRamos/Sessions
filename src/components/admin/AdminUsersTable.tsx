"use client";

import { useState } from "react";
import type { StoredUser } from "@/lib/db";
import type { UserRole } from "@/types/user";

type AdminUsersTableProps = {
  users: Array<Pick<StoredUser, "id" | "name" | "email" | "role" | "homeBeach" | "createdAt">>;
};

const roles: UserRole[] = ["USER", "ORGANIZER", "MODERATOR", "ADMIN"];

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const filteredUsers = users.filter((user) => {
    const value = `${user.name} ${user.email} ${user.homeBeach}`.toLowerCase();
    return value.includes(query.toLowerCase());
  });

  async function updateRole(userId: string, role: UserRole) {
    setStatus("Salvando papel...");
    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatus(data.error ?? "Não foi possível alterar o papel.");
      return;
    }

    setStatus("Papel atualizado.");
  }

  return (
    <section className="surface rounded-[20px] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="section-kicker">usuários</p>
          <h2 className="mt-1 text-2xl font-black text-white">Contas da comunidade</h2>
        </div>
        <input
          className="field max-w-sm"
          placeholder="Buscar por nome, email ou praia"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {status ? (
        <p className="mt-4 rounded-2xl border border-tide-300/20 bg-tide-300/10 p-3 text-sm font-bold text-tide-100">
          {status}
        </p>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_0.8fr] bg-white/[0.055] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-sand-100/48 md:grid">
          <span>nome</span>
          <span>email</span>
          <span>praia</span>
          <span>papel</span>
        </div>
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="grid gap-3 border-t border-white/10 px-4 py-4 md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr] md:items-center"
          >
            <div className="min-w-0">
              <p className="line-clamp-1 text-sm font-black text-white">{user.name}</p>
              <p className="mt-1 text-xs text-sand-100/45">
                desde {user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "o começo"}
              </p>
            </div>
            <p className="min-w-0 break-words text-sm text-sand-100/62">{user.email}</p>
            <p className="text-sm text-sand-100/62">{user.homeBeach}</p>
            <select
              className="field"
              defaultValue={user.role}
              onChange={(event) => updateRole(user.id, event.target.value as UserRole)}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        ))}
        {filteredUsers.length === 0 ? (
          <p className="border-t border-white/10 p-5 text-sm text-sand-100/62">
            Nenhum usuário encontrado.
          </p>
        ) : null}
      </div>
    </section>
  );
}
