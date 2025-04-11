import { z } from 'zod';

export const createProductRequestDto = z.object({
  name: z.string().nonempty(),
  storeId: z.string().nonempty(),
  salesPrice: z.number(),
  costPrice: z.number(),
  stock: z.number(),
  stock_optimus: z.number(),
  stock_min: z.number(),
  imagePath: z.string(),
  cloudinary_id: z.string(),
  description: z.string(),
});

export type CreateProductRequestDtoType = z.infer<typeof createProductRequestDto>;