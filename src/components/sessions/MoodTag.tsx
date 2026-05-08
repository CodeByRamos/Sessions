import type { Mood } from "@/types/session";

const moodStyles: Record<Mood, string> = {
  mágico: "border-tide-300/35 bg-tide-300/12 text-tide-300",
  clássico: "border-sand-300/35 bg-sand-300/12 text-sand-100",
  pesado: "border-coral-400/35 bg-coral-400/12 text-coral-400",
  frustrante: "border-white/15 bg-white/8 text-sand-300",
  limpo: "border-emerald-300/35 bg-emerald-300/12 text-emerald-200",
  calmo: "border-sky-300/35 bg-sky-300/12 text-sky-200",
  evolução: "border-sun-400/35 bg-sun-400/12 text-sun-400",
};

type MoodTagProps = {
  mood: Mood;
};

export function MoodTag({ mood }: MoodTagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${moodStyles[mood]}`}
    >
      {mood}
    </span>
  );
}
