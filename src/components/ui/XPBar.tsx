type XPBarProps = {
  current: number;
  max: number;
  label?: string;
};

export function XPBar({ current, max, label = "XP" }: XPBarProps) {
  const percent = Math.min(Math.round((current / max) * 100), 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-sand-300/70">
        <span>{label}</span>
        <span>
          {current}/{max}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-ink-950/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-tide-400 via-sun-400 to-coral-400"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
