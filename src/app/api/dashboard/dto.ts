// app/api/dashboard/dto.ts

import { z } from "zod";

export const dashboardQuerySchema = z.object({
  storeId: z.string().min(1, "storeId requerido"),
  view: z.enum(["daily", "range", "compare", "top"]),
  date: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
