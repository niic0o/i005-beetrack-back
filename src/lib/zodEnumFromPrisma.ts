import { z } from 'zod';

/**
 * Crea un Zod enum válido a partir de un enum de Prisma.
 *
 * @param prismaEnum - El enum exportado desde @prisma/client
 */
export function zodEnumFromPrisma<T extends Record<string, string>>(prismaEnum: T) {
  return z.enum([...Object.values(prismaEnum)] as [T[keyof T], ...T[keyof T][]]);
}
