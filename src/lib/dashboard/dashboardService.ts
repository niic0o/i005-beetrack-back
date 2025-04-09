import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type ViewType = "daily" | "range" | "compare";

interface DashboardParams {
  storeId: string;
  view: ViewType;
  date?: Date;
  fromDate?: Date;
  toDate?: Date;
}

export const getDashboardData = async ({ storeId, view, date, fromDate, toDate }: DashboardParams) => {
  if (view === "daily") {
    if (!date) throw new Error("Se requiere 'date' para la vista diaria");

    const report = await prisma.dailyReport.findFirst({
      where: {
        storeId,
        createdAt: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
    });

    if (!report) return null;

    return {
      totalSales: report.totalSales,
      totalCost: report.totalCost,
      totalProfit: report.totalProfit,
      totalOrders: report.totalOrders,
      totalProductsSold: report.totalProductsSold,
      byPaymentMethod: {
        cash: report.totalCashSales,
        card: report.totalCardSales,
        digital: report.totalDigitalSales,
      },
    };
  }

  if (view === "range") {
    if (!fromDate || !toDate) throw new Error("Se requieren 'fromDate' y 'toDate' para vista de rango");

    const reports = await prisma.dailyReport.findMany({
      where: {
        storeId,
        createdAt: {
          gte: new Date(fromDate.setHours(0, 0, 0, 0)),
          lte: new Date(toDate.setHours(23, 59, 59, 999)),
        },
      },
    });

    const aggregated = reports.reduce(
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

    return aggregated;
  }

  if (view === "compare") {
    if (!fromDate || !toDate) throw new Error("Se requieren 'fromDate' y 'toDate' para vista comparativa");

    const previousRange = new Date(fromDate);
    const rangeLength = toDate.getTime() - fromDate.getTime();
    const previousToDate = new Date(previousRange.getTime() - 1);
    const previousFromDate = new Date(previousToDate.getTime() - rangeLength);

    const [currentReports, previousReports] = await Promise.all([
      prisma.dailyReport.findMany({
        where: {
          storeId,
          createdAt: {
            gte: new Date(fromDate.setHours(0, 0, 0, 0)),
            lte: new Date(toDate.setHours(23, 59, 59, 999)),
          },
        },
      }),
      prisma.dailyReport.findMany({
        where: {
          storeId,
          createdAt: {
            gte: new Date(previousFromDate.setHours(0, 0, 0, 0)),
            lte: new Date(previousToDate.setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    const aggregate = (reports: typeof currentReports) =>
      reports.reduce(
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

    return {
      current: aggregate(currentReports),
      previous: aggregate(previousReports),
    };
  }

  throw new Error("Vista inválida");
};
