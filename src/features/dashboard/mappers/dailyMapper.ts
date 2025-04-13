// lib/dashboard/mappers/dailyMapper.ts

import { AggregatedReport } from "../dashboard.dto";
import { DailyReport } from "@prisma/client";

/**
 * @exports mapDailyReportToAggregated devuelve un objeto con los datos de un reporte diario
 */
export const mapDailyReportToAggregated = (report: DailyReport): AggregatedReport => {
  return {
    totalSales: Number(report.totalSales),
    totalCost: Number(report.totalCost),
    totalProfit: Number(report.totalProfit),
    totalOrders: report.totalOrders,
    totalProductsSold: report.totalProductsSold,
    byPaymentMethod: {
      cash: Number(report.totalCashSales),
      card: Number(report.totalCardSales),
      digital: Number(report.totalDigitalSales),
    },
  };
};

