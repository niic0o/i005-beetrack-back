// app/api/dashboard/dto.ts

import { z } from "zod";

export const dashboardQuerySchema = z.object({
  view: z.enum(["daily", "range", "compare", "top"]),
  date: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
}).strict();

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
