import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Cliente Prisma único da aplicação. Em desenvolvimento o hot reload reavalia este
 * módulo a cada mudança; guardar a instância em globalThis evita abrir um pool de
 * conexões novo a cada recarga.
 */

const databaseUrl = z.url().parse(process.env.DATABASE_URL);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
