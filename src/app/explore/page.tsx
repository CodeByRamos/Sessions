import {
  Award,
  BarChart3,
  Map,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";

const exploreItems = [
  {
    href: "/picos",
    title: "Picos",
    description: "Praias do Guarujá, condições e sessions por spot.",
    icon: MapPin,
  },
  {
    href: "/circuits",
    title: "Circuitos",
    description: "Campeonatos, eventos locais e desafios especiais para entrar no clima.",
    icon: Trophy,
  },
  {
    href: "/crew",
    title: "Crew",
    description: "Sessions futuras para encontrar gente para cair junto.",
    icon: Users,
  },
  {
    href: "/stats",
    title: "Estatísticas",
    description: "Evolução, frequência, moods, prancha e ondas.",
    icon: BarChart3,
  },
  {
    href: "/map",
    title: "Mapa",
    description: "Veja seus picos surfados e abra cada praia para reviver sessions.",
    icon: Map,
  },
  {
    href: "/badges",
    title: "Badges",
    description: "Conquistas, raridades e identidade de surfista.",
    icon: Award,
  },
];

export default function ExplorePage() {
  return (
    <div className="page-shell space-y-8 fade-in">
      <SectionTitle
        eyebrow="explorar"
        title="Tudo que existe além do feed"
        description="Descubra picos, crews, circuitos, estatísticas e conquistas que expandem sua vida dentro d'água."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exploreItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="surface interactive-card rounded-[18px] p-5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tide-300/10 text-tide-300 ring-1 ring-tide-300/20">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-black text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-sand-100/62">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
