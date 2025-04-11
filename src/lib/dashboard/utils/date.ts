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

export const startOfLocalDay = (date: Date) => {
    const local = new Date(date);
    local.setHours(0, 0, 0, 0); // 00:00:00.000 en horario local
    return local;
  };
  
  export const endOfLocalDay = (date: Date) => {
    const local = new Date(date);
    local.setHours(23, 59, 59, 999); // 23:59:59.999 en horario local
    return local;
  };

  export const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // OJO: los meses en JS van de 0 a 11
  };