import { z } from 'zod';

export const createStoreRequestDto = z.object({
  name: z.string().nonempty(),
  address: z.string().nonempty(),
  userID: z.string().nonempty(),
  tel: z.string(),
});

export type CreateStoreRequestDtoType = z.infer<typeof createStoreRequestDto>;
