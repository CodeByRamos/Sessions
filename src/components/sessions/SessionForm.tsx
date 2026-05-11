"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import {
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  PenLine,
  Send,
  Waves,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Mood } from "@/types/session";
import type { Spot } from "@/types/spot";
import type { Competition } from "@/types/circuit";
import { SessionPreview } from "@/components/sessions/SessionPreview";
import { moodOptions } from "@/lib/moods";

type SessionDraft = {
  title: string;
  spotId: string;
  date: string;
  waveSize: string;
  wind: string;
  board: string;
  mood: Mood;
  difficulty: "leve" | "moderada" | "difícil" | "casca grossa";
  rating: number;
  wavesCount: number;
  maneuvers: string;
  description: string;
  mediaUrl: string;
  mediaUrls: string[];
  isPublic: boolean;
  sessionType: "common" | "competition";
  competitionId: string;
  competitionCategory: string;
  competitionResult: string;
  competitionRound: string;
  competitionScore: string;
  competitionFeeling: string;
};

function createInitialDraft(
  initialSpotId: string,
  initialCompetitionId = "",
): SessionDraft {
  return {
  title: "",
  spotId: initialSpotId,
  date: new Date().toISOString().slice(0, 10),
  waveSize: "",
  wind: "",
  board: "",
  mood: "evolução",
  difficulty: "moderada",
  rating: 4,
  wavesCount: 0,
  maneuvers: "",
  description: "",
  mediaUrl: "",
  mediaUrls: [],
  isPublic: true,
  sessionType: initialCompetitionId ? "competition" : "common",
  competitionId: initialCompetitionId,
  competitionCategory: "",
  competitionResult: "",
  competitionRound: "",
  competitionScore: "",
  competitionFeeling: "",
};
}

const steps = [
  { title: "Mar", description: "pico e condições", icon: Waves },
  { title: "Relato", description: "sensação e evolução", icon: PenLine },
  { title: "Fotos", description: "memória visual", icon: Camera },
  { title: "Revisão", description: "confere tudo", icon: ListChecks },
  { title: "Publicar", description: "vai para o feed", icon: Send },
];

type SessionFormProps = {
  spots: Spot[];
  competitions: Competition[];
  initialSpotId?: string;
  initialCompetitionId?: string;
};

export function SessionForm({
  spots,
  competitions,
  initialSpotId,
  initialCompetitionId,
}: SessionFormProps) {
  const router = useRouter();
  const fallbackSpotId = initialSpotId ?? spots[0]?.id ?? "";
  const initialCompetition = competitions.find(
    (competition) => competition.id === initialCompetitionId,
  );
  const [draft, setDraft] = useState<SessionDraft>(
    createInitialDraft(
      initialCompetition?.spotId ?? fallbackSpotId,
      initialCompetition?.id ?? "",
    ),
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [submittedTitle, setSubmittedTitle] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [error, setError] = useState("");
  const selectedSpot = spots.find((spot) => spot.id === draft.spotId);
  const approvedCompetitions = competitions.filter(
    (competition) => competition.status === "approved",
  );

  const canSubmit = useMemo(
    () =>
      draft.title.trim().length > 2 &&
      draft.spotId.trim().length > 2 &&
      draft.waveSize.trim().length > 0 &&
      draft.wind.trim().length > 0 &&
      draft.board.trim().length > 0 &&
      draft.description.trim().length > 8 &&
      (draft.sessionType === "common" || draft.competitionId.trim().length > 0),
    [draft],
  );

  function updateDraft<Key extends keyof SessionDraft>(
    key: Key,
    value: SessionDraft[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function uploadSessionImage(file: File) {
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
      body: JSON.stringify({ file: dataUrl, folder: "sessions" }),
    });
    const data = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !data.url) {
      throw new Error(data.error ?? "Não foi possível enviar a imagem. Tente novamente.");
    }

    return data.url;
  }

  async function handleMediaFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Envie apenas imagens válidas para a session.");
      event.target.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("A imagem da session precisa ter no máximo 8MB.");
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setDraft((current) => ({
      ...current,
      mediaUrl: previewUrl,
      mediaUrls: [previewUrl],
    }));
    setUploadingMedia(true);

    try {
      const uploadedUrl = await uploadSessionImage(file);
      setDraft((current) => ({
        ...current,
        mediaUrl: uploadedUrl,
        mediaUrls: [uploadedUrl],
      }));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Não foi possível enviar a imagem. Tente novamente.",
      );
      setDraft((current) => ({ ...current, mediaUrl: "", mediaUrls: [] }));
    } finally {
      setUploadingMedia(false);
      event.target.value = "";
    }
  }

  function isStepReady(index: number) {
    if (index === 0) {
      return (
        draft.spotId.trim().length > 2 &&
        draft.waveSize.trim().length > 0 &&
        draft.wind.trim().length > 0
      );
    }

    if (index === 1) {
      return (
        draft.title.trim().length > 2 &&
        draft.board.trim().length > 0 &&
        draft.description.trim().length > 8 &&
        (draft.sessionType === "common" || draft.competitionId.trim().length > 0)
      );
    }

    return true;
  }

  function nextStep() {
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function previousStep() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!canSubmit) {
      return;
    }

    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = (await response.json()) as {
      error?: string;
      session?: { id: string };
    };

    if (!response.ok || !data.session) {
      setError(data.error ?? "Não foi possível salvar a session.");
      return;
    }

    setSubmittedTitle(draft.title);
    setDraft(createInitialDraft(fallbackSpotId));
    router.push(`/session/${data.session.id}`);
    router.refresh();
  }

  const stepReady = isStepReady(currentStep);

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[0.62fr_0.38fr]">
      <div className="space-y-5">
        <div className="surface rounded-[18px] p-4 sm:p-5">
          <div className="grid grid-cols-5 gap-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index;
              const isDone = index < currentStep;

              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`rounded-2xl border p-3 text-left transition ${
                    isActive
                      ? "border-tide-300/35 bg-tide-300/12 text-tide-300"
                      : isDone
                        ? "border-sun-400/25 bg-sun-400/10 text-sun-400"
                        : "border-white/10 bg-white/[0.035] text-sand-100/58"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="mt-3 block text-xs font-black uppercase tracking-[0.14em]">
                    {index + 1}
                  </span>
                  <span className="hidden text-sm font-black text-white sm:block">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <section className="surface rounded-[18px] p-5 sm:p-7">
          <div className="mb-6">
            <p className="section-kicker">passo {currentStep + 1} de 5</p>
            <h2 className="mt-2 text-3xl font-black text-white">
              {steps[currentStep].title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-sand-100/62">
              {steps[currentStep].description}
            </p>
          </div>

          {currentStep === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="label">Pico</span>
                <select
                  className="field"
                  value={draft.spotId}
                  onChange={(event) => updateDraft("spotId", event.target.value)}
                >
                  {spots.map((spot) => (
                    <option key={spot.id} value={spot.id}>
                      {spot.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="space-y-2 sm:col-span-2">
                <span className="label">Tipo de registro</span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    ["common", "Session comum", "treino, free surf ou diário pessoal"],
                    ["competition", "Session de campeonato", "bateria, resultado e circuito"],
                  ].map(([value, title, description]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        updateDraft("sessionType", value as SessionDraft["sessionType"])
                      }
                      className={`rounded-2xl border p-4 text-left transition ${
                        draft.sessionType === value
                          ? "border-tide-300/35 bg-tide-300/12 text-tide-300"
                          : "border-white/10 bg-white/[0.035] text-sand-100/64"
                      }`}
                    >
                      <span className="block font-black text-white">{title}</span>
                      <span className="mt-1 block text-sm">{description}</span>
                    </button>
                  ))}
                </div>
              </div>
              <label className="space-y-2">
                <span className="label">Data</span>
                <input
                  type="date"
                  className="field"
                  value={draft.date}
                  onChange={(event) => updateDraft("date", event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="label">Tamanho do mar</span>
                <input
                  className="field"
                  value={draft.waveSize}
                  onChange={(event) => updateDraft("waveSize", event.target.value)}
                  placeholder="1m, meio metro, 1,5m..."
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="label">Vento</span>
                <input
                  className="field"
                  value={draft.wind}
                  onChange={(event) => updateDraft("wind", event.target.value)}
                  placeholder="Terral fraco, sul moderado..."
                />
              </label>
            </div>
          ) : null}

          {currentStep === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="label">Título da session</span>
                <input
                  className="field"
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  placeholder="Ex: Zero hora com linha limpa"
                  maxLength={60}
                />
              </label>
              {draft.sessionType === "competition" ? (
                <>
                  <label className="space-y-2 sm:col-span-2">
                    <span className="label">Circuito aprovado</span>
                    <select
                      className="field"
                      value={draft.competitionId}
                      onChange={(event) =>
                        updateDraft("competitionId", event.target.value)
                      }
                    >
                      <option value="">Escolha um campeonato</option>
                      {approvedCompetitions.map((competition) => (
                        <option key={competition.id} value={competition.id}>
                          {competition.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="label">Categoria</span>
                    <input
                      className="field"
                      value={draft.competitionCategory}
                      onChange={(event) =>
                        updateDraft("competitionCategory", event.target.value)
                      }
                      placeholder="Open, iniciante, longboard..."
                      maxLength={60}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="label">Resultado / colocação</span>
                    <input
                      className="field"
                      value={draft.competitionResult}
                      onChange={(event) =>
                        updateDraft("competitionResult", event.target.value)
                      }
                      placeholder="3º lugar, semifinal, campeão..."
                      maxLength={60}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="label">Rodada / fase</span>
                    <input
                      className="field"
                      value={draft.competitionRound}
                      onChange={(event) =>
                        updateDraft("competitionRound", event.target.value)
                      }
                      placeholder="Round 1, final..."
                      maxLength={60}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="label">Pontuação</span>
                    <input
                      className="field"
                      value={draft.competitionScore}
                      onChange={(event) =>
                        updateDraft("competitionScore", event.target.value)
                      }
                      placeholder="12.40"
                      maxLength={40}
                    />
                  </label>
                  <label className="space-y-2 sm:col-span-2">
                    <span className="label">Sensação durante a bateria</span>
                    <textarea
                      className="field min-h-24 resize-y leading-6"
                      value={draft.competitionFeeling}
                      onChange={(event) =>
                        updateDraft("competitionFeeling", event.target.value)
                      }
                      placeholder="Frio na barriga, foco, pressão, presença..."
                      maxLength={280}
                    />
                  </label>
                </>
              ) : null}
              <label className="space-y-2">
                <span className="label">Prancha</span>
                <input
                  className="field"
                  value={draft.board}
                  onChange={(event) => updateDraft("board", event.target.value)}
                  placeholder="6'0 Fish Twin"
                  maxLength={60}
                />
              </label>
              <label className="space-y-2">
                <span className="label">Sentimento</span>
                <select
                  className="field"
                  value={draft.mood}
                  onChange={(event) => updateDraft("mood", event.target.value as Mood)}
                >
                  {moodOptions.map((mood) => (
                    <option key={mood} value={mood}>
                      {mood}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="label">Dificuldade</span>
                <select
                  className="field"
                  value={draft.difficulty}
                  onChange={(event) =>
                    updateDraft(
                      "difficulty",
                      event.target.value as SessionDraft["difficulty"],
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
                <span className="label">Ondas surfadas</span>
                <input
                  type="number"
                  min={0}
                  className="field"
                  value={draft.wavesCount}
                  onChange={(event) =>
                    updateDraft("wavesCount", Number(event.target.value))
                  }
                />
              </label>
              <label className="space-y-2">
                <span className="label">Nota</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  className="field"
                  value={draft.rating}
                  onChange={(event) => updateDraft("rating", Number(event.target.value))}
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="label">Manobras / foco técnico</span>
                <input
                  className="field"
                  value={draft.maneuvers}
                  onChange={(event) => updateDraft("maneuvers", event.target.value)}
                  placeholder="drop, base, rasgada, trim..."
                  maxLength={140}
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="label">Relato pessoal</span>
                <textarea
                  className="field min-h-40 resize-y leading-6"
                  value={draft.description}
                  onChange={(event) => updateDraft("description", event.target.value)}
                  placeholder="Como foi a remada, o crowd, o drop e a sensação da session?"
                  maxLength={2000}
                />
                <span className="block text-right text-xs text-sand-300/52">
                  {draft.description.length}/2000
                </span>
              </label>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="rounded-[18px] border border-dashed border-white/15 bg-ink-950/45 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.07] text-tide-300">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-2xl font-black text-white">Foto da session</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-sand-100/64">
                Envie uma imagem leve para usar como capa da memória.
              </p>
              <label className="secondary-button mt-6 cursor-pointer">
                <Camera className="h-4 w-4" />
                adicionar foto
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleMediaFile}
                />
              </label>
              {draft.mediaUrl ? (
                <div
                  className="mt-5 min-h-60 rounded-[18px] border border-white/10 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(180deg, transparent, rgba(6,16,18,0.36)), url(${draft.mediaUrl})`,
                  }}
                />
              ) : null}
              <label className="mt-5 block space-y-2">
                <span className="label">URL de mídia opcional</span>
                <input
                  className="field"
                  value={draft.mediaUrl}
                  onChange={(event) => {
                    updateDraft("mediaUrl", event.target.value);
                    updateDraft("mediaUrls", event.target.value ? [event.target.value] : []);
                  }}
                  placeholder="https://..."
                  maxLength={2000}
                />
              </label>
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Pico", selectedSpot?.name || "sem pico"],
                  ["Mar", draft.waveSize || "sem tamanho"],
                  ["Vento", draft.wind || "sem vento"],
                  ["Prancha", draft.board || "sem prancha"],
                  ["Mood", draft.mood],
                  ["Dificuldade", draft.difficulty],
                  ["Tipo", draft.sessionType === "competition" ? "campeonato" : "comum"],
                  [
                    "Circuito",
                    approvedCompetitions.find(
                      (competition) => competition.id === draft.competitionId,
                    )?.name ?? "sem circuito",
                  ],
                  ["Ondas", String(draft.wavesCount)],
                  ["Manobras", draft.maneuvers || "sem foco"],
                ].map(([label, value]) => (
                  <div key={label} className="metric-tile">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-sand-300/55">
                      {label}
                    </p>
                    <p className="mt-2 font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="label">relato</p>
                <p className="mt-3 text-sm leading-6 text-sand-100/70">
                  {draft.description || "Seu relato aparece aqui antes de publicar."}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="label">texto cinematográfico</p>
                <p className="mt-3 text-sm leading-6 text-sand-100/54">
                  Campo reservado para a narração futura da memória.
                </p>
              </div>
            </div>
          ) : null}

          {currentStep === 4 ? (
            <div className="space-y-5">
              <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                <span>
                  <span className="block text-sm font-black text-white">
                    Publicar no feed
                  </span>
                  <span className="mt-1 block text-xs text-sand-300/70">
                    Sua session aparece para outros surfistas.
                  </span>
                </span>
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-tide-400"
                  checked={draft.isPublic}
                  onChange={(event) => updateDraft("isPublic", event.target.checked)}
                />
              </label>

              <button
                type="submit"
                disabled={!canSubmit || uploadingMedia}
                className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Send className="h-4 w-4" />
                {uploadingMedia ? "enviando imagem..." : "publicar session"}
              </button>

              {submittedTitle ? (
                <div className="flex items-start gap-3 rounded-2xl border border-tide-300/25 bg-tide-300/10 p-4 text-sm text-tide-300">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>
                    <span className="font-black">Session criada:</span>{" "}
                    {submittedTitle}.
                  </p>
                </div>
              ) : null}
              {error ? (
                <div className="rounded-2xl border border-coral-400/25 bg-coral-400/10 p-4 text-sm font-bold text-coral-400">
                  {error}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-7 flex items-center justify-between gap-3 soft-divider pt-5">
            <button
              type="button"
              onClick={previousStep}
              disabled={currentStep === 0}
              className="secondary-button px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              voltar
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!stepReady}
                className="primary-button px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-45"
              >
                continuar
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </section>
      </div>

      <div className="lg:pt-[94px]">
        <SessionPreview
          {...draft}
          beach={selectedSpot?.name}
          photoUrl={draft.mediaUrl || selectedSpot?.imageUrl}
        />
      </div>
    </form>
  );
}
