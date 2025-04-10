// lib/dashboard/utils/date.ts

/**
 * Utilidades para manipular fechas sin modificar el objeto original.
 * - Permite obtener el inicio o fin del día de una fecha dada.
 * - Clona una fecha para evitar efectos secundarios, ya que el objeto Date es mutable.
 * 
 * Estas funciones evitan repetir lógica de seteo de horas y previenen errores por mutación del objeto Date.
 */

export const startOfDay = (date: Date): Date => new Date(date.setHours(0, 0, 0, 0));

export const endOfDay = (date: Date): Date => new Date(date.setHours(23, 59, 59, 999));

export const cloneDate = (date: Date): Date => new Date(date.getTime());