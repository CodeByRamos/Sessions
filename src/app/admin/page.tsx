import {
  BadgeCheck,
  CalendarClock,
  Image,
  MessageSquareWarning,
  Trophy,
  Users,
  Waves,
} from "lucide-react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { readDb } from "@/lib/db";
import { requirePanelUser } from "@/services/admin";

const metricIcons = {
  users: Users,
  sessions: Waves,
  crews: CalendarClock,
  pending: Trophy,
  approved: Trophy,
  reports: MessageSquareWarning,
  badges: BadgeCheck,
  uploads: Image,
};

export default async function AdminPage() {
  const user = await requirePanelUser(["ORGANIZER", "MODERATOR", "ADMIN"]);
  const db = await readDb();
  const isOrganizer = user.role === "ORGANIZER";
  const organizerEvents = db.competitions.filter(
    (competition) => competition.createdByUserId === user.id,
  );
  const competitions = isOrganizer ? organizerEvents : db.competitions;
  const pendingEvents = competitions.filter(
    (competition) => competition.status === "pending_review",
  );
  const approvedEvents = competitions.filter((competition) => competition.status === "approved");

  const metrics = [
    { key: "users", label: "usuários", value: isOrganizer ? "-" : db.users.length },
    { key: "sessions", label: "sessions", value: isOrganizer ? "-" : db.sessions.length },
    {
      key: "crews",
      label: "crews abertas",
      value: isOrganizer
        ? "-"
        : db.crewSessions.filter((crew) => crew.status === "open").length,
    },
    { key: "pending", label: "circuitos em análise", value: pendingEvents.length },
    { key: "approved", label: "eventos publicados", value: approvedEvents.length },
    { key: "reports", label: "denúncias", value: 0 },
    { key: "badges", label: "badges concedidas", value: db.userBadges.length },
    { key: "uploads", label: "uploads recentes", value: db.media.length },
  ];

  return (
    <AdminShell
      role={user.role}
      title={isOrganizer ? "Seus eventos" : "Painel de controle"}
      description={
        isOrganizer
          ? "Acompanhe seus circuitos, status de análise e ajustes pedidos pela moderação."
          : "Acompanhe o ritmo da comunidade, revise eventos e cuide do que aparece no Sessions."
      }
    >
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metricIcons[metric.key as keyof typeof metricIcons];

          return (
            <div key={metric.key} className="surface rounded-[18px] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-sand-100/48">
                  {metric.label}
                </p>
                <Icon className="h-5 w-5 text-tide-300" />
              </div>
              <p className="mt-4 text-3xl font-black text-white">{metric.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.42fr]">
        <div className="surface rounded-[20px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-kicker">fila</p>
              <h2 className="mt-1 text-2xl font-black text-white">
                Circuitos recentes
              </h2>
            </div>
            <Link href="/admin/circuits" className="secondary-button px-4 py-2">
              ver circuitos
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {competitions.slice(0, 5).map((competition) => (
              <div
                key={competition.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-black text-white">
                    {competition.name}
                  </p>
                  <p className="mt-1 text-xs font-bold text-sand-100/52">
                    {competition.city}, {competition.state} ·{" "}
                    {new Date(competition.startsAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className="w-fit rounded-full border border-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-tide-200">
                  {competition.status.replace("_", " ")}
                </span>
              </div>
            ))}
            {competitions.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm text-sand-100/62">
                Ainda não há eventos cadastrados.
              </p>
            ) : null}
          </div>
        </div>

        <aside className="surface rounded-[20px] p-5">
          <p className="section-kicker">próximos passos</p>
          <div className="mt-5 space-y-3">
            {isOrganizer ? (
              <>
                <Link href="/circuits" className="secondary-button w-full justify-center">
                  cadastrar evento
                </Link>
                <Link href="/admin/circuits" className="secondary-button w-full justify-center">
                  ver meus eventos
                </Link>
              </>
            ) : (
              <>
                <Link href="/admin/moderation" className="secondary-button w-full justify-center">
                  revisar fila
                </Link>
                <Link href="/admin/badges" className="secondary-button w-full justify-center">
                  cuidar das badges
                </Link>
              </>
            )}
          </div>
        </aside>
      </section>
    </AdminShell>
  );
}
