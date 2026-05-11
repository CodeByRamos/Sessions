import { MapPin, Waves } from "lucide-react";
import Link from "next/link";
import { SurfMap } from "@/components/map/SurfMap";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { listSessionsByUser } from "@/services/sessions";
import { listSpots } from "@/services/spots";
import { requireUser } from "@/services/users";

export default async function MapPage() {
  const user = await requireUser();
  const [spots, sessions] = await Promise.all([
    listSpots(),
    listSessionsByUser(user.id),
  ]);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const surfedSpotIds = new Set(sessions.map((session) => session.spotId).filter(Boolean));
  const surfedSpots = spots.filter((spot) => surfedSpotIds.has(spot.id));
  const visibleSpots = surfedSpots.length ? surfedSpots : spots;
  const mapSpots = visibleSpots.map((spot) => ({
    id: spot.id,
    name: spot.name,
    waveType: spot.waveType,
    latitude: spot.latitude,
    longitude: spot.longitude,
    sessionsCount: sessions.filter((session) => session.spotId === spot.id).length,
  }));

  return (
    <div className="page-shell space-y-8 fade-in">
      <SectionTitle
        eyebrow="mapa"
        title="Picos surfados no seu mapa"
        description="Veja os picos onde você já surfou e descubra novas memórias perto de você."
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_0.36fr]">
        <div className="surface min-h-[520px] overflow-hidden rounded-[18px]">
          <SurfMap token={token} spots={mapSpots} />
        </div>

        <aside className="space-y-4">
          <div className="surface rounded-[18px] p-5">
            <p className="section-kicker">cobertura</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="metric-tile">
                <p className="text-3xl font-black text-white">{surfedSpots.length}</p>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-sand-300/58">
                  picos surfados
                </p>
              </div>
              <div className="metric-tile">
                <p className="text-3xl font-black text-tide-300">{sessions.length}</p>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-sand-300/58">
                  registros
                </p>
              </div>
            </div>
          </div>

          <div className="surface rounded-[18px] p-5">
            <p className="section-kicker">picos</p>
            <div className="mt-5 space-y-3">
              {visibleSpots.map((spot) => {
                const total = sessions.filter((session) => session.spotId === spot.id).length;

                return (
                  <Link
                    key={spot.id}
                    href={`/picos/${spot.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 transition hover:border-tide-300/25 hover:bg-white/[0.065]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <MapPin className="h-5 w-5 shrink-0 text-tide-300" />
                      <span className="min-w-0">
                        <span className="block line-clamp-1 text-sm font-black text-white">
                          {spot.name}
                        </span>
                        <span className="line-clamp-1 text-xs text-sand-100/55">
                          {spot.waveType}
                        </span>
                      </span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm font-black text-sand-100/70">
                      <Waves className="h-4 w-4" />
                      {total}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
