import { z } from 'zod';
import { createUserRequestDto } from './createUserRequestDto';

export const createUserResponseDto = createUserRequestDto
  .omit({
    password: true,
    userTypeID: true,
  })
  .extend({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  });
