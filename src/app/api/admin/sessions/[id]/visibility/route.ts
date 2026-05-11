import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { requireApiRole } from "@/lib/roles";

type VisibilityRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: VisibilityRouteProps) {
  const { response } = await requireApiRole(request, ["MODERATOR", "ADMIN"]);

  if (response) {
    return response;
  }

  const { id } = await params;
  const body = (await request.json()) as { isPublic?: boolean };

  if (typeof body.isPublic !== "boolean") {
    return NextResponse.json({ error: "Escolha uma ação válida." }, { status: 400 });
  }

  const db = await readDb();
  const session = db.sessions.find((item) => item.id === id);

  if (!session) {
    return NextResponse.json({ error: "Session não encontrada." }, { status: 404 });
  }

  session.isPublic = body.isPublic;
  session.updatedAt = new Date().toISOString();
  await writeDb(db);

  return NextResponse.json({ session });
}
