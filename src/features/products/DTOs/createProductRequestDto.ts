import { z } from 'zod';
import { ProductStatus } from '@prisma/client';
import { zodEnumFromPrisma } from '@/lib/zodEnumFromPrisma';

export const createProductRequestDto = z.object({
  barcode: z.string().nonempty(),
  name: z.string().nonempty(),
  alerts: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean())
    .optional(),
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

export type CreateProductRequestDtoType = z.infer<
  typeof createProductRequestDto
>;
