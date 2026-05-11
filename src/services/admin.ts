import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth";
import { hasRole } from "@/lib/roles";
import type { UserRole } from "@/types/user";

export async function requirePanelUser(roles: UserRole[]) {
  const user = await requireCurrentUser();

  if (!hasRole(user.role, roles)) {
    redirect("/");
  }

  return user;
}
