import { z } from 'zod';
import { productResponseDto } from '@/features/products/DTOs/productResponseDto';

// 1. ViewType
export const ViewTypeSchema = z.enum(['daily', 'range', 'compare', 'top', 'now']);

// 2. DashboardParams
export const DashboardParamsSchema = z.object({
  storeId: z.string(),
  view: ViewTypeSchema,
  date: z.coerce.date().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

// 3. AggregatedReport
export const AggregatedReportSchema = z.object({
  totalSales: z.number(),
  totalCost: z.number(),
  totalProfit: z.number(),
  totalOrders: z.number(),
  totalProductsSold: z.number(),
  byPaymentMethod: z.object({
    cash: z.number(),
    card: z.number(),
    digital: z.number(),
  }),
});

// 4. DashboardCompareData
export const DashboardCompareDataSchema = z.object({
  current: AggregatedReportSchema,
  previous: AggregatedReportSchema,
});

// 5. DashboardTopDTO
export const DashboardTopDTOSchema = z.object({
  storeID: z.string(),
  range: z.enum(['daily', 'monthly', 'yearly']),
});

// 6. TopProduct (extiende de Product)

export const TopProductSchema = productResponseDto.extend({
  totalSold: z.number(),
  totalRevenue: z.number(),
});

// 7. DashboardTopData
export const DashboardTopDataSchema = z.object({
  topProducts: z.array(TopProductSchema),
});

// 8. DashboardData (unión)
export const DashboardDataSchema = z.union([
  AggregatedReportSchema,
  DashboardCompareDataSchema,
  DashboardTopDataSchema,
  z.null(),
]);
