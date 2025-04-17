import { prisma } from "@/lib/prisma";

/**
 * Ejecuta la función SQL cerrar_caja_diaria() y devuelve la cantidad de reportes generados
 */
export async function ejecutarCierreCajaSQL(): Promise<number> {
  const result = await prisma.$queryRaw<{ cerrar_caja_diaria: number }[]>`
    SELECT cerrar_caja_diaria();
  `;

  return result?.[0]?.cerrar_caja_diaria ?? 0;
}