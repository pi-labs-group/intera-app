import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Cliente Prisma único da aplicação, criado na primeira chamada. A validação da
 * `DATABASE_URL` fica aqui dentro, e não no topo do módulo, para que importar um
 * repositório (por exemplo, durante o `next build`) não exija o banco configurado.
 *
 * Em desenvolvimento o hot reload reavalia este módulo a cada mudança; guardar a
 * instância em globalThis evita abrir um pool de conexões novo a cada recarga.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

let client: PrismaClient | undefined;

export function db(): PrismaClient {
  client ??= globalForPrisma.prisma;
  if (!client) {
    const databaseUrl = z.url().parse(process.env.DATABASE_URL);
    client = new PrismaClient({
      adapter: new PrismaPg({ connectionString: databaseUrl }),
    });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }
  }
  return client;
}
