import { CalendarDays, Camera, Star, Waves, Wind } from "lucide-react";
import type { Mood } from "@/types/session";
import { MoodTag } from "@/components/sessions/MoodTag";

type SessionPreviewProps = {
  title?: string;
  beach?: string;
  date?: string;
  waveSize?: string;
  wind?: string;
  board?: string;
  mood?: Mood;
  rating?: number;
  wavesCount?: number;
  description?: string;
  photoUrl?: string;
};

export function SessionPreview({
  title,
  beach,
  date,
  waveSize,
  wind,
  board,
  mood = "evolução",
  rating = 4,
  wavesCount = 0,
  description,
  photoUrl,
}: SessionPreviewProps) {
  return (
    <aside className="surface sticky top-24 overflow-hidden rounded-[18px]">
      <div
        className="relative h-56 bg-cover bg-center"
        style={{
          backgroundImage:
            `linear-gradient(180deg, rgba(6,16,18,0.05), rgba(6,16,18,0.9)), url(${photoUrl ?? "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1000&q=80"})`,
        }}
      >
        <div className="absolute left-4 top-4">
          <MoodTag mood={mood} showIcon />
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-sm font-black text-sun-400 backdrop-blur">
          <Star className="h-4 w-4 fill-current" />
          {rating}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-tide-300">
            preview ao vivo
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-white">
            {title || "Sua próxima memória no mar"}
          </h2>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="metric-tile">
            <p className="flex items-center gap-2 text-sand-300/58">
              <Waves className="h-4 w-4 text-tide-300" />
              Praia
            </p>
            <p className="mt-1 font-black text-white">{beach || "sem pico ainda"}</p>
          </div>
          <div className="metric-tile">
            <p className="flex items-center gap-2 text-sand-300/58">
              <CalendarDays className="h-4 w-4 text-tide-300" />
              Data
            </p>
            <p className="mt-1 font-black text-white">{date || "hoje"}</p>
          </div>
          <div className="metric-tile">
            <p className="flex items-center gap-2 text-sand-300/58">
              <Wind className="h-4 w-4 text-tide-300" />
              Vento
            </p>
            <p className="mt-1 font-black text-white">{wind || "a definir"}</p>
          </div>
          <div className="metric-tile">
            <p className="text-sand-300/58">Ondas</p>
            <p className="mt-1 font-black text-white">{wavesCount}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-sand-300/60">
            prancha e condição
          </p>
          <p className="mt-2 text-sm font-bold text-white">
            {board || "prancha"} · {waveSize || "tamanho do mar"}
          </p>
        </div>

        <p className="line-clamp-4 text-sm leading-6 text-sand-100/68">
          {description ||
            "Enquanto você escreve, a session ganha forma aqui: uma prévia simples, bonita e pronta para virar memória."}
        </p>

        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-white/15 bg-ink-950/45 p-3 text-sm text-sand-100/62">
          <Camera className="h-4 w-4 text-tide-300" />
          imagem da memória
        </div>
      </div>
    </aside>
  );
}
