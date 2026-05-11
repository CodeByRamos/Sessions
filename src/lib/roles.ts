import { NextResponse, type NextRequest } from "next/server";
import { getRequestUser } from "@/lib/auth";
import type { UserRole } from "@/types/user";

const roleRank: Record<UserRole, number> = {
  USER: 1,
  ORGANIZER: 2,
  MODERATOR: 3,
  ADMIN: 4,
};

export function hasRole(userRole: UserRole | undefined, allowedRoles: UserRole[]) {
  if (!userRole) {
    return false;
  }

  return allowedRoles.includes(userRole);
}

export function hasMinimumRole(userRole: UserRole | undefined, minimumRole: UserRole) {
  if (!userRole) {
    return false;
  }

  return roleRank[userRole] >= roleRank[minimumRole];
}

export function canModerate(userRole: UserRole | undefined) {
  return hasRole(userRole, ["MODERATOR", "ADMIN"]);
}

export function canCreateCircuit(userRole: UserRole | undefined) {
  return hasRole(userRole, ["ORGANIZER", "MODERATOR", "ADMIN"]);
}

export async function requireApiRole(request: NextRequest, roles: UserRole[]) {
  const user = await getRequestUser(request);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Faça login para continuar." }, { status: 401 }),
    };
  }

  if (!hasRole(user.role, roles)) {
    return {
      user,
      response: NextResponse.json(
        { error: "Você não tem permissão para essa ação." },
        { status: 403 },
      ),
    };
  }

  return { user, response: null };
}
