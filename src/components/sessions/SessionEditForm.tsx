"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { ImagePlus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Mood, Session } from "@/types/session";
import { moodOptions } from "@/lib/moods";

type SessionEditFormProps = {
  session: Session;
};

export function SessionEditForm({ session }: SessionEditFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: session.title,
    date: session.date,
    waveSize: session.waveSize,
    wind: session.wind,
    board: session.board,
    mood: session.mood,
    difficulty: session.difficulty ?? "moderada",
    rating: session.rating,
    wavesCount: session.wavesCount,
    maneuvers: (session.maneuvers ?? []).join(", "),
    description: session.description,
    mediaUrl: session.photoUrl,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function uploadSessionImage(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const response = await fetch("/api/media/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dataUrl: reader.result,
              filename: file.name,
              folder: "sessions",
            }),
          });
          const data = (await response.json()) as { url?: string; error?: string };

          if (!response.ok || !data.url) {
            reject(new Error(data.error ?? "Não foi possível enviar a imagem."));
            return;
          }

          resolve(data.url);
        } catch {
          reject(new Error("Não foi possível enviar a imagem."));
        }
      };

      reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
      reader.readAsDataURL(file);
    });
  }

  async function handleMediaFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Envie apenas uma imagem válida.");
      event.target.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("A imagem precisa ter no máximo 8MB.");
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    update("mediaUrl", previewUrl);
    setUploadingMedia(true);

    try {
      const uploadedUrl = await uploadSessionImage(file);
      update("mediaUrl", uploadedUrl);
    } catch (uploadError) {
      update("mediaUrl", session.photoUrl);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Não foi possível enviar a imagem.",
      );
    } finally {
      setUploadingMedia(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Não foi possível salvar.");
      setLoading(false);
      return;
    }

    router.push(`/session/${session.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="surface rounded-[18px] p-5 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className="label">nome da session</span>
          <input
            className="field"
            maxLength={60}
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="label">data</span>
          <input
            type="date"
            className="field"
            value={form.date}
            onChange={(event) => update("date", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="label">mood</span>
          <select
            className="field"
            value={form.mood}
            onChange={(event) => update("mood", event.target.value as Mood)}
          >
            {moodOptions.map((mood) => (
              <option key={mood} value={mood}>
                {mood}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="label">dificuldade</span>
          <select
            className="field"
            value={form.difficulty}
            onChange={(event) =>
              update(
                "difficulty",
                event.target.value as NonNullable<Session["difficulty"]>,
              )
            }
          >
            {["leve", "moderada", "difícil", "casca grossa"].map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="label">tamanho do mar</span>
          <input
            className="field"
            value={form.waveSize}
            onChange={(event) => update("waveSize", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="label">vento</span>
          <input
            className="field"
            value={form.wind}
            onChange={(event) => update("wind", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="label">prancha</span>
          <input
            className="field"
            value={form.board}
            onChange={(event) => update("board", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="label">ondas</span>
          <input
            type="number"
            min={0}
            className="field"
            value={form.wavesCount}
            onChange={(event) => update("wavesCount", Number(event.target.value))}
          />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="label">manobras</span>
          <input
            className="field"
            value={form.maneuvers}
            onChange={(event) => update("maneuvers", event.target.value)}
          />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="label">relato</span>
          <textarea
            className="field min-h-44 resize-y leading-6"
            maxLength={2000}
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
          />
        </label>
        <div className="space-y-3 sm:col-span-2">
          <span className="label">imagem</span>
          <div
            className="min-h-56 rounded-[18px] border border-white/10 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(180deg, transparent, rgba(6,16,18,0.35)), url(${form.mediaUrl})`,
            }}
          />
          <label className="secondary-button cursor-pointer px-4 py-3">
            <ImagePlus className="h-4 w-4" />
            trocar imagem
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleMediaFile}
            />
          </label>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-coral-400/25 bg-coral-400/10 p-3 text-sm font-bold text-coral-400">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading || uploadingMedia}
        className="primary-button mt-6 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {uploadingMedia ? "enviando imagem..." : loading ? "salvando..." : "salvar alterações"}
      </button>
    </form>
  );
}
