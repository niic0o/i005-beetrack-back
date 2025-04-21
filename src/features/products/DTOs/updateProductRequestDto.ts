import { z } from 'zod';
import { createProductRequestDto } from './createProductRequestDto';

export const updateProductRequestDto = createProductRequestDto
  .omit({ barcode: true, stock: true })
  .extend({ stock: z.coerce.number().nonnegative() })
  .partial();

export type UpdateProductRequestDtoType = z.infer<
  typeof updateProductRequestDto
>;
