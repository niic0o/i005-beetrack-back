import { z } from 'zod';
import { registerUserAndStoreDto } from './createUserRequestDto';

export const updateUserRequestDto = registerUserAndStoreDto
  .pick({
    name: true,
    last_name: true,
    email: true,
  })  
  .partial();

export type UpdateUserRequestDtoType = z.infer<
  typeof updateUserRequestDto
>;