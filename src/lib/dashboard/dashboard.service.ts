// lib/dashboard/dashboard.service.ts

import { PrismaClient } from "@prisma/client";
import {
  DashboardParams,
  DashboardData,
  AggregatedReport,
  DashboardCompareData,
  DashboardTopData,
  TopProduct,
} from "./dashboard.dto";
import { mapDailyReportToAggregated } from "./mappers/dailyMapper";
import { aggregateReports } from "./utils/aggregate";
import { startOfDay, endOfDay, cloneDate } from "./utils/date";

const prisma = new PrismaClient();

/**
 * Función principal que obtiene los datos necesarios para el dashboard
 * según el tipo de vista solicitado por el cliente (`daily`, `range` o `compare`).
 *
 * @param storeId - ID de la tienda.
 * @param view - Tipo de vista solicitada:
 *    - `"daily"`: reporte de un único día (requiere `date`).
 *    - `"range"`: reporte agregado en un rango de fechas (requiere `fromDate` y `toDate`).
 *    - `"compare"`: compara dos rangos de fechas equivalentes (requiere `fromDate` y `toDate`).
 * @param date - Fecha específica para vista `"daily"`.
 * @param fromDate - Fecha inicial del rango (inclusive) para `"range"` o `"compare"`.
 * @param toDate - Fecha final del rango (inclusive) para `"range"` o `"compare"`.
 *
 * @returns Datos procesados del dashboard en formato agregado. En caso de vista `"compare"`,
 * devuelve tanto los datos actuales como los del rango anterior.
 *
 * @throws Error si faltan parámetros requeridos según la vista seleccionada, o si la vista no es válida.
 */

export const getDashboardData = async ({
  storeId,
  view,
  date,
  fromDate,
  toDate,
}: DashboardParams): Promise<DashboardData> => {
  switch (view) {
    case "daily":
      if (!date) throw new Error("Se requiere 'date' para la vista diaria");

      const dailyReport = await prisma.dailyReport.findFirst({
        where: {
          storeId,
          createdAt: {
            gte: startOfDay(date),
            lt: endOfDay(cloneDate(date)),
          },
        },
      });

      return dailyReport ? mapDailyReportToAggregated(dailyReport) : null;

    case "range":
      if (!fromDate || !toDate)
        throw new Error(
          "Se requieren 'fromDate' y 'toDate' para vista de rango"
        );

      const rangeReports = await prisma.dailyReport.findMany({
        where: {
          storeId,
          createdAt: {
            gte: startOfDay(fromDate),
            lte: endOfDay(toDate),
          },
        },
      });

      return aggregateReports(rangeReports);

    case "compare":
      if (!fromDate || !toDate)
        throw new Error(
          "Se requieren 'fromDate' y 'toDate' para vista comparativa"
        );

      const rangeLength = toDate.getTime() - fromDate.getTime();
      const previousToDate = new Date(cloneDate(fromDate).getTime() - 1);
      const previousFromDate = new Date(previousToDate.getTime() - rangeLength);

      const [currentReports, previousReports] = await Promise.all([
        prisma.dailyReport.findMany({
          where: {
            storeId,
            createdAt: {
              gte: startOfDay(fromDate),
              lte: endOfDay(toDate),
            },
          },
        }),
        prisma.dailyReport.findMany({
          where: {
            storeId,
            createdAt: {
              gte: startOfDay(previousFromDate),
              lte: endOfDay(previousToDate),
            },
          },
        }),
      ]);

      return {
        current: aggregateReports(currentReports),
        previous: aggregateReports(previousReports),
      } satisfies DashboardCompareData;

    case "top":
      if (!fromDate || !toDate)
        throw new Error(
          "Se requieren 'fromDate' y 'toDate' para vista de top productos"
        );

      const topProducts = await prisma.orderLines.groupBy({
        by: ["productId"],
        where: {
          order: {
            storeId,
            createdAt: {
              gte: startOfDay(fromDate),
              lte: endOfDay(toDate),
            },
          },
        },
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 10,
      });

      const topWithDetails = await Promise.all(
        topProducts.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) return null;

          return {
            ...product,
            totalSold: item._sum.quantity || 0,
          };
        })
      );

      // Filtramos nulos en caso de productos eliminados
      return {
        topProducts: topWithDetails.filter((p): p is TopProduct => p !== null),
      } satisfies DashboardTopData;
    default:
      throw new Error("Vista inválida");
  }
};
