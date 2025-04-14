// lib/dashboard/utils/date.ts

/**
 * Devuelve una nueva instancia de Date configurada a las 00:00:00.000 **en horario local**.
 * No modifica la fecha original.
 */
export const startOfLocalDay = (date: Date): Date => {
    const local = new Date(date);
    local.setHours(0, 0, 0, 0); // 00:00:00.000 hora local
    return local;
  };
  
  /**
   * Devuelve una nueva instancia de Date configurada a las 23:59:59.999 **en horario local**.
   * No modifica la fecha original.
   */
  export const endOfLocalDay = (date: Date): Date => {
    const local = new Date(date);
    local.setHours(23, 59, 59, 999); // 23:59:59.999 hora local
    return local;
  };
  
  /**
   * Parsea un string en formato 'yyyy-mm-dd' y devuelve una instancia de Date con hora 00:00:00
   * **en horario local**, sin desplazamiento UTC.
   *
   * Ejemplo: '2025-04-09' => Date con Thu Apr 09 2025 00:00:00 GMT-0300 (hora Argentina)
   */
  export const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // Mes va de 0 a 11
  };
  
  /**
   * Devuelve la misma instancia `date` modificada a las 00:00:00.000.
   *  Esta función **muta** el objeto original.
   *  El resultado puede verse afectado por el timezone (UTC shift).
   */
  export const startOfDay = (date: Date): Date => new Date(date.setHours(0, 0, 0, 0));
  
  /**
   * Devuelve la misma instancia `date` modificada a las 23:59:59.999.
   *  Esta función **muta** el objeto original.
   *  El resultado puede verse afectado por el timezone (UTC shift).
   */
  export const endOfDay = (date: Date): Date => new Date(date.setHours(23, 59, 59, 999));
  
  /**
   * Devuelve una copia exacta de la fecha recibida, evitando mutar el objeto original.
   */
  export const cloneDate = (date: Date): Date => new Date(date.getTime());
  
