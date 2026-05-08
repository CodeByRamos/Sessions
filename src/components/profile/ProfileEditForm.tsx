"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import type { User, SkillLevel } from "@/types/user";

type ProfileEditFormProps = {
  user: User;
};

const skillLevels: SkillLevel[] = [
  "iniciante",
  "intermediário",
  "avançado",
  "competidor",
];

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    homeBeach: user.homeBeach,
    skillLevel: user.skillLevel ?? "iniciante",
    favoriteBoard: user.favoriteBoard ?? user.mainBoard,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Não foi possível atualizar o perfil.");
      setStatus("idle");
      return;
    }

    setStatus("success");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="surface rounded-[18px] p-5 sm:p-7">
      <div className="grid gap-5 lg:grid-cols-[0.64fr_0.36fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 sm:col-span-2">
            <span className="label">nome</span>
            <input
              className="field"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
            />
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="label">avatar URL</span>
            <input
              className="field"
              value={form.avatarUrl}
              onChange={(event) => updateField("avatarUrl", event.target.value)}
              placeholder="https://..."
            />
          </label>

          <label className="space-y-2">
            <span className="label">praia local</span>
            <input
              className="field"
              value={form.homeBeach}
              onChange={(event) => updateField("homeBeach", event.target.value)}
            />
          </label>

          <label className="space-y-2">
            <span className="label">nível de surf</span>
            <select
              className="field"
              value={form.skillLevel}
              onChange={(event) =>
                updateField("skillLevel", event.target.value as SkillLevel)
              }
            >
              {skillLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="label">prancha favorita</span>
            <input
              className="field"
              value={form.favoriteBoard}
              onChange={(event) => updateField("favoriteBoard", event.target.value)}
            />
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="label">bio</span>
            <textarea
              className="field min-h-36 resize-y leading-6"
              value={form.bio}
              onChange={(event) => updateField("bio", event.target.value)}
            />
          </label>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-5">
            <div
              className="h-32 w-32 rounded-3xl bg-cover bg-center ring-4 ring-tide-300/20"
              style={{ backgroundImage: `url(${form.avatarUrl})` }}
              aria-hidden="true"
            />
            <h2 className="mt-5 text-2xl font-black text-white">{form.name}</h2>
            <p className="mt-2 text-sm leading-6 text-sand-100/62">{form.bio}</p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-coral-400/25 bg-coral-400/10 p-3 text-sm font-bold text-coral-400">
              {error}
            </div>
          ) : null}

          {status === "success" ? (
            <div className="flex items-start gap-3 rounded-2xl border border-tide-300/25 bg-tide-300/10 p-3 text-sm text-tide-300">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              Perfil atualizado.
            </div>
          ) : null}

          <button
            type="submit"
            disabled={status === "loading"}
            className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {status === "loading" ? "salvando..." : "salvar perfil"}
          </button>
        </aside>
      </div>
    </form>
  );
}
