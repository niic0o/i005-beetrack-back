import { DashboardDataSchema } from './dashboard.zodSchema';
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
extendZodWithOpenApi(z);
const c = initContract();

export const dashboardContract = c.router({
  getDashboardData: {
    method: 'GET',
    path: '/api/dashboard',
    query: z.object({
      view: z.enum(['daily', 'range', 'compare', 'top', 'now']),
      date: z.date().optional(),
      fromDate: z.date().optional(),
      toDate: z.date().optional(),
    }),
    responses: {
      200: DashboardDataSchema,
      401: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'No ha iniciado sesión' }),
      }),
      400: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z.string().openapi({ example: 'Some validation error' }),
      }),
      500: z.object({
        status: z.string().openapi({ example: 'fail' }),
        message: z
          .string()
          .openapi({ example: 'Some internal server error' }),
      }),
    },
    summary: 'Returns dashboard data, according to the provided parameters',
    metadata: { requiresAuth: true },
  },
});
