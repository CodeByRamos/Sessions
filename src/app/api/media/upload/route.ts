import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { createId, readDb, writeDb } from "@/lib/db";
import { dataUrlByteSize, isImageDataUrl } from "@/lib/validation";

type UploadFolder = "avatars" | "sessions" | "circuits" | "proofs";

type UploadResponse = {
  url: string;
  provider: "cloudinary";
  bytes: number;
  publicId?: string;
};

const folderLimits: Record<UploadFolder, number> = {
  avatars: 3 * 1024 * 1024,
  sessions: 8 * 1024 * 1024,
  circuits: 8 * 1024 * 1024,
  proofs: 10 * 1024 * 1024,
};

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json({ error: "Faça login para enviar imagens." }, { status: 401 });
  }

  const body = (await request.json()) as {
    file?: string;
    dataUrl?: string;
    folder?: UploadFolder;
  };
  const file = String(body.file ?? body.dataUrl ?? "");
  const folder = body.folder ?? "sessions";

  if (!isImageDataUrl(file)) {
    return NextResponse.json(
      { error: "Envie uma imagem PNG, JPG ou WebP." },
      { status: 400 },
    );
  }

  const bytes = dataUrlByteSize(file);
  if (bytes > folderLimits[folder]) {
    return NextResponse.json(
      { error: "Essa imagem está grande demais." },
      { status: 400 },
    );
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return NextResponse.json(
      { error: "Não foi possível enviar a imagem agora." },
      { status: 503 },
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);
  form.append("folder", `sessions/${folder}`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: form,
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Não foi possível enviar a imagem agora." },
      { status: 502 },
    );
  }

  const data = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    format?: string;
  };

  if (!data.secure_url) {
    return NextResponse.json(
      { error: "Não foi possível salvar a imagem." },
      { status: 502 },
    );
  }

  const db = await readDb();
  db.media.unshift({
    id: createId("media"),
    ownerUserId: user.id,
    url: data.secure_url,
    provider: "cloudinary",
    mimeType: data.format ? `image/${data.format}` : undefined,
    bytes,
    publicId: data.public_id,
    createdAt: new Date().toISOString(),
  });
  await writeDb(db);

  return NextResponse.json({
    url: data.secure_url,
    provider: "cloudinary",
    bytes,
    publicId: data.public_id,
  } satisfies UploadResponse);
}
