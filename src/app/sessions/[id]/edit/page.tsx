import { notFound } from "next/navigation";
import { SessionEditForm } from "@/components/sessions/SessionEditForm";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { findSessionById } from "@/services/sessions";
import { requireUser } from "@/services/users";

type EditSessionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditSessionPage({ params }: EditSessionPageProps) {
  const [{ id }, user] = await Promise.all([params, requireUser()]);
  const session = await findSessionById(id);

  if (!session || session.userId !== user.id) {
    notFound();
  }

  return (
    <div className="page-shell space-y-6 fade-in">
      <SectionTitle
        eyebrow="editar session"
        title={session.title}
        description="Ajuste os dados principais sem perder a memória original."
      />
      <SessionEditForm session={session} />
    </div>
  );
}
