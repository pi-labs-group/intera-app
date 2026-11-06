import "server-only";

import type { Prisma, PrismaClient } from "@/generated/prisma/client";

/**
 * Cliente aceito pelos repositórios de escrita: o cliente global ou o de uma
 * transação interativa, para o serviço agrupar checagens e gravações.
 */
export type DbClient = PrismaClient | Prisma.TransactionClient;

/** Converte um Decimal do banco em número, sem ruído além de 2 casas. */
export function decimalToNumber(value: Prisma.Decimal): number {
  return value.toDecimalPlaces(2).toNumber();
}
