import { z } from 'zod';
import { registerUserAndStoreDto } from './createUserRequestDto';

export const updateUserRequestDto = registerUserAndStoreDto
  .pick({
    name: true,
    last_name: true,
    email: true,
  })
  .extend({
    avatar: z.string().max(250),
    cloudinary_id: z.string().max(250),
  })  
  .partial();

export type UpdateUserRequestDtoType = z.infer<
  typeof updateUserRequestDto
>;