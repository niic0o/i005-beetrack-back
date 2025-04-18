// lib/dashboard/dashboard.service.ts

import { prisma } from "@/lib/prisma";
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
import {
  startOfDay,
  endOfDay,
  cloneDate,
  startOfLocalDay,
  endOfLocalDay,
} from "./utils/date";

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
            gte: startOfLocalDay(date),
            lt: endOfLocalDay(date),
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
            gte: startOfLocalDay(fromDate),
            lte: endOfLocalDay(toDate),
          },
        },
      });

      return aggregateReports(rangeReports);
    case "top":
      if ((!fromDate || !toDate) && date) {
        fromDate = startOfLocalDay(date);
        toDate = endOfLocalDay(date);
      }

      if (fromDate && toDate) {
        fromDate = startOfLocalDay(fromDate);
        toDate = endOfLocalDay(toDate);
      }

      if (!fromDate || !toDate)
        throw new Error(
          "Se requiere 'date' o 'fromDate' y 'toDate' para vista de top productos"
        );

      const topProducts = await prisma.orderLines.groupBy({
        by: ["productId"],
        where: {
          order: {
            storeId,
            createdAt: {
              gte: fromDate,
              lte: toDate,
            },
          },
        },
        _sum: {
          quantity: true,
          totalSalesPrice: true,
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
            totalRevenue: item._sum.totalSalesPrice || 0,
          };
        })
      );

      return {
        topProducts: topWithDetails.filter((p): p is TopProduct => p !== null),
      } satisfies DashboardTopData;

      //nueva funcion, reporte actual en tiempo real
      case "now":
        // evita que se procese fecha en una consulta a la bdd compleja.
  const todayStart = startOfLocalDay(new Date());
  const todayEnd = endOfLocalDay(new Date());

  const todayOrders = await prisma.order.findMany({
    where: {
      storeId,
      status: "PAID",
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    include: {
      orderItems: {
        include: {
          product: true, // Incluimos el producto para obtener el costo
        },
      },
      payment: true,
    },
  });

  if (todayOrders.length === 0) {
    return {
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
    } satisfies AggregatedReport;
  }

  const totalSales = todayOrders.reduce((sum, order) => {
    const items = order.orderItems ?? [];
    return sum + items.reduce((lineSum, item) => lineSum + Number(item.totalSalesPrice), 0);
  }, 0);

  const totalCost = todayOrders.reduce((sum, order) => {
    const items = order.orderItems ?? [];
    return sum + items.reduce((lineSum, item) => lineSum + (Number(item.product?.costPrice) || 0) * item.quantity, 0); // Multiplicamos por la cantidad
  }, 0);

  const totalOrders = todayOrders.length;

  const totalProductsSold = todayOrders.reduce((sum, order) => {
    const items = order.orderItems ?? [];
    return sum + items.reduce((lineSum, item) => lineSum + item.quantity, 0);
  }, 0);

  const byPaymentMethod = {
    cash: todayOrders
      .filter((o) => o.payment?.name === "CASH")
      .reduce((sum, o) => sum + Number(o.totalAmount), 0),
    card: todayOrders
      .filter((o) => o.payment?.name === "CARD")
      .reduce((sum, o) => sum + Number(o.totalAmount), 0),
    digital: todayOrders
      .filter((o) => o.payment?.name === "DIGITAL")
      .reduce((sum, o) => sum + Number(o.totalAmount), 0),
  };

  return {
    totalSales,
    totalCost,
    totalProfit: totalSales - totalCost,
    totalOrders,
    totalProductsSold,
    byPaymentMethod,
  } satisfies AggregatedReport;

    /*
    Esta funcionalidad necesita revision!!
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
      */

    default:
      throw new Error("Vista inválida");
  }
};
