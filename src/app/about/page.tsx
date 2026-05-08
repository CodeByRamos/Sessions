import { Code2, Heart, Users, Waves } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";

const storySections = [
  {
    title: "Surf e software",
    icon: Code2,
    text: "O Sessions nasceu da minha relação com o surf e com o desenvolvimento de software. Sou um surfista iniciante, mas desde sempre me identifiquei com o esporte, com o lifestyle, com o mar e com tudo que o surf representa.",
  },
  {
    title: "Amizade no começo",
    icon: Users,
    text: "Comecei a surfar com meus dois amigos, Diogo Camargo e Matheus Xavier, e sigo surfando com eles até hoje. Nessa jornada, aprendi que evoluir no mar não é só sobre técnica, prancha ou manobra, mas também sobre amizade, constância, humildade e presença.",
  },
  {
    title: "Picos que viraram história",
    icon: Waves,
    text: "Sou local da Praia do Tombo, costumo cair no Bostrô e tenho um carinho enorme pela Praia das Astúrias. Esses picos fazem parte da minha história, do meu começo e da minha vontade de evoluir como surfista e como pessoa.",
  },
  {
    title: "Gratidão",
    icon: Heart,
    text: "Quero agradecer aos meus amigos pela coletividade, pela parceria e por tudo que já me ajudaram dentro e fora d’água. Também quero agradecer à comunidade do surf por manter vivo esse esporte maravilhoso, que transforma a forma como a gente olha para o mundo.",
  },
];

export default function AboutPage() {
  return (
    <div className="fade-in">
      <section
        className="relative flex min-h-[560px] items-end border-b border-white/10 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(6,16,18,0.97), rgba(6,16,18,0.76), rgba(6,16,18,0.26)), url(https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1800&q=80)",
        }}
      >
        <div className="page-shell pb-10">
          <p className="section-kicker">sobre nós</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-none text-white sm:text-7xl">
            Cada session carrega uma história.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-sand-100/74">
            O Sessions é minha forma de unir duas coisas que fazem parte de mim:
            o surf e a tecnologia.
          </p>
        </div>
      </section>

      <section className="page-shell space-y-8">
        <SectionTitle
          eyebrow="origem"
          title="Um projeto de evolução"
          description="Criado por alguém que ainda está aprendendo a surfar, mas que já entendeu que o mar ensina para além da técnica."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {storySections.map((section) => {
            const Icon = section.icon;

            return (
              <article key={section.title} className="surface interactive-card rounded-[18px] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tide-300/10 text-tide-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-2xl font-black text-white">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-sand-100/68">
                  {section.text}
                </p>
              </article>
            );
          })}
        </div>

        <div className="surface rounded-[18px] p-6 sm:p-8">
          <p className="text-2xl font-black leading-10 text-white">
            O Sessions é um diário para lembrar que evolução não acontece só
            quando a manobra encaixa. Ela acontece quando a gente volta, observa,
            registra, agradece e continua.
          </p>
        </div>
      </section>
    </div>
  );
}
