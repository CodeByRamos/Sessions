import { MessageCircle, Star, Waves } from "lucide-react";
import { notFound } from "next/navigation";
import { SessionHero } from "@/components/sessions/SessionHero";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { findSessionById, listAllSessions } from "@/services/sessions";
import { getFeaturedUser } from "@/services/users";

type SessionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const comments = [
  {
    name: "Lia Costa",
    text: "Essa esquerda do Matadeiro quando abre cedo parece outro lugar.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Theo Marinho",
    text: "Relato bonito. Dá para sentir a remada e o silêncio antes do crowd chegar.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
];

const relatedSurfers = [
  {
    name: "Lia Costa",
    role: "longboard · Campeche",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Theo Marinho",
    role: "shortboard · Mole",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Nina Sal",
    role: "fish twin · Barra",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
];

const gallery = [
  "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=900&q=80",
];

export async function generateStaticParams() {
  const sessions = await listAllSessions();

  return sessions.map((session) => ({
    id: session.id,
  }));
}

export default async function SessionDetailPage({ params }: SessionPageProps) {
  const { id } = await params;
  const [session, mockUser] = await Promise.all([
    findSessionById(id),
    getFeaturedUser(),
  ]);

  if (!session) {
    notFound();
  }

  return (
    <div className="fade-in">
      <SessionHero session={session} user={mockUser} />

      <div className="page-shell grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="space-y-8">
          <section className="surface rounded-[18px] p-6 sm:p-8">
            <p className="section-kicker">relato bruto</p>
            <p className="mt-4 text-lg leading-9 text-sand-100/78">
              {session.description}
            </p>
          </section>

          <section className="space-y-5">
            <SectionTitle
              eyebrow="galeria"
              title="Fragmentos da memória"
              description="Fotos mockadas hoje, prontas para receber upload real depois."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {[session.photoUrl, ...gallery].slice(0, 3).map((photo, index) => (
                <div
                  key={photo}
                  className={`min-h-56 rounded-[18px] border border-white/10 bg-cover bg-center ${
                    index === 0 ? "sm:col-span-2" : ""
                  }`}
                  style={{
                    backgroundImage: `linear-gradient(180deg, transparent, rgba(6,16,18,0.36)), url(${photo})`,
                  }}
                />
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <SectionTitle
              eyebrow="comentários"
              title="Lineup comentando"
              description="Interação mockada para validar a sensação social sem criar comunidade complexa ainda."
            />
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.name}
                  className="surface flex gap-4 rounded-[18px] p-4"
                >
                  <div
                    className="h-11 w-11 shrink-0 rounded-full bg-cover bg-center ring-2 ring-white/10"
                    style={{ backgroundImage: `url(${comment.avatar})` }}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-black text-white">{comment.name}</p>
                    <p className="mt-1 text-sm leading-6 text-sand-100/66">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="surface rounded-[18px] p-5">
            <p className="section-kicker">memória</p>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <span className="flex items-center gap-2 text-sm text-sand-100/62">
                  <Star className="h-4 w-4 text-sun-400" />
                  nota
                </span>
                <span className="font-black text-white">{session.rating}/5</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <span className="flex items-center gap-2 text-sm text-sand-100/62">
                  <Waves className="h-4 w-4 text-tide-300" />
                  ondas
                </span>
                <span className="font-black text-white">{session.wavesCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <span className="flex items-center gap-2 text-sm text-sand-100/62">
                  <MessageCircle className="h-4 w-4 text-tide-300" />
                  comentários
                </span>
                <span className="font-black text-white">{comments.length}</span>
              </div>
            </div>
          </div>

          <div className="surface rounded-[18px] p-5">
            <p className="section-kicker">surfistas próximos</p>
            <div className="mt-5 space-y-3">
              {relatedSurfers.map((surfer) => (
                <div
                  key={surfer.name}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3"
                >
                  <div
                    className="h-10 w-10 rounded-full bg-cover bg-center ring-2 ring-white/10"
                    style={{ backgroundImage: `url(${surfer.avatar})` }}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-black text-white">{surfer.name}</p>
                    <p className="text-xs text-sand-100/56">{surfer.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
