import { readFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL não configurado.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl:
    process.env.DATABASE_SSL === "true"
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
});

const migration = await readFile(
  path.join(process.cwd(), "database", "migrations", "0001_initial.sql"),
  "utf8",
);

await pool.query(migration);

const [dbModule, postgresModule] = await Promise.all([
  import("../src/lib/db.ts"),
  import("../src/lib/postgres-db.ts"),
]);
const { createSeedDb } = dbModule.default ?? dbModule;
const { writePostgresDb } = postgresModule.default ?? postgresModule;

await writePostgresDb(createSeedDb());
await pool.end();
console.log("Seed do Sessions aplicado no Postgres.");
