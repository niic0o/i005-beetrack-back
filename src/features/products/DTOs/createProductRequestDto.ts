import { z } from 'zod';

export const createProductRequestDto = z.object({
  name: z.string().nonempty(),
  storeId: z.string().nonempty(),
  salesPrice: z.coerce.number(),
  costPrice: z.coerce.number(),
  stock: z.coerce.number(),
  stock_optimus: z.coerce.number(),
  stock_min: z.coerce.number(),
  imagePath: z.string(),
  cloudinary_id: z.string(),
  description: z.string(),
  status: z.enum(['AVAILABLE', 'LIMITED', 'SOLDOUT']),
});

export type CreateProductRequestDtoType = z.infer<typeof createProductRequestDto>;