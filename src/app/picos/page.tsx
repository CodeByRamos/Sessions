import { MapPin, Waves } from "lucide-react";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { countSessionsBySpot } from "@/services/spots";

export default async function SpotsPage() {
  const spots = await countSessionsBySpot();

  return (
    <div className="page-shell space-y-8 fade-in">
      <SectionTitle
        eyebrow="picos"
        title="Guarujá no mapa do Sessions"
        description="Por enquanto, o registro de sessions fica concentrado nos picos mais importantes do Guarujá."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {spots.map(({ spot, total }) => (
          <article key={spot.id} className="surface interactive-card overflow-hidden rounded-[18px]">
            <div
              className="h-44 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(180deg, transparent, rgba(6,16,18,0.74)), url(${spot.imageUrl})`,
              }}
            />
            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-tide-300">
                    <MapPin className="h-4 w-4" />
                    {spot.city}
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white">{spot.name}</h2>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-sand-100/62">
                  {total}
                </span>
              </div>
              <p className="text-sm leading-6 text-sand-100/62">{spot.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="metric-tile">
                  <p className="text-sand-300/56">nível</p>
                  <p className="mt-1 font-black text-white">{spot.difficulty}</p>
                </div>
                <div className="metric-tile">
                  <p className="text-sand-300/56">onda</p>
                  <p className="mt-1 line-clamp-1 font-black text-white">
                    {spot.waveType}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/picos/${spot.id}`} className="secondary-button py-2.5">
                  ver sessions
                </Link>
                <Link href={`/sessions/new?spot=${spot.id}`} className="primary-button py-2.5">
                  <Waves className="h-4 w-4" />
                  registrar aqui
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
