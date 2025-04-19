import { z } from 'zod';
import { createProductRequestDto } from './createProductRequestDto';

export const updateProductRequestDto = createProductRequestDto
  .omit({ barcode: true })
  .partial();

export type UpdateProductRequestDtoType = z.infer<
  typeof updateProductRequestDto
>;
