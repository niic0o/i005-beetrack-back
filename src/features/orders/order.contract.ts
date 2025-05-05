import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import { initContract } from '@ts-rest/core';
import { zodEnumFromPrisma } from '@/lib/zodEnumFromPrisma';
import { PaymentMethod } from '@prisma/client';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
extendZodWithOpenApi(z);
const c = initContract();

export const OrderResponseSchema = z.object({
  id: z.string(),
  status: zodEnumFromPrisma(OrderStatus),
  pdfPath: z.string().nullable(),
  subTotalAmount: z.number(),
  totalAmount: z.number(),
  payment: z.object({ id: z.string(), name: zodEnumFromPrisma(PaymentMethod) }),
  discount: z.object({ id: z.string(), rate: z.number() }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const orderContract = c.router({
  createOrder: {
    method: 'POST',
    path: '/api/orders',
    responses: {
      201: OrderResponseSchema,
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
        message: z.string().openapi({ example: 'Some internal server error' }),
      }),
    },
    contentType: 'application/json',
    body: z.object({
      discountRate: z.number().optional().openapi({ example: 10 }),
      paymentMethod: zodEnumFromPrisma(PaymentMethod).optional(),
      orderItems: z
        .array(
          z.object({
            productId: z.string().nonempty(),
            quantity: z.number().int().min(1),
          })
        )
        .nonempty(),
    }),
    summary: 'Create an order',
    metadata: { requiresAuth: true },
  },
  getOrders: {
    method: 'GET',
    path: '/api/orders',
    responses: {
      200: z.array(OrderResponseSchema),
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
        message: z.string().openapi({ example: 'Some internal server error' }),
      }),
    },
    query: z.object({
      limit: z.number().int().optional().openapi({ example: 20 }),
    }),
    summary: 'Get most recent orders (10 orders by default)',
    metadata: { requiresAuth: true },
  },
});
