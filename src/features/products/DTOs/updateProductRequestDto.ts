import { z } from 'zod';
import { createProductRequestDto } from './createProductRequestDto';

export const updateProductRequestDto = createProductRequestDto.partial();

export type UpdateProductRequestDtoType = z.infer<
  typeof updateProductRequestDto
>;
