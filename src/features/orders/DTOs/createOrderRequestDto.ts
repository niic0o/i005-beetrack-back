import { zodEnumFromPrisma } from '@/lib/zodEnumFromPrisma';
import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const createOrderRequestDto = z.object({
  storeId: z.string().nonempty(),
  discountRate: z.number().optional(),
  paymentMethod: zodEnumFromPrisma(PaymentMethod).optional(),
  orderItems: z.array(
    z.object({
      productId: z.string().nonempty(),
      quantity: z.number().min(1),
    })
  ),
});

export type CreateOrderRequestDto = z.infer<typeof createOrderRequestDto>;
