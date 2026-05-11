import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { requireApiRole } from "@/lib/roles";
import type { UserRole } from "@/types/user";

type UpdateRoleRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const roles: UserRole[] = ["USER", "ORGANIZER", "MODERATOR", "ADMIN"];

export async function PATCH(request: NextRequest, { params }: UpdateRoleRouteProps) {
  const { response } = await requireApiRole(request, ["ADMIN"]);

  if (response) {
    return response;
  }

  const { id } = await params;
  const body = (await request.json()) as { role?: UserRole };

  if (!body.role || !roles.includes(body.role)) {
    return NextResponse.json({ error: "Escolha um papel válido." }, { status: 400 });
  }

  const db = await readDb();
  const user = db.users.find((item) => item.id === id);

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  user.role = body.role;
  user.updatedAt = new Date().toISOString();
  await writeDb(db);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
