"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { CheckCircle2, ImagePlus, RotateCcw, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AvatarOption } from "@/types/circuit";
import type { SkillLevel, User } from "@/types/user";

type ProfileEditFormProps = {
  user: User;
  avatarOptions: AvatarOption[];
};

const skillLevels: SkillLevel[] = [
  "iniciante",
  "intermediário",
  "avançado",
  "competidor",
];

const maxAvatarBytes = 3 * 1024 * 1024;

export function ProfileEditForm({ user, avatarOptions }: ProfileEditFormProps) {
  const router = useRouter();
  const fallbackAvatar = avatarOptions[0]?.imageUrl ?? user.avatarUrl;
  const [form, setForm] = useState({
    name: user.name,
    avatarUrl: user.avatarUrl || fallbackAvatar,
    bio: user.bio,
    homeBeach: user.homeBeach,
    skillLevel: user.skillLevel ?? "iniciante",
    favoriteBoard: user.favoriteBoard ?? user.mainBoard,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(form.avatarUrl);
  const [error, setError] = useState("");

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadImage(file: File) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        typeof reader.result === "string"
          ? resolve(reader.result)
          : reject(new Error("Imagem inválida."));
      reader.onerror = () => reject(new Error("Imagem inválida."));
      reader.readAsDataURL(file);
    });

    const response = await fetch("/api/media/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: dataUrl, folder: "avatars" }),
    });
    const data = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !data.url) {
      throw new Error(data.error ?? "Não foi possível enviar a imagem. Tente novamente.");
    }

    return data.url;
  }

  async function handleAvatarFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Envie apenas uma imagem válida para o avatar.");
      event.target.value = "";
      return;
    }

    if (file.size > maxAvatarBytes) {
      setError("O avatar precisa ter no máximo 2MB.");
      event.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setUploadingAvatar(true);

    try {
      const uploadedUrl = await uploadImage(file);
      updateField("avatarUrl", uploadedUrl);
      setAvatarPreview(uploadedUrl);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Não foi possível enviar a imagem. Tente novamente.",
      );
      setAvatarPreview(form.avatarUrl || fallbackAvatar);
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
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
      <div className="grid gap-6 lg:grid-cols-[0.62fr_0.38fr]">
        <div className="space-y-6">
          <section className="space-y-4">
            <div>
              <p className="section-kicker">identidade</p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Dados do surfista
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="label">nome</span>
                <input
                  className="field"
                  maxLength={80}
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="label">praia local</span>
                <input
                  className="field"
                  maxLength={60}
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
                  maxLength={80}
                  value={form.favoriteBoard}
                  onChange={(event) =>
                    updateField("favoriteBoard", event.target.value)
                  }
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="label">bio</span>
                <textarea
                  className="field min-h-36 resize-y leading-6"
                  maxLength={280}
                  value={form.bio}
                  onChange={(event) => updateField("bio", event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <p className="section-kicker">avatar</p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Escolha uma presença visual
              </h2>
              <p className="mt-2 text-sm leading-6 text-sand-100/62">
                Use um avatar da comunidade ou envie uma imagem própria com até 2MB.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {avatarOptions.map((avatar) => {
                const selected = form.avatarUrl === avatar.imageUrl;

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => {
                      updateField("avatarUrl", avatar.imageUrl);
                      setAvatarPreview(avatar.imageUrl);
                    }}
                    className={`rounded-2xl border p-3 text-left transition ${
                      selected
                        ? "border-tide-300/45 bg-tide-300/10"
                        : "border-white/10 bg-white/[0.035] hover:border-white/20"
                    }`}
                  >
                    <div
                      className="h-20 rounded-xl bg-cover bg-center"
                      style={{ backgroundImage: `url(${avatar.imageUrl})` }}
                    />
                    <p className="mt-3 line-clamp-1 text-sm font-black text-white">
                      {avatar.name}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-sand-100/58">
                      {avatar.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <label className="secondary-button cursor-pointer px-4 py-3">
                <ImagePlus className="h-4 w-4" />
                enviar foto
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarFile}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  updateField("avatarUrl", fallbackAvatar);
                  setAvatarPreview(fallbackAvatar);
                }}
                className="secondary-button px-4 py-3"
              >
                <RotateCcw className="h-4 w-4" />
                voltar padrão
              </button>
              <button
                type="button"
                onClick={() => {
                  updateField("avatarUrl", "");
                  setAvatarPreview(fallbackAvatar);
                }}
                className="secondary-button px-4 py-3"
              >
                <X className="h-4 w-4" />
                remover
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="sticky top-24 rounded-[18px] border border-white/10 bg-white/[0.035] p-5">
            <div
              className="h-36 w-36 rounded-3xl bg-cover bg-center ring-4 ring-tide-300/20"
              style={{ backgroundImage: `url(${avatarPreview || fallbackAvatar})` }}
              aria-hidden="true"
            />
            <h2 className="mt-5 line-clamp-2 text-2xl font-black text-white">
              {form.name || "Surfista Sessions"}
            </h2>
            <p className="mt-2 text-sm font-bold text-tide-300">
              {form.homeBeach || "pico ainda secreto"}
            </p>
            <p className="mt-3 line-clamp-5 text-sm leading-6 text-sand-100/62">
              {form.bio || "Uma bio curta ajuda outros surfistas a entenderem sua vibe."}
            </p>
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
            disabled={status === "loading" || uploadingAvatar}
            className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {uploadingAvatar
              ? "enviando imagem..."
              : status === "loading"
                ? "salvando..."
                : "salvar perfil"}
          </button>
        </aside>
      </div>
    </form>
  );
}
