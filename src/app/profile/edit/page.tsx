import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { requireUser } from "@/services/users";

export default async function ProfileEditPage() {
  const user = await requireUser();

  return (
    <div className="page-shell space-y-6 fade-in">
      <SectionTitle
        eyebrow="perfil"
        title="Editar conta"
        description="Ajuste sua identidade de surfista: nome, avatar, bio, praia local, nível e prancha favorita."
      />
      <ProfileEditForm user={user} />
    </div>
  );
}
