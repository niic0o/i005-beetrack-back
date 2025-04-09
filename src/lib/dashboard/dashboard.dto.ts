// lib/dashboard/dashboard.dto.ts

export type ViewType = "daily" | "range" | "compare";

export interface DashboardParams {
  storeId: string;
  view: ViewType;
  date?: Date;
  fromDate?: Date;
  toDate?: Date;
}

export interface AggregatedReport {
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  totalOrders: number;
  totalProductsSold: number;
  byPaymentMethod: {
    cash: number;
    card: number;
    digital: number;
  };
}

export interface DashboardCompareData {
  current: AggregatedReport;
  previous: AggregatedReport;
}

export type DashboardData = AggregatedReport | DashboardCompareData | null;

