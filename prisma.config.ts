import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// O Prisma CLI não lê .env.local; carregamos os .env* com a mesma precedência do Next.
// Sem o segundo argumento o @next/env assumiria modo produção; o CLI roda em dev.
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations usam o Session pooler; o Transaction pooler (DATABASE_URL) não
    // mantém a sessão que o Prisma Migrate precisa.
    // process.env em vez de env() para `prisma generate` rodar sem banco (CI, postinstall).
    url: process.env.DIRECT_URL,
  },
});
