import { z } from 'zod';
import { createProductRequestDto } from './createProductRequestDto';

export const productResponseDto = createProductRequestDto
  .omit({
    storeId: true,
  })
  .extend({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

export type ProductResponseDto = z.infer<typeof productResponseDto>;
