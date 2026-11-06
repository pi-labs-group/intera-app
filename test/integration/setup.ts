/**
 * Preparação dos testes de integração. Eles rodam contra um banco Postgres de
 * teste (`TEST_DATABASE_URL`), que é APAGADO a cada arquivo de teste: aplica as
 * migrações, esvazia as tabelas e roda o seed.
 *
 * Travas de segurança, para nunca apagar o banco compartilhado do Supabase:
 *   - sem `TEST_DATABASE_URL`, os testes são pulados (`integrationEnabled`);
 *   - `TEST_DATABASE_URL` igual à `DATABASE_URL` aborta;
 *   - host diferente de localhost/127.0.0.1 aborta, salvo `ALLOW_TEST_DB_RESET=1`.
 */
import { execSync } from "node:child_process";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), true);

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
// Lida antes de qualquer sobrescrita, para a comparação de segurança.
const appDatabaseUrl = process.env.DATABASE_URL;

export const integrationEnabled = Boolean(testDatabaseUrl);

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function assertSafeTestDatabase(url: string): void {
  if (url === appDatabaseUrl) {
    throw new Error(
      "TEST_DATABASE_URL é igual à DATABASE_URL. Os testes de integração apagam o banco; use um banco separado.",
    );
  }
  const { hostname } = new URL(url);
  if (!LOCAL_HOSTS.has(hostname) && process.env.ALLOW_TEST_DB_RESET !== "1") {
    throw new Error(
      `TEST_DATABASE_URL aponta para "${hostname}", que não é local. Defina ALLOW_TEST_DB_RESET=1 só se tiver certeza de que é um banco descartável.`,
    );
  }
}

/**
 * Deixa o banco de teste no estado do seed. Também aponta `DATABASE_URL` deste
 * processo para o banco de teste, pois os repositórios usam `db()`.
 */
export async function resetTestDatabase(): Promise<void> {
  if (!testDatabaseUrl) throw new Error("TEST_DATABASE_URL não definida.");
  assertSafeTestDatabase(testDatabaseUrl);

  process.env.DATABASE_URL = testDatabaseUrl;
  const env = {
    ...process.env,
    DATABASE_URL: testDatabaseUrl,
    DIRECT_URL: testDatabaseUrl,
  };
  execSync("npx prisma migrate deploy", { env, stdio: "inherit" });

  const { db } = await import("@/server/db/prisma");
  const tables = await db().$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (tables.length > 0) {
    const list = tables.map(({ tablename }) => `"${tablename}"`).join(", ");
    await db().$executeRawUnsafe(`TRUNCATE ${list} RESTART IDENTITY CASCADE`);
  }

  execSync("npx tsx prisma/seed.ts", { env, stdio: "inherit" });
}

/** Executa o seed de novo, sem limpar (para o teste de idempotência). */
export function runSeed(): void {
  if (!testDatabaseUrl) throw new Error("TEST_DATABASE_URL não definida.");
  assertSafeTestDatabase(testDatabaseUrl);
  execSync("npx tsx prisma/seed.ts", {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: "inherit",
  });
}
