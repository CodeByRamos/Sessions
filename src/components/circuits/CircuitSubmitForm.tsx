"use client";

import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, ImagePlus, Send, ShieldCheck } from "lucide-react";
import type { Competition } from "@/types/circuit";
import type { Spot } from "@/types/spot";

type CircuitSubmitFormProps = {
  spots: Spot[];
  onCreated: (competition: Competition) => void;
};

const prestigeOptions: Competition["prestige"][] = [
  "local",
  "regional",
  "national",
  "international",
];

const emptyForm = {
  name: "",
  startsAt: "",
  spotId: "",
  location: "",
  city: "Guarujá",
  state: "SP",
  country: "Brasil",
  description: "",
  categoriesText: "",
  officialUrl: "",
  organizerName: "",
  organizerProfileUrl: "",
  organizerContact: "",
  verificationFileUrl: "",
  reviewMessage: "",
  imageUrl: "",
  rules: "",
  prize: "",
  recommendedLevel: "",
  estimatedParticipants: "",
  prestige: "local" as Competition["prestige"],
};

export function CircuitSubmitForm({ spots, onCreated }: CircuitSubmitFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");
  const [uploadingField, setUploadingField] = useState<"imageUrl" | "verificationFileUrl" | null>(null);

  const minStartsAt = useMemo(() => new Date().toISOString().slice(0, 16), []);

  function updateField<Key extends keyof typeof form>(
    key: Key,
    value: (typeof form)[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function uploadCircuitImage(file: File, folder: "circuits" | "proofs") {
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
              folder,
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

  async function handleUpload(
    file: File | undefined,
    field: "imageUrl" | "verificationFileUrl",
    folder: "circuits" | "proofs",
  ) {
    setError("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Envie apenas uma imagem válida.");
      return;
    }

    const maxBytes = field === "verificationFileUrl" ? 10 * 1024 * 1024 : 8 * 1024 * 1024;

    if (file.size > maxBytes) {
      setError(
        field === "verificationFileUrl"
          ? "O comprovante precisa ter no máximo 10MB."
          : "A imagem precisa ter no máximo 8MB.",
      );
      return;
    }

    setUploadingField(field);

    try {
      const url = await uploadCircuitImage(file, folder);
      updateField(field, url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Não foi possível enviar a imagem.",
      );
    } finally {
      setUploadingField(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const selectedSpot = spots.find((spot) => spot.id === form.spotId);
    const payload = {
      ...form,
      location: form.location || selectedSpot?.name || "",
      estimatedParticipants: form.estimatedParticipants
        ? Number(form.estimatedParticipants)
        : undefined,
    };

    const response = await fetch("/api/circuits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as {
      competition?: Competition;
      error?: string;
    };

    if (!response.ok || !data.competition) {
      setError(data.error ?? "Não foi possível enviar o Circuito para análise.");
      setStatus("idle");
      return;
    }

    onCreated(data.competition);
    setForm(emptyForm);
    setStatus("success");
  }

  return (
    <form onSubmit={handleSubmit} className="surface space-y-5 rounded-[18px] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tide-300/12 text-tide-300 ring-1 ring-tide-300/20">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">Cadastrar campeonato</h2>
          <p className="mt-1 text-sm leading-6 text-sand-100/62">
            O evento entra em análise antes de aparecer publicamente como aprovado.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className="label">nome do campeonato</span>
          <input
            className="field"
            maxLength={80}
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
          />
        </label>

        <label className="space-y-2">
          <span className="label">data e horário</span>
          <input
            className="field"
            type="datetime-local"
            min={minStartsAt}
            value={form.startsAt}
            onChange={(event) => updateField("startsAt", event.target.value)}
            required
          />
        </label>

        <label className="space-y-2">
          <span className="label">pico</span>
          <select
            className="field"
            value={form.spotId}
            onChange={(event) => {
              const spot = spots.find((item) => item.id === event.target.value);
              updateField("spotId", event.target.value);
              updateField("location", spot?.name ?? "");
            }}
          >
            <option value="">sem pico vinculado</option>
            {spots.map((spot) => (
              <option key={spot.id} value={spot.id}>
                {spot.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="label">cidade</span>
          <input
            className="field"
            maxLength={60}
            value={form.city}
            onChange={(event) => updateField("city", event.target.value)}
            required
          />
        </label>

        <label className="space-y-2">
          <span className="label">estado</span>
          <input
            className="field"
            maxLength={30}
            value={form.state}
            onChange={(event) => updateField("state", event.target.value)}
            required
          />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="label">descrição</span>
          <textarea
            className="field min-h-28 resize-y leading-6"
            maxLength={280}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            required
          />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="label">categorias</span>
          <input
            className="field"
            maxLength={160}
            placeholder="Open, Longboard, Feminino, Iniciante"
            value={form.categoriesText}
            onChange={(event) => updateField("categoriesText", event.target.value)}
          />
        </label>

        <label className="space-y-2">
          <span className="label">link oficial</span>
          <input
            className="field"
            type="url"
            maxLength={500}
            placeholder="https://..."
            value={form.officialUrl}
            onChange={(event) => updateField("officialUrl", event.target.value)}
            required
          />
        </label>

        <label className="space-y-2">
          <span className="label">instagram/site organizador</span>
          <input
            className="field"
            type="url"
            maxLength={500}
            placeholder="https://..."
            value={form.organizerProfileUrl}
            onChange={(event) =>
              updateField("organizerProfileUrl", event.target.value)
            }
          />
        </label>

        <label className="space-y-2">
          <span className="label">organizador</span>
          <input
            className="field"
            maxLength={80}
            value={form.organizerName}
            onChange={(event) => updateField("organizerName", event.target.value)}
          />
        </label>

        <label className="space-y-2">
          <span className="label">contato responsável</span>
          <input
            className="field"
            maxLength={120}
            value={form.organizerContact}
            onChange={(event) => updateField("organizerContact", event.target.value)}
            required
          />
        </label>

        <label className="space-y-2">
          <span className="label">prestígio</span>
          <select
            className="field"
            value={form.prestige}
            onChange={(event) =>
              updateField("prestige", event.target.value as Competition["prestige"])
            }
          >
            {prestigeOptions.map((prestige) => (
              <option key={prestige} value={prestige}>
                {prestige}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="label">nível recomendado</span>
          <input
            className="field"
            maxLength={80}
            value={form.recommendedLevel}
            onChange={(event) => updateField("recommendedLevel", event.target.value)}
          />
        </label>

        <label className="space-y-2">
          <span className="label">participantes estimados</span>
          <input
            className="field"
            type="number"
            min={0}
            max={10000}
            value={form.estimatedParticipants}
            onChange={(event) =>
              updateField("estimatedParticipants", event.target.value)
            }
          />
        </label>

        <div className="space-y-3 sm:col-span-2">
          <span className="label">banner do evento</span>
          {form.imageUrl ? (
            <div
              className="min-h-44 rounded-[18px] border border-white/10 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(180deg, transparent, rgba(6,16,18,0.45)), url(${form.imageUrl})`,
              }}
            />
          ) : null}
          <label className="secondary-button w-fit cursor-pointer px-4 py-3">
            <ImagePlus className="h-4 w-4" />
            {uploadingField === "imageUrl" ? "enviando..." : "adicionar banner"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                void handleUpload(event.target.files?.[0], "imageUrl", "circuits");
                event.target.value = "";
              }}
            />
          </label>
        </div>

        <label className="space-y-2 sm:col-span-2">
          <span className="label">regras ou observações</span>
          <textarea
            className="field min-h-24 resize-y leading-6"
            maxLength={280}
            value={form.rules}
            onChange={(event) => updateField("rules", event.target.value)}
          />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="label">premiação</span>
          <input
            className="field"
            maxLength={120}
            value={form.prize}
            onChange={(event) => updateField("prize", event.target.value)}
          />
        </label>

        <div className="space-y-3 sm:col-span-2">
          <span className="label">comprovante opcional</span>
          {form.verificationFileUrl ? (
            <p className="rounded-2xl border border-tide-300/20 bg-tide-300/10 p-3 text-sm font-bold text-tide-100">
              Comprovante anexado.
            </p>
          ) : null}
          <label className="secondary-button w-fit cursor-pointer px-4 py-3">
            <ImagePlus className="h-4 w-4" />
            {uploadingField === "verificationFileUrl" ? "enviando..." : "anexar comprovante"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                void handleUpload(event.target.files?.[0], "verificationFileUrl", "proofs");
                event.target.value = "";
              }}
            />
          </label>
        </div>

        <label className="space-y-2 sm:col-span-2">
          <span className="label">mensagem para análise</span>
          <textarea
            className="field min-h-24 resize-y leading-6"
            maxLength={280}
            value={form.reviewMessage}
            onChange={(event) => updateField("reviewMessage", event.target.value)}
          />
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-coral-400/25 bg-coral-400/10 p-3 text-sm font-bold text-coral-400">
          {error}
        </div>
      ) : null}

      {status === "success" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-tide-300/25 bg-tide-300/10 p-3 text-sm text-tide-300">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          Circuito enviado para análise.
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading" || Boolean(uploadingField)}
        className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {uploadingField
          ? "enviando imagem..."
          : status === "loading"
            ? "enviando..."
            : "enviar para análise"}
      </button>
    </form>
  );
}
