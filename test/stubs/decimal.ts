import type { Prisma } from "@/generated/prisma/client";

/** Decimal mínimo para testes de serviço: só o que `decimalToNumber` usa. */
export function decimal(value: number): Prisma.Decimal {
  return {
    toDecimalPlaces: () => ({ toNumber: () => value }),
  } as unknown as Prisma.Decimal;
}
