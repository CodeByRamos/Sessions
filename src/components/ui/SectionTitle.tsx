import Link from "next/link";
import type { ReactNode } from "react";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  aside?: ReactNode;
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  aside,
}: SectionTitleProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
        <h2 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-sm leading-6 text-sand-100/66 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {aside ?? (actionLabel && actionHref ? (
        <Link href={actionHref} className="secondary-button w-fit px-4 py-2.5">
          {actionLabel}
        </Link>
      ) : null)}
    </div>
  );
}
