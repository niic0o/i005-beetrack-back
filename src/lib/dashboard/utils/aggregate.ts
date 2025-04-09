// lib/dashboard/utils/aggregate.ts

import { AggregatedReport } from "../dashboard.dto";
import { DailyReport } from "@prisma/client";

export const aggregateReports = (reports: DailyReport[]): AggregatedReport => {
  return reports.reduce(
    (acc, curr) => {
      acc.totalSales += Number(curr.totalSales);
      acc.totalCost += Number(curr.totalCost);
      acc.totalProfit += Number(curr.totalProfit);
      acc.totalOrders += curr.totalOrders;
      acc.totalProductsSold += curr.totalProductsSold;

      acc.byPaymentMethod.cash += Number(curr.totalCashSales);
      acc.byPaymentMethod.card += Number(curr.totalCardSales);
      acc.byPaymentMethod.digital += Number(curr.totalDigitalSales);

      return acc;
    },
    {
      totalSales: 0,
      totalCost: 0,
      totalProfit: 0,
      totalOrders: 0,
      totalProductsSold: 0,
      byPaymentMethod: {
        cash: 0,
        card: 0,
        digital: 0,
      },
    }
  );
};
