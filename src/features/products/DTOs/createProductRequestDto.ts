import { z } from 'zod';
import { ProductStatus } from '@prisma/client';
import { zodEnumFromPrisma } from '@/lib/zodEnumFromPrisma';

export const createProductRequestDto = z.object({
  name: z.string().nonempty(),
  storeId: z.string().nonempty(),
  salesPrice: z.coerce.number().positive(),
  costPrice: z.coerce.number().positive(),
  stock: z.coerce.number().int().nonnegative(),
  stock_optimus: z.coerce.number().int().nonnegative(),
  stock_min: z.coerce.number().int().nonnegative(),
  imagePath: z.string(),
  cloudinary_id: z.string(),
  description: z.string(),
  status: zodEnumFromPrisma(ProductStatus),
});

export type CreateProductRequestDtoType = z.infer<typeof createProductRequestDto>;