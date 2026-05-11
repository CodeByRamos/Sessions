import {
  CloudLightning,
  Flame,
  Moon,
  Sparkles,
  Sun,
  Waves,
  Wind,
} from "lucide-react";
import type { Mood } from "@/types/session";

export const moodOptions: Mood[] = [
  "zen",
  "caótico",
  "glorioso",
  "cansativo",
  "evolução",
  "frustrante",
  "clássico",
  "zerohora",
  "alma lavada",
  "mágico",
  "limpo",
  "calmo",
  "pesado",
];

export const moodMeta: Record<
  Mood,
  {
    label: string;
    description: string;
    icon: typeof Waves;
    tagClass: string;
    ringClass: string;
  }
> = {
  zen: {
    label: "Zen",
    description: "Mar sereno, respiração no ritmo e cabeça limpa.",
    icon: Wind,
    tagClass: "border-sky-300/35 bg-sky-300/12 text-sky-200",
    ringClass: "ring-sky-300/20",
  },
  caótico: {
    label: "Caótico",
    description: "Corrente, crowd, queda e aprendizado na marra.",
    icon: CloudLightning,
    tagClass: "border-coral-400/35 bg-coral-400/12 text-coral-300",
    ringClass: "ring-coral-400/20",
  },
  glorioso: {
    label: "Glorioso",
    description: "A session encaixou como lembrança grande.",
    icon: Sparkles,
    tagClass: "border-sun-400/40 bg-sun-400/12 text-sun-400",
    ringClass: "ring-sun-400/25",
  },
  cansativo: {
    label: "Cansativo",
    description: "Remada pesada, corpo cobrado e presença sustentada.",
    icon: Flame,
    tagClass: "border-orange-300/35 bg-orange-300/12 text-orange-200",
    ringClass: "ring-orange-300/20",
  },
  evolução: {
    label: "Evolução",
    description: "Uma session que mostrou progresso real.",
    icon: Sparkles,
    tagClass: "border-sun-400/35 bg-sun-400/12 text-sun-400",
    ringClass: "ring-sun-400/20",
  },
  frustrante: {
    label: "Frustrante",
    description: "Dia duro, mas ainda útil para entender o mar.",
    icon: CloudLightning,
    tagClass: "border-white/15 bg-white/8 text-sand-300",
    ringClass: "ring-white/10",
  },
  clássico: {
    label: "Clássico",
    description: "Aquela session sem exagero, bonita e sólida.",
    icon: Waves,
    tagClass: "border-sand-300/35 bg-sand-300/12 text-sand-100",
    ringClass: "ring-sand-300/20",
  },
  zerohora: {
    label: "ZeroHora",
    description: "Antes do mundo acordar, com a crew no escuro.",
    icon: Moon,
    tagClass: "border-tide-300/35 bg-tide-300/12 text-tide-300",
    ringClass: "ring-tide-300/20",
  },
  "alma lavada": {
    label: "Alma Lavada",
    description: "Saiu do mar mais leve do que entrou.",
    icon: Sun,
    tagClass: "border-emerald-300/35 bg-emerald-300/12 text-emerald-200",
    ringClass: "ring-emerald-300/20",
  },
  mágico: {
    label: "Mágico",
    description: "Luz, tempo e mar pareceram combinar.",
    icon: Sparkles,
    tagClass: "border-tide-300/35 bg-tide-300/12 text-tide-300",
    ringClass: "ring-tide-300/20",
  },
  limpo: {
    label: "Limpo",
    description: "Condição alinhada, parede clara e pouca interferência.",
    icon: Waves,
    tagClass: "border-emerald-300/35 bg-emerald-300/12 text-emerald-200",
    ringClass: "ring-emerald-300/20",
  },
  calmo: {
    label: "Calmo",
    description: "Mar mais baixo, leitura tranquila e tempo para respirar.",
    icon: Wind,
    tagClass: "border-sky-300/35 bg-sky-300/12 text-sky-200",
    ringClass: "ring-sky-300/20",
  },
  pesado: {
    label: "Pesado",
    description: "Mais água, mais respeito e menos margem para erro.",
    icon: CloudLightning,
    tagClass: "border-coral-400/35 bg-coral-400/12 text-coral-400",
    ringClass: "ring-coral-400/20",
  },
};

export function getMoodMeta(mood: Mood) {
  return moodMeta[mood] ?? moodMeta.evolução;
}
