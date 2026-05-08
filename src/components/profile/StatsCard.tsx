import type { ReactNode } from "react";

type StatsCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  tone?: "tide" | "coral" | "sun";
};

const toneStyles = {
  tide: "text-tide-300",
  coral: "text-coral-400",
  sun: "text-sun-400",
};

export function StatsCard({
  label,
  value,
  helper,
  icon,
  tone = "tide",
}: StatsCardProps) {
  return (
    <div className="surface interactive-card rounded-[18px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sand-300/65">
            {label}
          </p>
          <p className="mt-3 break-words text-3xl font-black leading-none text-white sm:text-4xl">
            {value}
          </p>
        </div>
        {icon ? (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-lg bg-white/[0.06] ${toneStyles[tone]}`}
          >
            {icon}
          </div>
        ) : null}
      </div>
      {helper ? <p className="mt-4 text-sm text-sand-100/62">{helper}</p> : null}
    </div>
  );
}
