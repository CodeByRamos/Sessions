# Sessions Database

O schema em `database/migrations/0001_initial.sql` descreve a base PostgreSQL esperada para produção: usuários com papéis, sessions, badges, Crew, chat, Circuitos, moderação, mídia e spots.

Para usar PostgreSQL:

1. Crie um banco Postgres.
2. Preencha `DATABASE_URL`.
3. Execute `database/migrations/0001_initial.sql`.
4. Troque o repositório ativo em `src/lib/db.ts` por um adapter Postgres mantendo os contratos `readDb()` e `writeDb()` durante a migração.

Enquanto `DATABASE_URL` não estiver ligado a um adapter Postgres, o app usa `data/sessions-db.json` como fallback de desenvolvimento local. Esse fallback fica isolado em `src/lib/db.ts`; as páginas e APIs consomem services/helpers, não o arquivo JSON diretamente.
