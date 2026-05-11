"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, Waves } from "lucide-react";
import { SessionCard } from "@/components/sessions/SessionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { moodOptions } from "@/lib/moods";
import type { Session } from "@/types/session";
import type { Spot } from "@/types/spot";
import type { Badge, User } from "@/types/user";

type FeedItem = {
  session: Session;
  author: User | null;
  badges: Badge[];
};

type FeedClientProps = {
  items: FeedItem[];
  spots: Spot[];
};

export function FeedClient({ items, spots }: FeedClientProps) {
  const [filters, setFilters] = useState({
    spotId: "",
    mood: "",
    date: "",
  });

  const filteredItems = useMemo(
    () =>
      items.filter(({ session }) => {
        const bySpot = filters.spotId ? session.spotId === filters.spotId : true;
        const byMood = filters.mood ? session.mood === filters.mood : true;
        const byDate = filters.date ? session.date === filters.date : true;

        return bySpot && byMood && byDate;
      }),
    [filters, items],
  );

  const topMood =
    filteredItems
      .map(({ session }) => session.mood)
      .sort(
        (a, b) =>
          filteredItems.filter((item) => item.session.mood === b).length -
          filteredItems.filter((item) => item.session.mood === a).length,
      )[0] ?? "sem mood";

  return (
    <div className="page-shell space-y-6 fade-in">
      <header className="space-y-5">
        <SectionTitle
          eyebrow="feed público"
          title="Memórias recentes da costa"
          description="Acompanhe as sessions recentes da comunidade."
          aside={
            <div className="secondary-button w-fit px-4 py-2.5">
              <SlidersHorizontal className="h-4 w-4" />
              filtros ativos
            </div>
          }
        />

        <div className="surface rounded-[18px] p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <select
              className="field"
              value={filters.spotId}
              onChange={(event) =>
                setFilters((current) => ({ ...current, spotId: event.target.value }))
              }
            >
              <option value="">todas as praias</option>
              {spots.map((spot) => (
                <option key={spot.id} value={spot.id}>
                  {spot.name}
                </option>
              ))}
            </select>
            <select
              className="field"
              value={filters.mood}
              onChange={(event) =>
                setFilters((current) => ({ ...current, mood: event.target.value }))
              }
            >
              <option value="">todos os moods</option>
              {moodOptions.map((mood) => (
                <option key={mood} value={mood}>
                  {mood}
                </option>
              ))}
            </select>
            <input
              className="field"
              type="date"
              value={filters.date}
              onChange={(event) =>
                setFilters((current) => ({ ...current, date: event.target.value }))
              }
            />
          </div>
        </div>
      </header>

      {filteredItems.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="grid gap-5 md:grid-cols-2">
            {filteredItems.map(({ session, author, badges }) => (
              <SessionCard
                key={session.id}
                session={session}
                authorName={author?.name ?? "Surfista Sessions"}
                authorAvatarUrl={author?.avatarUrl}
                badges={badges}
              />
            ))}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="surface rounded-[18px] p-5">
              <p className="section-kicker">lineup agora</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="metric-tile">
                  <p className="text-sand-300/58">públicas</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {filteredItems.length}
                  </p>
                </div>
                <div className="metric-tile">
                  <p className="text-sand-300/58">mood top</p>
                  <p className="mt-1 line-clamp-1 text-2xl font-black text-white">
                    {topMood}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <EmptyState
          title="Nada no lineup ainda"
          description="Quando sessions públicas combinarem com seus filtros, elas aparecem aqui."
          icon={<Waves className="h-7 w-7" />}
          actionLabel="criar session"
          actionHref="/sessions/new"
        />
      )}
    </div>
  );
}
