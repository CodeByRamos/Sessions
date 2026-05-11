import type { Mood } from "@/types/session";
import { getMoodMeta } from "@/lib/moods";

type MoodTagProps = {
  mood: Mood;
  showIcon?: boolean;
};

export function MoodTag({ mood, showIcon = false }: MoodTagProps) {
  const meta = getMoodMeta(mood);
  const Icon = meta.icon;

  return (
    <span
      title={meta.description}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${meta.tagClass}`}
    >
      {showIcon ? <Icon className="h-3.5 w-3.5" /> : null}
      {meta.label}
    </span>
  );
}
