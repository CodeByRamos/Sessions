# Sessions

Sessions é uma plataforma social de surf: diário cinematográfico, feed da comunidade, evolução por badges, Crew para combinar quedas, Circuitos para eventos e mapa dos picos surfados.

## Stack

- Frontend: Next.js App Router, TypeScript e Tailwind CSS.
- Runtime atual: API Routes do Next.js.
- Banco: PostgreSQL via `pg`.
- Upload: Cloudinary unsigned upload.
- Mapa: Mapbox GL JS.
- Backend separado: FastAPI iniciado em `backend/`.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Banco

Com Postgres configurado:

```bash
npm run db:seed
```

O runtime usa Postgres quando `DATABASE_URL` existe. Em desenvolvimento, se essa variável não estiver configurada, o app usa `data/sessions-db.json` como fallback local. Em produção, configure `DATABASE_URL`.

## Variáveis

Veja `.env.example`.

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/sessions
DATABASE_SSL=false
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_UPLOAD_PRESET=
NEXT_PUBLIC_MAPBOX_TOKEN=
SESSIONS_BASE_URL=http://127.0.0.1:3000
```

## Comandos úteis

```bash
npm run typecheck
npm run build
npm run test:smoke
```

## FastAPI

A base de backend separado está em `backend/`. O frontend ainda usa API Routes para manter o produto navegável durante a migração gradual.
