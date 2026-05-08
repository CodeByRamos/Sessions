import Link from "next/link";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="surface flex min-h-72 flex-col items-center justify-center rounded-xl p-8 text-center">
      {icon ? (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-white/[0.06] text-tide-300">
          {icon}
        </div>
      ) : null}
      <h2 className="text-2xl font-black text-white">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-sand-100/65">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="primary-button mt-6">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
