// lib/dashboard/dashboard.service.ts

import { PrismaClient } from "@prisma/client";
import {
  DashboardParams,
  DashboardData,
  AggregatedReport,
  DashboardCompareData,
} from "./dashboard.dto";
import { mapDailyReportToAggregated } from "./mappers/dailyMapper";
import { aggregateReports } from "./utils/aggregate";
import { startOfDay, endOfDay, cloneDate } from "./utils/date";

const prisma = new PrismaClient();

export const getDashboardData = async ({ storeId, view, date, fromDate, toDate }: DashboardParams): Promise<DashboardData> => {
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
      if (!fromDate || !toDate) throw new Error("Se requieren 'fromDate' y 'toDate' para vista de rango");

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
      if (!fromDate || !toDate) throw new Error("Se requieren 'fromDate' y 'toDate' para vista comparativa");

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

    default:
      throw new Error("Vista inválida");
  }
};


